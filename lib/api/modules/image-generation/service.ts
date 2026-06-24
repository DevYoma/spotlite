import sharp, { type OverlayOptions } from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getTemplateById } from "../templates/service";
import { getSubmissionById } from "../submissions/service";
import { getProjectById } from "../projects/service";
import {
  saveGeneratedImageDb,
  getGeneratedImagesForSubmissionDb,
  deleteGeneratedImageDb,
} from "./repository";
import type { LayoutElement } from "../templates/types";

const s3Client = new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT || undefined,
  region: process.env.STORAGE_REGION || "auto",
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true,
});

const BUCKET = process.env.STORAGE_BUCKET_NAME || "spotlite";
const PUBLIC_BASE = process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL || "";

// ─── Upload buffer to R2/S3 ───────────────────────────────────────────────────
async function uploadToStorage(key: string, buffer: Buffer, contentType: string) {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return PUBLIC_BASE
    ? `${PUBLIC_BASE}/${key}`
    : `${process.env.STORAGE_ENDPOINT}/${BUCKET}/${key}`;
}

// ─── Fetch a URL and return its buffer ───────────────────────────────────────
async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

// ─── Build SVG text composite for a single text element ──────────────────────
function buildTextSvg(
  naturalW: number,
  naturalH: number,
  element: LayoutElement,
  value: string
): Buffer {
  const fontSize = element.fontSize ?? 48;
  const color = element.color ?? "#ffffff";
  const alignment = element.alignment ?? "left";

  const textAnchor =
    alignment === "center" ? "middle" : alignment === "right" ? "end" : "start";
  const textX =
    alignment === "center"
      ? element.x + element.width / 2
      : alignment === "right"
      ? element.x + element.width
      : element.x;
  const textY = element.y + element.height / 2 + fontSize / 3;

  // Escape XML special chars
  const safe = value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${naturalW}" height="${naturalH}">
  <text
    x="${textX}"
    y="${textY}"
    font-size="${fontSize}"
    fill="${color}"
    text-anchor="${textAnchor}"
    font-family="Arial, Helvetica, sans-serif"
    font-weight="600"
  >${safe}</text>
</svg>`.trim();

  return Buffer.from(svg);
}

function buildWatermarkSvg(naturalW: number, naturalH: number): Buffer {
  const text = "Made with Spotlite";
  const fontSize = Math.max(14, Math.round(naturalW * 0.018)); // ~1.8% of width (about 19px for 1080px)
  const padding = Math.max(16, Math.round(naturalW * 0.03)); // ~3% of width (about 32px for 1080px)

  const textX = naturalW - padding;
  const textY = naturalH - padding;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${naturalW}" height="${naturalH}">
  <text
    x="${textX}"
    y="${textY}"
    font-size="${fontSize}"
    fill="#ffffff"
    text-anchor="end"
    font-family="Arial, Helvetica, sans-serif"
    font-weight="bold"
    opacity="0.45"
  >${text}</text>
</svg>`.trim();

  return Buffer.from(svg);
}


// ─── Main generation service ──────────────────────────────────────────────────
export async function generateGraphic(
  ownerId: string,
  projectId: string,
  submissionId: string,
  templateId: string
) {
  // 1. Verify ownership
  await getProjectById(projectId, ownerId);

  // 2. Fetch template + submission
  const template = await getTemplateById(ownerId, projectId, templateId);
  const submission = await getSubmissionById(submissionId);

  const layoutJson = template.layoutJson as {
    originalWidth: number;
    originalHeight: number;
    elements: LayoutElement[];
  };

  const { originalWidth: natW, originalHeight: natH, elements } = layoutJson;
  const dataJson = submission.dataJson as Record<string, string>;

  // 3. Load background image
  const bgBuffer = await fetchBuffer(template.backgroundImageUrl);
  let image = sharp(bgBuffer).resize(natW, natH);

  // 4. Build composites
  const composites: OverlayOptions[] = [];

  for (const el of elements) {
    const value = dataJson[el.fieldId];
    if (!value) continue;

    if (el.fieldType === "image") {
      // Download user photo, resize to field dimensions, composite at position
      try {
        const photoBuffer = await fetchBuffer(value);
        const resized = await sharp(photoBuffer)
          .resize(Math.round(el.width), Math.round(el.height), { fit: "cover" })
          .toBuffer();
        composites.push({
          input: resized,
          left: Math.round(el.x),
          top: Math.round(el.y),
        });
      } catch {
        // If photo fails to load, skip silently
        console.warn(`[image-gen] Failed to load photo for field ${el.fieldId}`);
      }
    } else {
      // Render text as an SVG overlay
      const svgBuffer = buildTextSvg(natW, natH, el, String(value));
      composites.push({ input: svgBuffer, top: 0, left: 0 });
    }
  }

  // 4.5 Add branding watermark at the bottom right corner
  const watermarkBuffer = buildWatermarkSvg(natW, natH);
  composites.push({ input: watermarkBuffer, top: 0, left: 0 });

  // 5. Composite everything and export
  const outputBuffer = await image.composite(composites).png().toBuffer();

  // 6. Upload to storage
  const key = `generated/${projectId}/${crypto.randomUUID()}.png`;
  const imageUrl = await uploadToStorage(key, outputBuffer, "image/png");

  // 7. Persist and return
  return saveGeneratedImageDb(submissionId, templateId, imageUrl);
}

export async function listGeneratedImages(
  ownerId: string,
  projectId: string,
  submissionId: string
) {
  await getProjectById(projectId, ownerId);
  return getGeneratedImagesForSubmissionDb(submissionId);
}

export async function deleteGeneratedImage(
  ownerId: string,
  projectId: string,
  imageId: string
) {
  await getProjectById(projectId, ownerId);
  return deleteGeneratedImageDb(imageId);
}

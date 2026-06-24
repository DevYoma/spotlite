import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getProjectById } from "../projects/service";
import {
  createTemplateDb,
  getTemplatesByProjectDb,
  getTemplateByIdDb,
  deleteTemplateDb,
  updateTemplateLayoutDb,
} from "./repository";
import { CreateTemplateInput, TemplateLayout } from "./types";

// Initialize S3 / Cloudflare R2 Client
const s3Client = new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT || undefined,
  region: process.env.STORAGE_REGION || "auto",
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true,
});

export async function createTemplate(ownerId: string, projectId: string, input: CreateTemplateInput) {
  // Verify ownership of the parent project
  await getProjectById(projectId, ownerId);
  return await createTemplateDb(projectId, input);
}

export async function getTemplatesByProject(ownerId: string, projectId: string) {
  // Verify ownership of the parent project
  await getProjectById(projectId, ownerId);
  return await getTemplatesByProjectDb(projectId);
}

export async function getTemplateById(ownerId: string, projectId: string, templateId: string) {
  // Verify ownership of the parent project
  await getProjectById(projectId, ownerId);
  const template = await getTemplateByIdDb(templateId, projectId);
  if (!template) {
    throw new Error("Template not found");
  }
  return template;
}

export async function deleteTemplate(ownerId: string, projectId: string, templateId: string) {
  // Verify ownership of project and existence of template
  await getTemplateById(ownerId, projectId, templateId);
  return await deleteTemplateDb(templateId, projectId);
}

export async function updateTemplateLayout(
  ownerId: string,
  projectId: string,
  templateId: string,
  layoutJson: TemplateLayout
) {
  // Verify ownership and existence before updating
  await getTemplateById(ownerId, projectId, templateId);
  const updated = await updateTemplateLayoutDb(templateId, projectId, layoutJson);
  if (!updated) {
    throw new Error("Template not found");
  }
  return updated;
}

export async function generateBackgroundPresignedUrl(
  ownerId: string,
  projectId: string,
  filename: string,
  contentType: string
) {
  // Verify ownership of the parent project
  await getProjectById(projectId, ownerId);

  const uniqueId = Math.random().toString(36).substring(2, 15);
  const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `templates/${projectId}/backgrounds/${uniqueId}_${cleanFilename}`;
  const bucket = process.env.STORAGE_BUCKET_NAME || "spotlite";

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  // Expire the upload window in 10 minutes (600 seconds)
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });

  const publicBaseUrl = process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL || "";
  const publicUrl = publicBaseUrl
    ? `${publicBaseUrl}/${key}`
    : `${process.env.STORAGE_ENDPOINT}/${bucket}/${key}`;

  return { uploadUrl, publicUrl };
}

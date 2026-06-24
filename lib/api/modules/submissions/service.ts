import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createSubmissionDb, getSubmissionsByFormDb, deleteSubmissionDb } from "./repository";
import { getFormByIdPublic, getFormById } from "../forms/service";
import { SubmissionInput } from "./types";

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

export async function submitFormResponse(formId: string, input: SubmissionInput) {
  // 1. Fetch form to verify existence and get schema
  const form = await getFormByIdPublic(formId);

  // 2. Validate submitted responses against the form schema fields configuration
  const formFields = (form.schemaJson as any)?.fields || [];
  const submittedData = input.dataJson;

  for (const field of formFields) {
    const value = submittedData[field.id];

    // Check if a required field is missing or empty
    if (field.required) {
      const isMissing = value === undefined || value === null || String(value).trim() === "";
      if (isMissing) {
        throw new Error(`Field "${field.label}" is required`);
      }
    }

    // Check select/radio value constraints (must match options)
    if ((field.type === "radio" || field.type === "select") && field.options?.length > 0) {
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        const isValidOption = field.options.includes(value);
        if (!isValidOption) {
          throw new Error(`Invalid option selected for "${field.label}"`);
        }
      }
    }
  }

  // 3. Save submission to database repository
  return await createSubmissionDb(formId, submittedData);
}

export async function generatePresignedUrl(formId: string, filename: string, contentType: string) {
  // Ensure the form template exists before generating upload link
  await getFormByIdPublic(formId);

  const uniqueId = Math.random().toString(36).substring(2, 15);
  const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `submissions/${formId}/${uniqueId}_${cleanFilename}`;
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

export async function getSubmissionsForForm(ownerId: string, projectId: string, formId: string) {
  // Verify ownership of the parent project and existence of the form template
  await getFormById(formId, projectId, ownerId);
  return await getSubmissionsByFormDb(formId);
}

export async function deleteSubmission(
  ownerId: string,
  projectId: string,
  formId: string,
  submissionId: string
) {
  // Verify ownership of the parent project and existence of the form template
  await getFormById(formId, projectId, ownerId);
  return await deleteSubmissionDb(submissionId);
}

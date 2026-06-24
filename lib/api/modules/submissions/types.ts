import { z } from "zod";
import { presignRequestSchema, submissionInputSchema } from "./schema";

export type PresignRequestInput = z.infer<typeof presignRequestSchema>;
export type SubmissionInput = z.infer<typeof submissionInputSchema>;

export interface SubmissionResponse {
  id: string;
  formId: string;
  dataJson: Record<string, any>;
  createdAt: Date;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
}

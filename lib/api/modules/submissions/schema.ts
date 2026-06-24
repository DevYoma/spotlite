import { z } from "zod";

export const presignRequestSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  contentType: z.string().min(1, "Content type is required"),
});

export const submissionInputSchema = z.object({
  dataJson: z.record(z.string(), z.any()),
});

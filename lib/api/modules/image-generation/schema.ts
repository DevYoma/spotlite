import { z } from "zod";

export const generateImageSchema = z.object({
  submissionId: z.string().uuid(),
  templateId: z.string().uuid(),
});

export type GenerateImageInput = z.infer<typeof generateImageSchema>;

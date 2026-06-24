import { z } from "zod";

export const createTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  backgroundImageUrl: z.string().min(1, "Background image URL is required"),
});

export const presignBackgroundSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  contentType: z.string().min(1, "Content type is required"),
});

export const layoutElementSchema = z.object({
  fieldId: z.string(),
  fieldName: z.string(),
  fieldType: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  fontSize: z.number().optional(),
  color: z.string().optional(),
  alignment: z.enum(["left", "center", "right"]).optional(),
});

export const updateTemplateLayoutSchema = z.object({
  layoutJson: z.object({
    originalWidth: z.number(),
    originalHeight: z.number(),
    elements: z.array(layoutElementSchema),
  }),
});

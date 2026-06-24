import { z } from "zod";
import {
  createTemplateSchema,
  presignBackgroundSchema,
  layoutElementSchema,
  updateTemplateLayoutSchema,
} from "./schema";

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type PresignBackgroundInput = z.infer<typeof presignBackgroundSchema>;
export type LayoutElement = z.infer<typeof layoutElementSchema>;
export type UpdateTemplateLayoutInput = z.infer<typeof updateTemplateLayoutSchema>;

export interface TemplateLayout {
  originalWidth: number;
  originalHeight: number;
  elements: LayoutElement[];
}

export interface TemplateResponse {
  id: string;
  projectId: string;
  name: string;
  backgroundImageUrl: string;
  layoutJson: TemplateLayout | Record<string, never>;
  createdAt: Date;
}

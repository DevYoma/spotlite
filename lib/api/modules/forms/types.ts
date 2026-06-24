import { z } from "zod";
import { formFieldSchema, createFormSchema, updateFormSchema } from "./schema";

export type FormField = z.infer<typeof formFieldSchema>;
export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormInput = z.infer<typeof updateFormSchema>;

export interface FormResponse {
  id: string;
  projectId: string;
  name: string;
  title: string;
  schemaJson: {
    fields: FormField[];
  };
  createdAt: Date;
}

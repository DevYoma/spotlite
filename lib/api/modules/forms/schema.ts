import { z } from "zod";

export const formFieldSchema = z.object({
  id: z.string().min(1, "Field ID is required"),
  type: z.enum(["text", "textarea", "image", "radio", "select"]),
  label: z.string().min(1, "Label is required").max(100, "Label is too long"),
  required: z.boolean().default(false),
  placeholder: z.string().max(100, "Placeholder is too long").optional(),
  options: z.array(z.string()).optional(),
});

export const createFormSchema = z.object({
  name: z.string().min(1, "Form name is required").max(100, "Form name is too long"),
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  fields: z.array(formFieldSchema).min(1, "At least one form field is required"),
});

export const updateFormSchema = z.object({
  name: z.string().min(1, "Form name is required").max(100, "Form name is too long").optional(),
  title: z.string().min(1, "Title is required").max(100, "Title is too long").optional(),
  fields: z.array(formFieldSchema).min(1, "At least one form field is required").optional(),
});

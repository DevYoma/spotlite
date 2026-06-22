import { z } from "zod";
import { createProjectSchema, updateProjectSchema } from "./schema";

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export interface ProjectResponse {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  createdAt: Date;
}

import { db } from "../../../db";
import { templates } from "../../../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { CreateTemplateInput, TemplateLayout } from "./types";

export async function createTemplateDb(projectId: string, input: CreateTemplateInput) {
  const [template] = await db
    .insert(templates)
    .values({
      projectId,
      name: input.name,
      backgroundImageUrl: input.backgroundImageUrl,
      layoutJson: {}, // default layout to empty object in Phase 7
    })
    .returning();
  return template;
}

export async function getTemplatesByProjectDb(projectId: string) {
  return await db
    .select()
    .from(templates)
    .where(eq(templates.projectId, projectId))
    .orderBy(desc(templates.createdAt));
}

export async function getTemplateByIdDb(id: string, projectId: string) {
  const [template] = await db
    .select()
    .from(templates)
    .where(and(eq(templates.id, id), eq(templates.projectId, projectId)))
    .limit(1);
  return template || null;
}

export async function deleteTemplateDb(id: string, projectId: string) {
  const [template] = await db
    .delete(templates)
    .where(and(eq(templates.id, id), eq(templates.projectId, projectId)))
    .returning();
  return template || null;
}

export async function updateTemplateLayoutDb(
  id: string,
  projectId: string,
  layoutJson: TemplateLayout
) {
  const [template] = await db
    .update(templates)
    .set({ layoutJson })
    .where(and(eq(templates.id, id), eq(templates.projectId, projectId)))
    .returning();
  return template || null;
}

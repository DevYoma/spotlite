import { db } from "../../../db";
import { forms } from "../../../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { CreateFormInput, UpdateFormInput } from "./types";

export async function createFormDb(projectId: string, input: CreateFormInput) {
  const [form] = await db
    .insert(forms)
    .values({
      projectId,
      name: input.name,
      title: input.title,
      schemaJson: { fields: input.fields },
    })
    .returning();
  return form;
}

export async function getFormsByProjectDb(projectId: string) {
  return await db
    .select()
    .from(forms)
    .where(eq(forms.projectId, projectId))
    .orderBy(desc(forms.createdAt));
}

export async function getFormByIdDb(id: string, projectId: string) {
  const [form] = await db
    .select()
    .from(forms)
    .where(and(eq(forms.id, id), eq(forms.projectId, projectId)))
    .limit(1);
  return form || null;
}

export async function updateFormDb(id: string, projectId: string, input: UpdateFormInput) {
  const updateData: Partial<typeof forms.$inferInsert> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.title !== undefined) updateData.title = input.title;
  if (input.fields !== undefined) {
    updateData.schemaJson = { fields: input.fields };
  }

  const [form] = await db
    .update(forms)
    .set(updateData)
    .where(and(eq(forms.id, id), eq(forms.projectId, projectId)))
    .returning();
  return form || null;
}

export async function deleteFormDb(id: string, projectId: string) {
  const [form] = await db
    .delete(forms)
    .where(and(eq(forms.id, id), eq(forms.projectId, projectId)))
    .returning();
  return form || null;
}

export async function getFormByIdPublicDb(id: string) {
  const [form] = await db
    .select()
    .from(forms)
    .where(eq(forms.id, id))
    .limit(1);
  return form || null;
}

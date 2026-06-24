import { db } from "../../../db";
import { projects } from "../../../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { CreateProjectInput, UpdateProjectInput } from "./types";

export async function createProjectDb(ownerId: string, input: CreateProjectInput) {
  const [project] = await db
    .insert(projects)
    .values({
      ownerId,
      name: input.name,
      description: input.description ?? null,
    })
    .returning();
  return project;
}

export async function getProjectsByOwnerDb(ownerId: string) {
  return await db
    .select()
    .from(projects)
    .where(eq(projects.ownerId, ownerId))
    .orderBy(desc(projects.createdAt));
}

export async function getProjectByIdDb(id: string, ownerId: string) {
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)))
    .limit(1);
  return project || null;
}

export async function updateProjectDb(id: string, ownerId: string, input: UpdateProjectInput) {
  const updateData: Partial<typeof projects.$inferInsert> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;

  const [project] = await db
    .update(projects)
    .set(updateData)
    .where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)))
    .returning();
  return project || null;
}

export async function deleteProjectDb(id: string, ownerId: string) {
  const [project] = await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)))
    .returning();
  return project || null;
}

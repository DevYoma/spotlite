import { db } from "../../../db";
import { submissions } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";

export async function createSubmissionDb(formId: string, dataJson: Record<string, any>) {
  const [submission] = await db
    .insert(submissions)
    .values({
      formId,
      dataJson,
    })
    .returning();
  return submission;
}

export async function getSubmissionsByFormDb(formId: string) {
  return await db
    .select()
    .from(submissions)
    .where(eq(submissions.formId, formId))
    .orderBy(desc(submissions.createdAt));
}

export async function getSubmissionByIdDb(id: string) {
  const [submission] = await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1);
  return submission || null;
}

export async function deleteSubmissionDb(id: string) {
  const [submission] = await db
    .delete(submissions)
    .where(eq(submissions.id, id))
    .returning();
  return submission || null;
}

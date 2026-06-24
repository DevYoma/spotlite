import { db } from "@/lib/db";
import { generatedImages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function saveGeneratedImageDb(
  submissionId: string,
  templateId: string,
  imageUrl: string
) {
  const [row] = await db
    .insert(generatedImages)
    .values({ submissionId, templateId, imageUrl })
    .returning();
  return row;
}

export async function getGeneratedImagesForSubmissionDb(submissionId: string) {
  return db
    .select()
    .from(generatedImages)
    .where(eq(generatedImages.submissionId, submissionId))
    .orderBy(generatedImages.createdAt);
}

export async function deleteGeneratedImageDb(imageId: string) {
  const [deleted] = await db
    .delete(generatedImages)
    .where(eq(generatedImages.id, imageId))
    .returning();
  if (!deleted) throw new Error("Generated image not found");
  return deleted;
}

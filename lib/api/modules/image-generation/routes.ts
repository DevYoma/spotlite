import Elysia from "elysia";
import { getOrCreateUser } from "../auth/service";
import { generateImageSchema } from "./schema";
import { generateGraphic, listGeneratedImages, deleteGeneratedImage } from "./service";

export const imageGenerationRoutes = new Elysia({ prefix: "/projects/:id" })
  .derive(async () => {
    const user = await getOrCreateUser();
    return { user };
  })
  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  })

  // POST /projects/:id/generate — generate a graphic for a submission
  .post("/generate", async ({ user, params: { id }, body, set }) => {
    try {
      const { submissionId, templateId } = generateImageSchema.parse(body);
      const result = await generateGraphic(user!.id, id, submissionId, templateId);
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      set.status = msg.includes("not found") ? 404 : 500;
      return { error: msg };
    }
  })

  // GET /projects/:id/generated-images?submissionId=xxx
  .get("/generated-images", async ({ user, params: { id }, query, set }) => {
    try {
      const { submissionId } = query as { submissionId?: string };
      if (!submissionId) {
        set.status = 400;
        return { error: "submissionId query param is required" };
      }
      return await listGeneratedImages(user!.id, id, submissionId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to list images";
      set.status = msg.includes("not found") ? 404 : 500;
      return { error: msg };
    }
  })

  // DELETE /projects/:id/generated-images/:imageId
  .delete("/generated-images/:imageId", async ({ user, params: { id, imageId }, set }) => {
    try {
      return await deleteGeneratedImage(user!.id, id, imageId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete image";
      set.status = msg.includes("not found") ? 404 : 500;
      return { error: msg };
    }
  });

import Elysia from "elysia";
import { getOrCreateUser } from "../auth/service";
import {
  createTemplate,
  getTemplatesByProject,
  getTemplateById,
  deleteTemplate,
  generateBackgroundPresignedUrl,
  updateTemplateLayout,
} from "./service";
import {
  createTemplateSchema,
  presignBackgroundSchema,
  updateTemplateLayoutSchema,
} from "./schema";

export const templateRoutes = new Elysia({ prefix: "/projects/:id/templates" })
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
  .get("/", async ({ user, params: { id }, set }) => {
    try {
      return await getTemplatesByProject(user!.id, id);
    } catch (err: any) {
      set.status = err.message.includes("not found") ? 404 : 500;
      return { error: err.message };
    }
  })
  .get("/:templateId", async ({ user, params: { id, templateId }, set }) => {
    try {
      return await getTemplateById(user!.id, id, templateId);
    } catch (err: any) {
      set.status = err.message.includes("not found") ? 404 : 500;
      return { error: err.message };
    }
  })
  .post("/", async ({ user, params: { id }, body, set }) => {
    try {
      const validatedBody = createTemplateSchema.parse(body);
      return await createTemplate(user!.id, id, validatedBody);
    } catch (err: any) {
      if (err.message.includes("not found")) {
        set.status = 404;
        return { error: err.message };
      }
      set.status = 400;
      return { error: err.errors || err.message };
    }
  })
  .put("/:templateId", async ({ user, params: { id, templateId }, body, set }) => {
    try {
      const validatedBody = updateTemplateLayoutSchema.parse(body);
      return await updateTemplateLayout(user!.id, id, templateId, validatedBody.layoutJson);
    } catch (err: any) {
      if (err.message.includes("not found")) {
        set.status = 404;
        return { error: err.message };
      }
      set.status = 400;
      return { error: err.errors || err.message };
    }
  })
  .delete("/:templateId", async ({ user, params: { id, templateId }, set }) => {
    try {
      return await deleteTemplate(user!.id, id, templateId);
    } catch (err: any) {
      set.status = err.message.includes("not found") ? 404 : 500;
      return { error: err.message };
    }
  })
  .post("/presign", async ({ user, params: { id }, body, set }) => {
    try {
      const validatedBody = presignBackgroundSchema.parse(body);
      const presignedData = await generateBackgroundPresignedUrl(
        user!.id,
        id,
        validatedBody.filename,
        validatedBody.contentType
      );
      return presignedData;
    } catch (err: any) {
      if (err.message.includes("not found")) {
        set.status = 404;
        return { error: err.message };
      }
      set.status = 400;
      return { error: err.errors || err.message };
    }
  });

import Elysia from "elysia";
import { getOrCreateUser } from "../auth/service";
import {
  submitFormResponse,
  generatePresignedUrl,
  getSubmissionsForForm,
  deleteSubmission,
} from "./service";
import { submissionInputSchema, presignRequestSchema } from "./schema";

export const submissionRoutes = new Elysia({ prefix: "/submissions" })
  .post("/:formId/submit", async ({ params: { formId }, body, set }) => {
    try {
      const validatedBody = submissionInputSchema.parse(body);
      const submission = await submitFormResponse(formId, validatedBody);
      return submission;
    } catch (err: any) {
      if (err.message === "Form not found") {
        set.status = 404;
        return { error: err.message };
      }
      set.status = 400;
      return { error: err.errors || err.message };
    }
  })
  .post("/:formId/presign", async ({ params: { formId }, body, set }) => {
    try {
      const validatedBody = presignRequestSchema.parse(body);
      const presignedData = await generatePresignedUrl(
        formId,
        validatedBody.filename,
        validatedBody.contentType
      );
      return presignedData;
    } catch (err: any) {
      if (err.message === "Form not found") {
        set.status = 404;
        return { error: err.message };
      }
      set.status = 400;
      return { error: err.errors || err.message };
    }
  });

export const submissionManagementRoutes = new Elysia({ prefix: "/projects/:id/forms/:formId/submissions" })
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
  .get("/", async ({ user, params: { id, formId }, set }) => {
    try {
      return await getSubmissionsForForm(user!.id, id, formId);
    } catch (err: any) {
      set.status = err.message.includes("not found") ? 404 : 500;
      return { error: err.message };
    }
  })
  .delete("/:submissionId", async ({ user, params: { id, formId, submissionId }, set }) => {
    try {
      return await deleteSubmission(user!.id, id, formId, submissionId);
    } catch (err: any) {
      set.status = err.message.includes("not found") ? 404 : 500;
      return { error: err.message };
    }
  });

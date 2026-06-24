import Elysia from "elysia";
import { getOrCreateUser } from "../auth/service";
import {
  createForm,
  getFormsByProject,
  getFormById,
  updateForm,
  deleteForm,
  getFormByIdPublic,
} from "./service";
import { createFormSchema, updateFormSchema } from "./schema";

export const formRoutes = new Elysia({ prefix: "/projects/:id/forms" })
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
      return await getFormsByProject(user!.id, id);
    } catch (err: any) {
      set.status = err.message === "Project not found" ? 404 : 500;
      return { error: err.message };
    }
  })
  .post("/", async ({ user, params: { id }, body, set }) => {
    try {
      const validatedBody = createFormSchema.parse(body);
      return await createForm(user!.id, id, validatedBody);
    } catch (err: any) {
      if (err.message === "Project not found") {
        set.status = 404;
        return { error: err.message };
      }
      set.status = 400;
      return { error: err.errors || err.message };
    }
  })
  .get("/:formId", async ({ user, params: { id, formId }, set }) => {
    try {
      return await getFormById(formId, id, user!.id);
    } catch (err: any) {
      set.status = err.message === "Form not found" || err.message === "Project not found" ? 404 : 500;
      return { error: err.message };
    }
  })
  .put("/:formId", async ({ user, params: { id, formId }, body, set }) => {
    try {
      const validatedBody = updateFormSchema.parse(body);
      return await updateForm(formId, id, user!.id, validatedBody);
    } catch (err: any) {
      if (err.message === "Form not found" || err.message === "Project not found") {
        set.status = 404;
        return { error: err.message };
      }
      set.status = 400;
      return { error: err.errors || err.message };
    }
  })
  .delete("/:formId", async ({ user, params: { id, formId }, set }) => {
    try {
      return await deleteForm(formId, id, user!.id);
    } catch (err: any) {
      set.status = err.message === "Form not found" || err.message === "Project not found" ? 404 : 500;
      return { error: err.message };
    }
  });

export const publicFormRoutes = new Elysia({ prefix: "/public/forms" })
  .get("/:formId", async ({ params: { formId }, set }) => {
    try {
      return await getFormByIdPublic(formId);
    } catch (err: any) {
      set.status = 404;
      return { error: err.message };
    }
  });

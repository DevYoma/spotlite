import Elysia from "elysia";
import { getOrCreateUser } from "../auth/service";
import {
  createProject,
  getProjectsByOwner,
  getProjectById,
  updateProject,
  deleteProject,
} from "./service";
import { createProjectSchema, updateProjectSchema } from "./schema";

export const projectRoutes = new Elysia({ prefix: "/projects" })
  // 1. Derive user once for all routes in this chain
  .derive(async () => {
    const user = await getOrCreateUser();
    return { user };
  })
  // 2. Add an inline guard hook to verify authentication
  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  })
  // 3. Keep handlers completely thin and clean
  .get("/", async ({ user }) => {
    return await getProjectsByOwner(user!.id);
  })
  .post("/", async ({ user, body, set }) => {
    try {
      const validatedBody = createProjectSchema.parse(body);
      return await createProject(user!.id, validatedBody);
    } catch (err: any) {
      set.status = 400;
      return { error: err.errors || err.message };
    }
  })
  .get("/:id", async ({ user, params: { id }, set }) => {
    try {
      return await getProjectById(id, user!.id);
    } catch (err: any) {
      set.status = 404;
      return { error: err.message };
    }
  })
  .put("/:id", async ({ user, params: { id }, body, set }) => {
    try {
      const validatedBody = updateProjectSchema.parse(body);
      return await updateProject(id, user!.id, validatedBody);
    } catch (err: any) {
      if (err.message === "Project not found") {
        set.status = 404;
        return { error: err.message };
      }
      set.status = 400;
      return { error: err.errors || err.message };
    }
  })
  .delete("/:id", async ({ user, params: { id }, set }) => {
    try {
      return await deleteProject(id, user!.id);
    } catch (err: any) {
      set.status = 404;
      return { error: err.message };
    }
  });

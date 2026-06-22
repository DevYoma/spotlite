import Elysia from "elysia";
import { getOrCreateUser } from "../auth/service";
import { ProjectService } from "./service";
import { createProjectSchema, updateProjectSchema } from "./schema";

export const projectRoutes = new Elysia({ prefix: "/projects" })
  .get("/", async ({ set }) => {
    const user = await getOrCreateUser();
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    return await ProjectService.getProjectsByOwner(user.id);
  })
  .post("/", async ({ body, set }) => {
    const user = await getOrCreateUser();
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    try {
      const validatedBody = createProjectSchema.parse(body);
      return await ProjectService.createProject(user.id, validatedBody);
    } catch (err: any) {
      set.status = 400;
      return { error: err.errors || err.message };
    }
  })
  .get("/:id", async ({ params: { id }, set }) => {
    const user = await getOrCreateUser();
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    try {
      return await ProjectService.getProjectById(id, user.id);
    } catch (err: any) {
      set.status = 404;
      return { error: err.message };
    }
  })
  .put("/:id", async ({ params: { id }, body, set }) => {
    const user = await getOrCreateUser();
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    try {
      const validatedBody = updateProjectSchema.parse(body);
      return await ProjectService.updateProject(id, user.id, validatedBody);
    } catch (err: any) {
      if (err.message === "Project not found") {
        set.status = 404;
        return { error: err.message };
      }
      set.status = 400;
      return { error: err.errors || err.message };
    }
  })
  .delete("/:id", async ({ params: { id }, set }) => {
    const user = await getOrCreateUser();
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    try {
      return await ProjectService.deleteProject(id, user.id);
    } catch (err: any) {
      set.status = 404;
      return { error: err.message };
    }
  });

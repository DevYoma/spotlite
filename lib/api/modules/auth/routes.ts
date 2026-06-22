import Elysia from "elysia";
import { getOrCreateUser } from "./service";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .get("/me", async ({ set }) => {
    const user = await getOrCreateUser();
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    return user;
  });

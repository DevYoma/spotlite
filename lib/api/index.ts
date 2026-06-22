import Elysia from "elysia";
import { cors } from "@elysiajs/cors";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { projectRoutes } from "./modules/projects/routes";
import { authRoutes } from "./modules/auth/routes";

export const app = new Elysia({ prefix: "/api" })
  .use(cors())
  .get("/health", async () => {
    try {
      // Run a simple test query to verify connection
      await db.execute(sql`SELECT 1`);
      return { status: "ok", database: "connected" };
    } catch (err: any) {
      return { status: "error", database: err.message || "Failed to connect" };
    }
  })
  .use(authRoutes)
  .use(projectRoutes);

export type App = typeof app;

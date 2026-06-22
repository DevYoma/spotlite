import Elysia from "elysia";
import { cors } from "@elysiajs/cors";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

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
  });

export type App = typeof app;

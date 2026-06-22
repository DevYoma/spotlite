import Elysia from "elysia";
import { cors } from "@elysiajs/cors";

export const app = new Elysia({ prefix: "/api" })
  .use(cors())
  .get("/health", () => ({ status: "ok" }));

export type App = typeof app;

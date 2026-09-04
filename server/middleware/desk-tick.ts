/**
 * Intercept GET /api/desk/tick before TanStack Start's HTML handler.
 * Nitro route server/routes/api/desk/tick.get.ts alone loses to Start on
 * Vercel (Accept: application/json → 500 "Only HTML requests are supported").
 * Middleware runs first (serverDir: "./server") and returns JSON.
 */
import { defineMiddleware } from "nitro";

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export default defineMiddleware(async (event, next) => {
  const method = (event.req.method ?? "GET").toUpperCase();
  if (method !== "GET") return next();
  if (event.url.pathname !== "/api/desk/tick") return next();

  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = event.req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) {
      return json({ error: "unauthorized" }, 401);
    }
  }

  try {
    const { runDeskTick } = await import("../../src/lib/news/server");
    const result = await runDeskTick();
    return json(result, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[middleware/desk-tick]", message);
    return json({ error: message }, 500);
  }
});

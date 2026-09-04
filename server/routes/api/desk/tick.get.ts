/**
 * Cron / routine entry for the autonomous desk loop.
 * Vercel Hobby cron hits GET /api/desk/tick every ~5m (may be throttled).
 *
 * Auth: if CRON_SECRET is set, require `Authorization: Bearer <secret>`.
 * Hobby cron often cannot send custom headers — leave CRON_SECRET unset to
 * allow unauthenticated ticks (acceptable while the desk is public read-only).
 */
import { defineHandler } from "nitro";

export default defineHandler(async (event) => {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = event.req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }
  }

  try {
    const { runDeskTick } = await import("../../../../src/lib/news/server");
    const result = await runDeskTick();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/desk/tick]", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
});

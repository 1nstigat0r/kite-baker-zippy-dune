import { CURRENT_BRIEFING } from "./desk";
import { createServerFn } from "@tanstack/react-start";
import {
  absorbFindsIntoPayload,
  composeBriefing,
  emergencyBriefing,
  localizeHeadline,
} from "./compose";
import { ingestStories } from "./ingest";
import { shortenPayload } from "./shorten";
import {
  addSeen,
  applyTickerHe,
  addSpareItem,
  buildDashboard,
  claimBriefing,
  clearScan,
  clearTicker,
  ensureDeskGeneration,
  failBriefing,
  getBriefing,
  getLatestReady,
  getMeta,
  getScanState,
  listSeen,
  listTicker,
  listTickerNeedingHe,
  markBriefingUsed,
  previousBodies,
  pruneTicker,
  saveBriefing,
  setMeta,
  swapSpareItem,
} from "./store";
import { fingerprint, hasHebrew } from "./text";
import { hourKey, hourLabelFromKey, israelParts } from "./time";
import { briefingHasContent, type BriefingPayload, type RawStory } from "./types";

const inflight = new Map<string, Promise<void>>();

async function localizeTicker() {
  const pending = await listTickerNeedingHe(32);
  if (pending.length === 0) return;
  const he = pending
    .map((item) => ({
      url: item.url,
      titleHe: hasHebrew(item.title)
        ? item.title
        : localizeHeadline(item.title, item.source),
    }))
    .filter((row) => row.url && hasHebrew(row.titleHe));
  if (he.length) await applyTickerHe(he);
}

async function generateForHour(id: string) {
  const parts = israelParts();
  const dayPrefix = `${parts.year}-${parts.month}-${parts.day}`;
  try {
    const stories = await Promise.race([
      ingestStories(true, "fast"),
      new Promise<RawStory[]>((resolve) => {
        setTimeout(() => resolve([]), 8_000);
      }),
    ]);
    const [seen, previous, ticker] = await Promise.all([
      listSeen(dayPrefix),
      previousBodies(dayPrefix, id),
      listTicker(40),
    ]);
    void localizeTicker();

    const fromTicker: RawStory[] =
      stories.length > 0
        ? []
        : ticker.slice(0, 40).map((item) => ({
            title: item.titleHe ?? item.title,
            url: item.url,
            source: item.source,
            publishedAt: item.publishedAt,
            arena: null,
            via: "rss" as const,
          }));

    const result = await composeBriefing({
      hourLabel: hourLabelFromKey(id),
      stories: stories.length ? stories : fromTicker,
      previous,
      seen,
    });

    let payload = result.payload;
    let itemCount = payload.arenas.reduce((n, a) => n + a.items.length, 0);
    if (itemCount === 0) {
      console.error("[briefing] empty compose", id, "stories", (stories.length ? stories : fromTicker).length);
      const pool = stories.length ? stories : fromTicker;
      payload = emergencyBriefing(pool);
      itemCount = payload.arenas.reduce((n, a) => n + a.items.length, 0);
      if (itemCount === 0) {
        payload = structuredClone(CURRENT_BRIEFING);
        itemCount = payload.arenas.reduce((n, a) => n + a.items.length, 0);
        kickIngest();
      }
    }
    await saveBriefing(id, await shortenPayload(payload));
    const prints: string[] = [];
    for (const arena of payload.arenas) {
      for (const item of arena.items) {
        prints.push(fingerprint(item.url, `${item.speaker} ${item.body}`));
      }
    }
    for (const item of payload.spares) {
      prints.push(fingerprint(item.url, `${item.speaker} ${item.body}`));
    }
    await addSeen(id, prints);
    if (result.tickerHe.length) {
      await applyTickerHe(result.tickerHe);
    }
    await localizeTicker();
    await pruneTicker(24);
  } catch (err) {
    const message = err instanceof Error ? err.message : "generation failed";
    console.error("[briefing]", id, message);
    await failBriefing(id, message);
  }
}

let ingestKick: Promise<void> | null = null;

function kickIngest() {
  if (ingestKick) return;
  ingestKick = (async () => {
    await setMeta("last_ingest_at", new Date().toISOString());
    await ingestStories(true, "full");
    await localizeTicker();
    await pruneTicker(24);
  })()
    .catch((err) => {
      console.error("[scan-ingest]", err instanceof Error ? err.message : err);
    })
    .finally(() => {
      ingestKick = null;
    });
}

async function storiesFromTicker(): Promise<RawStory[]> {
  const ticker = await listTicker(48);
  return ticker.map((item) => ({
    title: item.titleHe ?? item.title,
    url: item.url,
    source: item.source,
    publishedAt: item.publishedAt,
    arena: item.arena,
    via: "rss" as const,
  }));
}

async function refineActiveDraft() {
  const draftId = (await getMeta("active_draft_id")) || hourKey();
  const briefing = await getBriefing(draftId);
  if (!briefingHasContent(briefing)) return;
  const stories = await storiesFromTicker();
  if (!stories.length) return;
  const updated = absorbFindsIntoPayload(briefing!.payload, stories);
  await saveBriefing(draftId, await shortenPayload(updated));
}

let refineInflight: Promise<void> | null = null;

async function tickScan() {
  const parts = israelParts();
  const dayPrefix = `${parts.year}-${parts.month}-${parts.day}`;
  const [latest, scan] = await Promise.all([
    getLatestReady(dayPrefix),
    getScanState(),
  ]);

  if (scan.scanning && scan.dueAt) {
    const due = Date.parse(scan.dueAt);
    if (Date.now() >= due) {
      // Lock current draft — stop live swaps; wait for next «השתמשתי»
      await clearScan();
      return;
    }
    const last = await getMeta("last_ingest_at");
    if (!last || Date.now() - Date.parse(last) > 3 * 60_000) {
      kickIngest();
    }
    if (!refineInflight) {
      refineInflight = refineActiveDraft()
        .catch((err) => {
          console.error("[refine]", err instanceof Error ? err.message : err);
        })
        .finally(() => {
          refineInflight = null;
        });
    }
    return;
  }

  if (!latest || latest.id !== hourKey()) {
    const id = hourKey();
    if (inflight.has(id)) return;
    await claimBriefing(id, true);
    const task = generateForHour(id).finally(() => inflight.delete(id));
    inflight.set(id, task);
  }
}


export const getDashboard = createServerFn({ method: "POST" })
  .validator((input: { hourKey?: string } | undefined) => input ?? {})
  .handler(async ({ data }) => {
    await ensureDeskGeneration();
    await tickScan();
    return buildDashboard(data.hourKey);
  });

export const refreshTicker = createServerFn({ method: "POST" }).handler(
  async () => {
    await ensureDeskGeneration();
    await clearTicker();
    await ingestStories(true, "fast");
    await setMeta("last_ingest_at", new Date().toISOString());
    await localizeTicker();
    await pruneTicker(24);
    await tickScan();
    const scan = await getScanState();
    const draftId = (await getMeta("active_draft_id")) || undefined;
    return buildDashboard(scan.scanning ? draftId : undefined);
  },
);

export const ensureBriefing = createServerFn({ method: "POST" })
  .validator((input: { hourKey?: string; force?: boolean } | undefined) => input ?? {})
  .handler(async ({ data }) => {
    const wiped = await ensureDeskGeneration();
    await tickScan();
    const id = data.hourKey ?? hourKey();
    const dash = await buildDashboard(id);
    const has =
      briefingHasContent(dash.briefing) || briefingHasContent(dash.latestBriefing);
    if (data.force || wiped || !has) {
      inflight.delete(id);
      await claimBriefing(id, true);
      const task = generateForHour(id).finally(() => inflight.delete(id));
      inflight.set(id, task);
      await Promise.race([
        task,
        new Promise((r) => setTimeout(r, 9_000)),
      ]);
      return buildDashboard(id);
    }
    if (inflight.has(id)) {
      await Promise.race([
        inflight.get(id),
        new Promise((r) => setTimeout(r, 10_000)),
      ]);
    }
    return buildDashboard(data.hourKey);
  });

export const markUsed = createServerFn({ method: "POST" })
  .validator(
    (input: { hourKey: string; payload?: BriefingPayload }) => input,
  )
  .handler(async ({ data }) => {
    const existing = await getBriefing(data.hourKey);
    const current =
      data.payload ??
      (briefingHasContent(existing) ? existing!.payload : null);
    if (!current) {
      await markBriefingUsed(data.hourKey);
      kickIngest();
      return buildDashboard();
    }

    // Burn consumed briefing items — never recycle into spares
    const burned: string[] = [];
    for (const arena of current.arenas) {
      for (const item of arena.items) {
        burned.push(fingerprint(item.url, `${item.speaker} ${item.body}`));
      }
    }
    for (const item of current.spares) {
      burned.push(fingerprint(item.url, `${item.speaker} ${item.body}`));
    }
    if (burned.length) await addSeen(data.hourKey || "used", burned);

    const nowId = hourKey();
    await claimBriefing(nowId, true);
    await markBriefingUsed(data.hourKey);
    await setMeta("active_draft_id", nowId);
    // Full live compose — not reshuffle of the same stale spares/ticker.
    await generateForHour(nowId);
    kickIngest();
    return buildDashboard(nowId);
  });

export const swapSpare = createServerFn({ method: "POST" })
  .validator((input: { hourKey: string; spareId: string; itemId: string }) => input)
  .handler(async ({ data }) => {
    await swapSpareItem(data.hourKey, data.spareId, data.itemId);
    return buildDashboard(data.hourKey);
  });

export const addSpare = createServerFn({ method: "POST" })
  .validator((input: { hourKey: string; spareId: string }) => input)
  .handler(async ({ data }) => {
    await addSpareItem(data.hourKey, data.spareId);
    return buildDashboard(data.hourKey);
  });

export const persistPayload = createServerFn({ method: "POST" })
  .validator(
    (input: {
      hourKey: string;
      payload: import("./types").BriefingPayload;
    }) => input,
  )
  .handler(async ({ data }) => {
    await saveBriefing(data.hourKey, data.payload);
    return buildDashboard(data.hourKey);
  });

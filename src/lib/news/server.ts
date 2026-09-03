import { createServerFn } from "@tanstack/react-start";
import { composeBriefing, localizeHeadline } from "./compose";
import { ingestStories } from "./ingest";
import { shortenPayload } from "./shorten";
import {
  addSeen,
  applyTickerHe,
  addSpareItem,
  buildDashboard,
  claimBriefing,
  clearScan,
  failBriefing,
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
  seedTicker,
  setMeta,
  swapSpareItem,
} from "./store";
import { fingerprint, hasHebrew } from "./text";
import { hourKey, hourLabelFromKey, israelParts } from "./time";
import type { RawStory } from "./types";

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
      ingestStories(true),
      new Promise<RawStory[]>((resolve) => {
        setTimeout(() => resolve([]), 22_000);
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

    await saveBriefing(id, await shortenPayload(result.payload));
    const prints: string[] = [];
    for (const arena of result.payload.arenas) {
      for (const item of arena.items) {
        prints.push(fingerprint(item.url, `${item.speaker} ${item.body}`));
      }
    }
    for (const item of result.payload.spares) {
      prints.push(fingerprint(item.url, `${item.speaker} ${item.body}`));
    }
    await addSeen(id, prints);
    if (result.tickerHe.length) {
      await applyTickerHe(result.tickerHe);
      await seedTicker(result.tickerHe);
    }
    await localizeTicker();
    await pruneTicker(16);
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
    await ingestStories(false);
    await localizeTicker();
    await pruneTicker(16);
  })()
    .catch((err) => {
      console.error("[scan-ingest]", err instanceof Error ? err.message : err);
    })
    .finally(() => {
      ingestKick = null;
    });
}

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
      const id = hourKey();
      if (!inflight.has(id)) {
        const task = (async () => {
          await claimBriefing(id, true);
          await generateForHour(id);
          await clearScan();
        })().finally(() => inflight.delete(id));
        inflight.set(id, task);
      }
    } else {
      const last = await getMeta("last_ingest_at");
      if (!last || Date.now() - Date.parse(last) > 6 * 60_000) kickIngest();
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
    await tickScan();
    return buildDashboard(data.hourKey);
  });

export const refreshTicker = createServerFn({ method: "POST" }).handler(
  async () => {
    await ingestStories(false);
    await localizeTicker();
    await pruneTicker(16);
    await tickScan();
    return buildDashboard();
  },
);

export const ensureBriefing = createServerFn({ method: "POST" })
  .validator((input: { hourKey?: string; force?: boolean } | undefined) => input ?? {})
  .handler(async ({ data }) => {
    await tickScan();
    if (data.force) {
      const id = data.hourKey ?? hourKey();
      inflight.delete(id);
      await claimBriefing(id, true);
      const task = generateForHour(id).finally(() => inflight.delete(id));
      inflight.set(id, task);
      // Wait a bit so first paint can get content when possible
      await Promise.race([
        task,
        new Promise((r) => setTimeout(r, 12_000)),
      ]);
      return buildDashboard(id);
    }
    // If no ready briefing yet, wait briefly for in-flight generation
    const id = data.hourKey ?? hourKey();
    if (inflight.has(id)) {
      await Promise.race([
        inflight.get(id),
        new Promise((r) => setTimeout(r, 10_000)),
      ]);
    }
    return buildDashboard(data.hourKey);
  });

export const markUsed = createServerFn({ method: "POST" })
  .validator((input: { hourKey: string }) => input)
  .handler(async ({ data }) => {
    await markBriefingUsed(data.hourKey);
    kickIngest();
    return buildDashboard();
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

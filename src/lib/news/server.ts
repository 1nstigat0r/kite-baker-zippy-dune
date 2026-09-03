import { createServerFn } from "@tanstack/react-start";
import {
  absorbFindsIntoPayload,
  briefingFromSpares,
  composeBriefing,
  composeLiveOnly,
  localizeHeadline,
} from "./compose";
import { CURRENT_BRIEFING } from "./desk";
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
import { briefingHasContent, briefingItemCount, type ArenaId, type BriefingPayload, type RawStory, type TickerItem } from "./types";

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
      ingestStories(true, "hot"),
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
    // Ticker stays scan-only — never seed from briefing/spares text.
    if (result.tickerHe.length) {
      await applyTickerHe(result.tickerHe);
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
    await ingestStories(true, "hot");
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

async function storiesFromTicker(): Promise<RawStory[]> {
  const ticker = await listTicker(48);
  return ticker.map((item) => ({
    title: item.titleHe ?? item.title,
    url: item.url,
    source: item.source,
    publishedAt: item.publishedAt,
    arena: (item.arena as ArenaId | null) ?? null,
    via: "rss" as const,
  }));
}

async function refineActiveDraft() {
  const draftId = (await getMeta("active_draft_id")) || hourKey();
  const briefing = await getBriefing(draftId);
  if (!briefingHasContent(briefing)) return;
  const payload = briefing!.payload;
  const known = new Set([
    ...payload.arenas.flatMap((a) => a.items.flatMap((i) => [i.url, i.shortUrl ?? ""])),
    ...payload.spares.flatMap((i) => [i.url, i.shortUrl ?? ""]),
  ]);
  known.delete("");
  const stories = (await storiesFromTicker()).filter((s) => !known.has(s.url));
  if (!stories.length) return;
  const updated = absorbFindsIntoPayload(payload, stories);
  await saveBriefing(draftId, await shortenPayload(updated));
}

let refineInflight: Promise<void> | null = null;

async function tickScan() {
  // Minute ticker + :45 pack are client-driven (local ticker survives Vercel cold start).
}


export const getDashboard = createServerFn({ method: "POST" })
  .validator((input: { hourKey?: string } | undefined) => input ?? {})
  .handler(async ({ data }) => {
    await tickScan();
    return buildDashboard(data.hourKey);
  });

function storiesToTicker(stories: RawStory[]): TickerItem[] {
  return stories.slice(0, 40).map((story) => ({
    id: story.url.slice(-24) || story.url,
    title: story.title,
    titleHe: hasHebrew(story.title) ? story.title : localizeHeadline(story.title, story.source),
    source: story.source,
    url: story.url,
    publishedAt: story.publishedAt,
    arena: story.arena,
  }));
}

export const scanMinute = createServerFn({ method: "POST" }).validator((input?: unknown) => input ?? {}).handler(async () => {
  const stories = await Promise.race([
    ingestStories(true, "hot"),
    new Promise<RawStory[]>((resolve) => setTimeout(() => resolve([]), 22_000)),
  ]);
  await setMeta("last_ingest_at", new Date().toISOString());
  await localizeTicker();
  return { items: storiesToTicker(stories) };
});

export const composeFromTicker = createServerFn({ method: "POST" })
  .validator((input: { items: TickerItem[] }) => input)
  .handler(async ({ data }) => {
    const stories: RawStory[] = data.items.map((item) => ({
      title: item.titleHe || item.title,
      url: item.url,
      source: item.source,
      publishedAt: item.publishedAt,
      arena: (item.arena as import("./types").ArenaId | null) ?? null,
      via: "rss" as const,
    }));
    const id = hourKey();
    const live = composeLiveOnly({ stories, previous: [], seen: [] });
    if (briefingItemCount(live) === 0) return buildDashboard(id);
    await claimBriefing(id, true);
    await saveBriefing(id, await shortenPayload(live));
    await setMeta("active_draft_id", id);
    await setMeta("last_pack_id", id);
    return buildDashboard(id);
  });

export const refreshTicker = createServerFn({ method: "POST" }).handler(async () => {
  return buildDashboard();
});

export const ensureBriefing = createServerFn({ method: "POST" })
  .validator((input: { hourKey?: string; force?: boolean } | undefined) => input ?? {})
  .handler(async ({ data }) => {
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
    const burnedUrls = new Set<string>();
    const takeUrl = (url?: string | null) => {
      if (url) burnedUrls.add(url);
    };
    // Burn briefing items only — spares must stay available to promote.
    for (const arena of current.arenas) {
      for (const item of arena.items) {
        burned.push(fingerprint(item.url, `${item.speaker} ${item.body}`));
        takeUrl(item.url);
        takeUrl(item.shortUrl);
      }
    }
    if (burned.length) await addSeen(data.hourKey || "used", burned);

    const stripBurnedUrls = (payload: BriefingPayload): BriefingPayload => {
      if (burnedUrls.size === 0) return payload;
      return {
        ...payload,
        arenas: payload.arenas
          .map((arena) => ({
            ...arena,
            items: arena.items.filter((item) => !burnedUrls.has(item.url) && !burnedUrls.has(item.shortUrl ?? "")),
          }))
          .filter((arena) => arena.items.length > 0),
        spares: (payload.spares ?? []).filter(
          (item) => !burnedUrls.has(item.url) && !burnedUrls.has(item.shortUrl ?? ""),
        ),
      };
    };

    let next = stripBurnedUrls(briefingFromSpares(current, 6));
    // Ticker restarts on the client; do not block used on a live ingest.

    if (briefingItemCount(next) === 0) {
      next = stripBurnedUrls(briefingFromSpares(current, 6));
    }

    const nowId = hourKey();
    await claimBriefing(nowId, true);
    await saveBriefing(nowId, await shortenPayload(next));
    await setMeta("active_draft_id", nowId);
    await markBriefingUsed(data.hourKey);
    await clearScan();
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

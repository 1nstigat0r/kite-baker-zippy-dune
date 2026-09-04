import { createServerFn } from "@tanstack/react-start";
import {
  absorbFindsIntoPayload,
  briefingFromSpares,
  composeBriefing,
  composeLiveOnly,
  localizeHeadline,
  localizeHeadlineAsync,
  composeTickerItem,
} from "./compose";
import { briefingHeaderNow, CURRENT_BRIEFING } from "./desk";
import { ingestStories, pureHotScan } from "./ingest";
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
import { fingerprint, formatOutlet, hasHebrew } from "./text";
import { mergeTicker, shouldPackHour } from "./ticker-loop";
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

async function storiesToTicker(stories: RawStory[]): Promise<TickerItem[]> {
  const slice = stories.slice(0, 40);
  const out: TickerItem[] = [];
  for (let i = 0; i < slice.length; i += 4) {
    const chunk = slice.slice(i, i + 4);
    const rows = await Promise.all(chunk.map((story) => composeTickerItem(story)));
    out.push(...rows.filter((row): row is TickerItem => row !== null));
  }
  return out;
}

export type DeskTickResult = {
  ticker: TickerItem[];
  packed: boolean;
  packId: string | null;
  dashboard?: Awaited<ReturnType<typeof buildDashboard>>;
  updatedAt: string;
  briefing: BriefingPayload | null;
  hourKey: string | null;
  header: string | null;
  lastPackId: string | null;
  error: string | null;
  count: number;
};

async function loadDeskTickerMeta(): Promise<TickerItem[]> {
  try {
    const raw = await getMeta("desk_ticker_json");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TickerItem[];
    return Array.isArray(parsed) ? parsed.filter((row) => row && row.url) : [];
  } catch {
    return [];
  }
}

async function saveDeskTickerMeta(items: TickerItem[]) {
  try {
    await setMeta("desk_ticker_json", JSON.stringify(items.slice(0, 16)));
  } catch (err) {
    console.warn("[deskTick] setMeta desk_ticker_json failed", err instanceof Error ? err.message : err);
  }
}

/** Autonomous desk loop: hot scan → merge ticker meta → pack at :45 Israel. */
export async function runDeskTick(): Promise<DeskTickResult> {
  const updatedAt = new Date().toISOString();
  let stories: RawStory[] = [];
  let error: string | null = null;
  try {
    stories = await Promise.race([
      pureHotScan(),
      new Promise<RawStory[]>((resolve) => setTimeout(() => resolve([]), 16_000)),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
    console.error("[deskTick]", error);
  }

  const finds = await storiesToTicker(stories);
  const prior = await loadDeskTickerMeta();
  let ticker = mergeTicker(prior, finds, new Set());
  await saveDeskTickerMeta(ticker);

  let packed = false;
  let packId: string | null = null;
  let dashboard: Awaited<ReturnType<typeof buildDashboard>> | undefined;
  let briefing: BriefingPayload | null = null;
  let hour: string | null = null;
  let header: string | null = null;

  const wantPack = shouldPackHour();
  let lastPackMeta: string | null = null;
  try {
    lastPackMeta = await getMeta("last_pack_id");
  } catch {
    lastPackMeta = null;
  }

  if (wantPack && lastPackMeta !== wantPack && ticker.length > 0) {
    const packStories: RawStory[] = ticker.map((item) => ({
      title: item.titleHe || item.title,
      url: item.url,
      source: item.source,
      publishedAt: item.publishedAt,
      arena: (item.arena as ArenaId | null) ?? null,
      via: "rss" as const,
    }));
    const id = hourKey();
    const live = composeLiveOnly({ stories: packStories, previous: [], seen: [] });
    if (briefingItemCount(live) > 0) {
      await claimBriefing(id, true);
      const shortened = await shortenPayload(live);
      await saveBriefing(id, shortened);
      try {
        await setMeta("active_draft_id", id);
        await setMeta("last_pack_id", wantPack);
        await setMeta("desk_ticker_json", "[]");
      } catch (err) {
        console.warn("[deskTick] pack meta failed", err instanceof Error ? err.message : err);
      }
      ticker = [];
      packed = true;
      packId = wantPack;
      lastPackMeta = wantPack;
      hour = id;
      briefing = shortened;
      header = briefingHeaderNow();
      dashboard = await buildDashboard(id);
    }
  }

  if (!briefing) {
    try {
      dashboard = dashboard ?? (await buildDashboard());
      const view =
        (briefingHasContent(dashboard.briefing) && dashboard.briefing) ||
        (briefingHasContent(dashboard.latestBriefing) && dashboard.latestBriefing) ||
        null;
      if (view) {
        briefing = view.payload;
        hour = view.id;
        header = `עדכון | ${view.dateLabel}, ${view.hourLabel}`;
      }
    } catch (err) {
      console.warn("[deskTick] buildDashboard failed", err instanceof Error ? err.message : err);
    }
  }

  return {
    ticker,
    packed,
    packId,
    dashboard,
    updatedAt,
    briefing,
    hourKey: hour,
    header,
    lastPackId: lastPackMeta ?? packId,
    error,
    count: stories.length,
  };
}

export const deskTick = createServerFn({ method: "POST" })
  .validator((input?: unknown) => input ?? {})
  .handler(async () => runDeskTick());

export const scanMinute = createServerFn({ method: "POST" }).validator((input?: unknown) => input ?? {}).handler(async () => {
  let stories: RawStory[] = [];
  let error: string | null = null;
  try {
    stories = await Promise.race([
      pureHotScan(),
      new Promise<RawStory[]>((resolve) => setTimeout(() => resolve([]), 16_000)),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
    console.error("[scanMinute]", error);
  }
  return {
    items: await storiesToTicker(stories),
    count: stories.length,
    error,
  };
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

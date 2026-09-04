import { readFileSync, writeFileSync } from "node:fs";
import { composeLiveOnly, composeTickerItem } from "../src/lib/news/compose.ts";
import { pureHotScan } from "../src/lib/news/ingest.ts";
import { mergeTicker, shouldPackHour } from "../src/lib/news/ticker-loop.ts";
import { hourKey, hourLabelFromKey, todayDateLabel } from "../src/lib/news/time.ts";
import type { RawStory, TickerItem } from "../src/lib/news/types.ts";
import { briefingItemCount } from "../src/lib/news/types.ts";

type DeskState = {
  updatedAt: string;
  ticker: TickerItem[];
  lastPackId: string | null;
  briefing: unknown;
  hourKey: string | null;
  header: string | null;
};

function loadState(): DeskState {
  try {
    return JSON.parse(readFileSync("desk-state.json", "utf8"));
  } catch {
    return { updatedAt: "", ticker: [], lastPackId: null, briefing: null, hourKey: null, header: null };
  }
}

async function storiesToTicker(stories: RawStory[]): Promise<TickerItem[]> {
  const slice = stories.slice(0, 40);
  const out: TickerItem[] = [];
  for (let i = 0; i < slice.length; i += 4) {
    const chunk = slice.slice(i, i + 4);
    const rows = await Promise.all(chunk.map((s) => composeTickerItem(s)));
    out.push(...rows.filter((r): r is TickerItem => r !== null));
  }
  return out;
}

const prior = loadState();
let stories: RawStory[] = [];
let error: string | null = null;
try {
  stories = await Promise.race([
    pureHotScan(),
    new Promise<RawStory[]>((resolve) => setTimeout(() => resolve([]), 16_000)),
  ]);
} catch (err) {
  error = err instanceof Error ? err.message : String(err);
}

const finds = await storiesToTicker(stories);
let ticker = mergeTicker(prior.ticker ?? [], finds, new Set());
let packed = false;
let packId: string | null = prior.lastPackId;
let briefing = prior.briefing;
let hour = prior.hourKey;
let header = prior.header;

const wantPack = shouldPackHour();
if (wantPack && prior.lastPackId !== wantPack && ticker.length > 0) {
  const packStories: RawStory[] = ticker.map((item) => ({
    title: item.titleHe || item.title,
    url: item.url,
    source: item.source,
    publishedAt: item.publishedAt,
    arena: (item.arena as any) ?? null,
    via: "rss" as const,
  }));
  const id = hourKey();
  const live = composeLiveOnly({ stories: packStories, previous: [], seen: [] });
  if (briefingItemCount(live) > 0) {
    briefing = live;
    hour = id;
    header = `עדכון | ${todayDateLabel()}, ${hourLabelFromKey(id)}`;
    packId = wantPack;
    ticker = [];
    packed = true;
  }
}

const state: DeskState = {
  updatedAt: new Date().toISOString(),
  ticker: ticker.slice(0, 12),
  lastPackId: packId,
  briefing,
  hourKey: hour,
  header,
};
const body = JSON.stringify(state, null, 2) + "\n";
writeFileSync("desk-state.json", body);
writeFileSync("public/desk-state.json", body);
console.log(JSON.stringify({
  count: stories.length,
  ticker: state.ticker.length,
  packed,
  error,
  updatedAt: state.updatedAt,
  sample: state.ticker[0]?.titleHe?.slice(0, 100) ?? null,
}, null, 2));

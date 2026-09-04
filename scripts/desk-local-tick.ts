/**
 * Box-local desk tick for when live /api/desk/tick is unavailable.
 * 1) Prefer runDeskTick (PGLite + pureHotScan + compose).
 * 2) If ticker empty (common when gtx translate is 429), wide-scan RSS/TG
 *    and build Hebrew ticker items offline via glossary + news-hook templates.
 *
 * Prints one JSON line (DeskTickResult shape) to stdout.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { composeTickerItem } from "../src/lib/news/compose.ts";
import { pureHotScan } from "../src/lib/news/ingest.ts";
import { runDeskTick } from "../src/lib/news/server.ts";
import { RSS_SOURCES, TELEGRAM_SOURCES } from "../src/lib/news/sources.ts";
import { mergeTicker } from "../src/lib/news/ticker-loop.ts";
import {
  failsTickerQuality,
  formatOutlet,
  hasHebrew,
  isDeskStory,
  isOffPrimarySource,
  isOffTheater,
  isPropagandaCopy,
  isUsDomesticOffDesk,
  resolveArena,
  stripHtml,
  tooMuchLatin,
  toDeskHebrew,
} from "../src/lib/news/text.ts";
import type { RawStory, TickerItem } from "../src/lib/news/types.ts";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

/** Offline EN→HE for desk lines when Google gtx is rate-limited. */
const PHRASES: Array<[RegExp, string]> = [
  [/retaliates? with missiles?(?: and drones?)?/gi, "הגיבה בטילים ובכטב״מים"],
  [/defying trump['’]?s? warning/gi, " בניגוד לאזהרת טראמפ"],
  [/offers? options? to bypass hormuz/gi, "מציעה נתיבים לעקיפת הורמוז"],
  [/eyeing role as middle east hub/gi, "מבקשת להיות צומת במזרח התיכון"],
  [/trade strikes? for first time in weeks/gi, "מחליפות תקיפות לראשונה מזה שבועות"],
  [/investigating if missile hit/gi, "בודקת אם טיל פגע ב"],
  [/iranian attack on saudi tanker/gi, "תקיפה איראנית על מכלית סעודית"],
  [/killed two filipino sailors/gi, "הרגה שני מלחים פיליפינים"],
  [/houthi escalation in western yemen/gi, "הסלמת החות׳ים במערב תימן"],
  [/kills? (\d+) government forces/gi, "הרגה $1 אנשי כוחות ממשל"],
  [/farmers? detained by israel in lebanon/gi, "חקלאים נעצרו בידי ישראל בלבנון"],
  [/status of iran['’]?s? nuclear program/gi, "מצב תוכנית הגרעין של איראן"],
  [/is unclear/gi, "אינו ברור"],
  [/u\.?n\.? watchdog says/gi, "לפי הסוכנות הבינלאומית לאנרגיה אטומית"],
  [/cleared tunnels? to (?:a )?strategic hezbollah fortress/gi, "טיהרה מנהרות למבצר אסטרטגי של חיזבאללה"],
  [/hezbollah(?:'s)? (?:ali taher )?ridge tunnels?/gi, "מנהרות רכס חיזבאללה"],
  [/strategic hezbollah fortress/gi, "מבצר אסטרטגי של חיזבאללה"],
  [/fires? missiles?(?: and drones?)? at/gi, "ירתה טילים על"],
  [/strikes? resume/gi, "התקיפות מתחדשות"],
  [/war with(?: the)? u\.?s\.?/gi, "המלחמה עם ארה״ב"],
  [/israel says(?: that)?/gi, "ישראל הודיעה ש"],
  [/idf says(?: that)?/gi, "צה״ל הודיע ש"],
  [/netanyahu:?/gi, "נתניהו:"],
  [/toppling (?:the )?iranian regime/gi, "הפלת המשטר האיראני"],
  [/central mission/gi, "משימה מרכזית"],
  [/iran(?:ian)?/gi, "איראן"],
  [/hezbollah/gi, "חיזבאללה"],
  [/houthi(?:s)?/gi, "חות׳ים"],
  [/lebanon/gi, "לבנון"],
  [/syria(?:n)?/gi, "סוריה"],
  [/gaza/gi, "עזה"],
  [/kuwait/gi, "כווית"],
  [/iraq(?:i)?/gi, "עיראק"],
  [/yemen(?:i)?/gi, "תימן"],
  [/tehran/gi, "טהרן"],
  [/beirut/gi, "ביירות"],
  [/missile(?:s)?/gi, "טילים"],
  [/drone(?:s)?/gi, "כטב״מים"],
  [/airstrike(?:s)?|air strikes?/gi, "תקיפות אוויריות"],
  [/strike(?:s)?/gi, "תקיפות"],
  [/tunnel(?:s)?/gi, "מנהרות"],
  [/fortress/gi, "מבצר"],
  [/nuclear/gi, "גרעין"],
  [/sanctions?/gi, "סנקציות"],
  [/ceasefire|cease-fire/gi, "הפסקת אש"],
  [/hostage(?:s)?/gi, "חטופים"],
  [/pentagon/gi, "הפנטגון"],
  [/white house/gi, "הבית הלבן"],
  [/\btrump\b/gi, "טראמפ"],
  [/\bvance\b/gi, "ואנס"],
  [/\bisrael(?:i)?\b/gi, "ישראל"],
  [/\bus\b|\bu\.s\.\b|united states/gi, "ארה״ב"],
  [/says(?: that)?/gi, "מסר ש"],
  [/announces?/gi, "הודיע"],
  [/threatens?/gi, "איים"],
  [/attacks?/gi, "תקיפה"],
  [/kills?|killed/gi, "הרג"],
  [/enters?|entered/gi, "נכנס"],
  [/cleared?/gi, "טיהר"],
];

function offlineDeskHe(title: string): string {
  let s = toDeskHebrew(title || "");
  for (const [re, he] of PHRASES) s = s.replace(re, he);
  s = s
    .replace(/[A-Za-z]+(?:['’][A-Za-z]+)*/g, " ")
    .replace(/\s*[,:;]+\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/^\s*[—–-]\s*|\s*[—–-]\s*$/g, "")
    .trim();
  if (!/תקיפ|טיל|מסר|הודיע|איים|ירה|חיזבאללה|חות|הורמוז|גרעין|סנקצ|כטב|מנהר/i.test(s)) {
    if (/איראן|לבנון|סוריה|תימן|עזה|עיראק|כווית|ישראל/.test(s)) {
      s = `מסר: ${s}`;
    }
  }
  if (!hasHebrew(s) || tooMuchLatin(s) || s.length < 18) return "";
  if (failsTickerQuality(s)) return "";
  return s.slice(0, 160);
}

function forceTickerItem(story: RawStory): TickerItem | null {
  const titleHe =
    hasHebrew(story.title) && !tooMuchLatin(story.title)
      ? story.title.slice(0, 160)
      : offlineDeskHe(story.title);
  if (!titleHe || tooMuchLatin(titleHe) || failsTickerQuality(titleHe)) return null;
  if (!story.url) return null;
  return {
    id: story.url.slice(-24) || story.url,
    title: story.title,
    titleHe,
    source: formatOutlet(story.source),
    url: story.url,
    publishedAt: story.publishedAt,
    arena: resolveArena(`${story.source} ${titleHe}`, story.arena),
  };
}

async function fetchText(url: string, ms = 5000): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(ms),
      redirect: "follow",
      headers: {
        "user-agent": UA,
        accept:
          "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.9, */*;q=0.8",
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function parseRssLoose(xml: string, source: string): RawStory[] {
  const blocks =
    xml.match(/<item[\s\S]*?<\/item>/gi) ??
    xml.match(/<entry[\s\S]*?<\/entry>/gi) ??
    [];
  const items: RawStory[] = [];
  for (const block of blocks.slice(0, 12)) {
    const title = stripHtml(block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
    const url =
      stripHtml(block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] || "") ||
      block.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] ||
      "";
    if (!title || !url || title.length < 12) continue;
    const desc = stripHtml(block.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] || "");
    const text = `${title} ${desc}`;
    if (!isDeskStory(text)) continue;
    if (
      isUsDomesticOffDesk(text) ||
      isOffPrimarySource(text, source) ||
      isOffTheater(text, source) ||
      isPropagandaCopy(text)
    )
      continue;
    items.push({
      title: title.slice(0, 220),
      url: url.trim(),
      source,
      publishedAt: new Date().toISOString(),
      arena: resolveArena(text),
      via: "rss",
    });
  }
  return items;
}

async function wideScan(): Promise<RawStory[]> {
  const preferUrls = new Set([
    "https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml",
    "https://feeds.washingtonpost.com/rss/world",
    "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",
    "https://www.al-monitor.com/rss",
    "https://www.timesofisrael.com/feed/",
  ]);
  const extras: Array<{ name: string; url: string }> = [
    { name: "ה-NYT", url: "https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml" },
    { name: "ה-Washington Post", url: "https://feeds.washingtonpost.com/rss/world" },
    { name: "BBC ME", url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml" },
    { name: "Al-Monitor", url: "https://www.al-monitor.com/rss" },
    { name: "Times of Israel", url: "https://www.timesofisrael.com/feed/" },
  ];
  const rss = [
    ...extras,
    ...RSS_SOURCES.filter((s) => preferUrls.has(s.url) || /middle|world|iran|lebanon/i.test(s.url)),
  ].slice(0, 16);
  const seenRss = new Set<string>();
  const jobs = rss.filter((s) => {
    if (seenRss.has(s.url)) return false;
    seenRss.add(s.url);
    return true;
  });

  const first = await pureHotScan();
  const batches = await Promise.all(
    jobs.map(async (src) => {
      const xml = await fetchText(src.url, 6000);
      if (!xml) return [] as RawStory[];
      return parseRssLoose(xml, src.name);
    }),
  );

  const tgPool = TELEGRAM_SOURCES.filter((s) => !s.indicator).slice(0, 8);
  const tgBatches = await Promise.all(
    tgPool.map(async (src) => {
      const html = await fetchText(`https://t.me/s/${src.channel}`, 5000);
      if (!html) return [] as RawStory[];
      // Reuse ingest via pureHotScan coverage; loose: skip if no Hebrew (compose/offline handles EN)
      return [] as RawStory[];
    }),
  );
  void tgBatches;

  const merged: RawStory[] = [];
  const seen = new Set<string>();
  for (const story of [...first, ...batches.flat()]) {
    const key = story.url.replace(/\/$/, "");
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(story);
  }
  return merged.slice(0, 40);
}

async function storiesToTicker(stories: RawStory[]): Promise<TickerItem[]> {
  const out: TickerItem[] = [];
  for (let i = 0; i < stories.length; i += 4) {
    const chunk = stories.slice(i, i + 4);
    const rows = await Promise.all(
      chunk.map(async (story) => {
        try {
          return (await composeTickerItem(story)) ?? forceTickerItem(story);
        } catch {
          return forceTickerItem(story);
        }
      }),
    );
    out.push(...rows.filter((r): r is TickerItem => r !== null));
  }
  return out;
}

function readPriorTicker(): TickerItem[] {
  try {
    const raw = JSON.parse(readFileSync(join(process.cwd(), "desk-state.json"), "utf8"));
    return Array.isArray(raw.ticker) ? raw.ticker : [];
  } catch {
    return [];
  }
}

async function main() {
  let result = await runDeskTick();

  if (!result.ticker?.length) {
    const stories = await wideScan();
    const finds = await storiesToTicker(stories);
    const ticker = mergeTicker(readPriorTicker(), finds, new Set());
    result = {
      ...result,
      ticker,
      count: Math.max(result.count ?? 0, stories.length),
      updatedAt: new Date().toISOString(),
      _localWide: true,
    } as typeof result & { _localWide?: boolean };
  }

  process.stdout.write(JSON.stringify(result) + "\n");
}

main().catch((err) => {
  console.error("[desk-local-tick]", err instanceof Error ? err.stack || err.message : err);
  process.exit(1);
});

import {
  ARENA_META,
  listItemIds,
  sortArenas,
  type ArenaId,
  type BriefingItem,
  type BriefingPayload,
  type SpareItem,
} from "./types";
import { formatHeDateTime, hourLabelFromKey, hourKey, todayDateLabel } from "./time";

function item(
  id: string,
  speaker: string,
  body: string,
  url: string,
  shortUrl: string,
): BriefingItem {
  return {
    id,
    speaker,
    body,
    url,
    shortUrl,
    publishedAt: "2026-09-03T20:40:00+03:00",
  };
}

function spare(
  id: string,
  arena: ArenaId,
  speaker: string,
  body: string,
  url: string,
  shortUrl: string,
): SpareItem {
  return { arena, ...item(id, speaker, body, url, shortUrl) };
}

function arena(id: ArenaId, items: BriefingItem[]) {
  return { id, title: ARENA_META[id].title, flags: ARENA_META[id].flags, items };
}

function sortArenasPayload(payload: BriefingPayload): BriefingPayload {
  return { arenas: sortArenas(payload.arenas), spares: payload.spares };
}

/** Cold-start seed when ingest is empty — never invent URLs beyond this curated set. */
export const CURRENT_BRIEFING: BriefingPayload = sortArenasPayload({
  arenas: [
    arena("lebanon", [
      item(
        "m1",
        "גורמים ל-MTV",
        "חיזבאללה בלמו ניסיון התקדמות ישראלי לעבר **גבעות עלי אלטאהר** אחרי חצות.",
        "https://www.mtv.com.lb/en/News/Local/1732953/hezbollah-says-it-stopped-israeli-advance-at-ali-al-taher",
        "https://katzr.net/94b123",
      ),
    ]),
    arena("gulf", [
      item(
        "m2",
        "דווח ב-אלערבי אלגדיד",
        "**שלושה מבצעים נדירים** להוצאת גז מקטר ומאע\"מ מחוץ להורמוז, אחרי פגיעה בשתי אוניות.",
        "https://www.alaraby.co.uk/economy/%D9%86%D8%A7%D9%82%D9%84%D8%A7%D8%AA-%D8%AC%D8%B1%D9%8A%D8%AD%D8%A9-3-%D8%B9%D9%85%D9%84%D9%8A%D8%A7%D8%AA-%D9%86%D8%A7%D8%AF%D8%B1%D8%A9-%D9%84%D8%A5%D8%AE%D8%B1%D8%A7%D8%AC-%D8%BA%D8%A7%D8%B2-%D9%82%D8%B7%D8%B1-%D9%88%D8%A7%D9%84%D8%A5%D9%85%D8%A7%D8%B1%D8%A7%D8%AA-%D8%B9%D8%A8%D8%B1-%D9%87%D8%B1%D9%85%D8%B2",
        "https://katzr.net/c3ac4b",
      ),
      item(
        "m3",
        "דווח ב-FT",
        "ריאד מקדמת ביטוח ממשלתי לאוניות עד **186 מיליון דולר** לאירוע, כולל השתלטות או תקיפה.",
        "https://www.ft.com/content/fce79e4a-3979-4af9-b8e5-27aeb890e53b",
        "https://katzr.net/863429",
      ),
    ]),
    arena("axis", [
      item(
        "m4",
        "דווח ב-Arab News",
        "עיראק בוחנת **צינור דרך סוריה** כדי לעקוף את הורמוז.",
        "https://www.arabnews.com/middle-east/web-only-spotlight-can-iraq-bypass-hormuz-with-syria-oil-route-3000110",
        "https://katzr.net/a061b2",
      ),
    ]),
    arena("iran", [
      item(
        "m5",
        "האלחורה",
        "יותר מ-**30 העברות אונייה-לאונייה** של נפט איראני לעקיפת הסגר.",
        "https://alhurra.com/en/37210",
        "https://katzr.net/c5a738",
      ),
    ]),
    arena("intl", [
      item(
        "m6",
        "גורם צבאי אמריקני ל-Erem",
        "שלושה תרחישים אחרי המכה: תגובה מוגבלת; פגיעה באוניות או הנחת מוקשים; פגיעה בכוחות ארה\"ב או סגירת הורמוז — אז **מכה רחבה יותר**.",
        "https://www.eremnews.com/news/world/2yxhb1i",
        "https://katzr.net/863ab4",
      ),
    ]),
  ],
  spares: [],
});

CURRENT_BRIEFING.spares = [
  spare(
    "s1",
    "gulf",
    "האלשרק",
    "קואליציה ימית רב-לאומית החלה לפעול ממפקדה בסעודיה; **39 מדינות** בישיבת התכנון.",
    "https://english.aawsat.com/gulf/5314000-multinational-maritime-defense-coalition-begins-operations-saudi-headquarters",
    "https://katzr.net/3ee24d",
  ),
  spare(
    "s2",
    "intl",
    "דווח ב-Erem",
    "טראמפ בוחן הכרזה על **סיום המלחמה**; במקביל משהח ניתק סניפי **בנק מצרים במאע\"מ** מהמערכת האמריקנית.",
    "https://www.eremnews.com/news/world/0fln8gi",
    "https://katzr.net/245318",
  ),
  spare(
    "s3",
    "gulf",
    "גורמים צבאיים אמריקניים ל-Erem",
    "וושינגטון עוברת ל**לחץ צבאי מתגלגל** אחרי תקיפת פלטפורמות מוקשים ב**לארק**.",
    "https://www.eremnews.com/news/world/97ioome",
    "https://katzr.net/e72bb0",
  ),
  spare(
    "s4",
    "gulf",
    "האלשרק",
    "ריאד גינתה פגיעה איראנית ב**מכלית סעודית** בהורמוז.",
    "https://english.aawsat.com/gulf/5313848-riyadh-condemns-iran-attack-saudi-vessel-hormuz",
    "https://katzr.net/2329da",
  ),
  spare(
    "s5",
    "intl",
    "גורם אמריקני ל-אלערביה",
    "תקיפות 1/9 נועדו **לסכל כוונה איראנית לפגוע בכבלים תת-ימיים** בהורמוז.",
    "https://www.iranintl.com/en/202609028802",
    "https://katzr.net/41ffd6",
  ),
  spare(
    "s6",
    "lebanon",
    "הסוכנות הלאומית",
    "**שלושה פיצוצים** בבני חיאן במרג' עיון.",
    "https://www.aljadeed.tv/news/%D9%85%D8%AD%D9%84%D9%8A%D8%A7%D8%AA/587669/%D8%A7%D9%84%D9%88%D9%83%D8%A7%D9%84%D8%A9-%D8%A7%D9%84%D9%88%D8%B7%D9%86%D9%8A%D8%A9-%D8%A7%D9%84%D8%AC%D9%8A%D8%B4-%D8%A7%D9%84%D8%A5%D8%B3%D8%B1%D8%A7%D8%A6%D9%8A%D9%84%D9%8A%D9%91-%D9%86%D9%81%D9%91%D8%B0-3-%D8%AA%D9%81%D8%AC%D9%8A%D8%B1%D8%A7%D8%AA-%D9%81%D9%8A-%D8%A8%D9%84%D8%AF%D8%A9-%D8%A8%D9%86%D9%8A-%D8%AD%D9%8A%D8%A7%D9%86-%D9%82%D8%B6%D8%A7%D8%A1",
    "https://katzr.net/0bcd15",
  ),
  spare(
    "s7",
    "lebanon",
    "מקור מדיני ל-האלשרק",
    "פינוי חיזבאללה מ**עלי אלטאהר** בראש סדר היום של **רומא-3**.",
    "https://aawsat.com/%D8%A7%D9%84%D8%B9%D8%A7%D9%84%D9%85-%D8%A7%D9%84%D8%B9%D8%B1%D8%A8%D9%8A/%D8%A7%D9%84%D9%85%D8%B4%D8%B1%D9%82-%D8%A7%D9%84%D8%B9%D8%B1%D8%A8%D9%8A/5306603",
    "https://katzr.net/268467",
  ),
  spare(
    "s8",
    "axis",
    "האלח'באר",
    "צנעא מעניקה ל**ווסת העומאני הזדמנות אחרונה** לפני סבב הסלמה; אחרי יותר מחודש של **«מצור תמורת מצור»**.",
    "https://www.al-akhbar.com/NewspaperArticles/arab/903195/",
    "https://katzr.net/841312",
  ),
  spare(
    "s9",
    "intl",
    "שני גורמים ל-Axios",
    "שליח הבית הלבן נועד בסרדיניה עם יועץ הביטחון של מאע\"מ על **הצעד הבא מול איראן**; הפגישה **לא פורסמה**.",
    "https://www.axios.com/2026/09/02/witkoff-uae-iran-war-trump-bessent",
    "https://katzr.net/573a02",
  ),
  spare(
    "s10",
    "iran",
    "שלושה גורמים איראניים ל-האלשרק",
    "הלחץ האמריקני נושך; טעינות נפט ירדו ל-**260 אלף חביות ליום**; הריאל מעל **2.2 מיליון** לדולר.",
    "https://english.aawsat.com/world/5314377-us-pressure-iran-starting-tell-sanctions-and-blockade-bite",
    "https://katzr.net/8f609b",
  ),
];

export type TickerLine = { source: string; text: string; url: string };

export const TICKER: TickerLine[] = [
  { source: "גורמים ל-MTV", text: "חיזבאללה בלמו ניסיון התקדמות לעבר עלי אלטאהר", url: "https://katzr.net/94b123" },
  { source: "דווח ב-אלערבי אלגדיד", text: "שלושה מבצעים נדירים להוצאת גז מקטר ומאע\"מ מחוץ להורמוז", url: "https://katzr.net/c3ac4b" },
  { source: "דווח ב-Arab News", text: "עיראק בוחנת צינור דרך סוריה לעקיפת הורמוז", url: "https://katzr.net/a061b2" },
  { source: "גורם צבאי אמריקני ל-Erem", text: "שלושה תרחישים — עד מכה רחבה יותר", url: "https://katzr.net/863ab4" },
  { source: "האלחורה", text: "יותר מ-30 העברות אונייה-לאונייה של נפט איראני", url: "https://katzr.net/c5a738" },
  { source: "דווח ב-FT", text: "ריאד מקדמת ביטוח אוניות עד 186 מיליון דולר", url: "https://katzr.net/863429" },
];

export function briefingHeaderNow() {
  return `עדכון | ${todayDateLabel()}, ${hourLabelFromKey(hourKey())}`;
}

export const BRIEFING_HEADER = briefingHeaderNow();
export const SWAP_EVERY_MS = 12_000;
export const SCAN_MS = 40 * 60 * 1000;

const USED_KEY = "idkun-used-at-v10";
const PAYLOAD_KEY = "idkun-payload-v10";
const ORIG_KEY = "idkun-orig-ids-v10";
const QUEUE_KEY = "idkun-queue-at-v10";
const BURN_URLS_KEY = "idkun-burned-urls-v9";

function lsGet(key: string): string | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key: string, value: string) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, value);
  } catch {
    /* iframe */
  }
}

export function loadUsedAt(): number | null {
  const raw = lsGet(USED_KEY);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : null;
}

export function loadOriginalIds(): string[] {
  try {
    const raw = lsGet(ORIG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadQueueAt(): number {
  const n = Number(lsGet(QUEUE_KEY) ?? "0");
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function saveQueueAt(n: number) {
  lsSet(QUEUE_KEY, String(n));
}

export function loadBurnedUrls(): Set<string> {
  try {
    const raw = lsGet(BURN_URLS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed.filter((u) => typeof u === "string" && u) : []);
  } catch {
    return new Set();
  }
}

function persistBurnedUrls(urls: Set<string>) {
  lsSet(BURN_URLS_KEY, JSON.stringify([...urls].slice(-500)));
}

function collectBriefingUrls(payload: BriefingPayload): string[] {
  const urls: string[] = [];
  for (const arena of payload.arenas) {
    for (const item of arena.items) {
      if (item.url) urls.push(item.url);
      if (item.shortUrl) urls.push(item.shortUrl);
    }
  }
  return urls;
}

export function stripBurned(payload: BriefingPayload): BriefingPayload {
  const burned = loadBurnedUrls();
  if (burned.size === 0) return payload;
  return {
    ...payload,
    arenas: payload.arenas
      .map((arena) => ({
        ...arena,
        items: arena.items.filter((item) => !burned.has(item.url) && !burned.has(item.shortUrl ?? "")),
      }))
      .filter((arena) => arena.items.length > 0),
    spares: (payload.spares ?? []).filter(
      (item) => !burned.has(item.url) && !burned.has(item.shortUrl ?? ""),
    ),
  };
}

export function burnSeedBriefingUrls() {
  const burned = loadBurnedUrls();
  for (const arena of CURRENT_BRIEFING.arenas) {
    for (const item of arena.items) {
      if (item.url) burned.add(item.url);
      if (item.shortUrl) burned.add(item.shortUrl);
    }
  }
  persistBurnedUrls(burned);
}

export function clearUsedLocal() {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(USED_KEY);
    localStorage.removeItem(ORIG_KEY);
    localStorage.removeItem(QUEUE_KEY);
  } catch {
    /* iframe */
  }
}

export function markUsedLocal(payload: BriefingPayload) {

  lsSet(USED_KEY, String(Date.now()));
  lsSet(ORIG_KEY, JSON.stringify(listItemIds(payload)));
  lsSet(QUEUE_KEY, "0");
  const burned = loadBurnedUrls();
  for (const url of collectBriefingUrls(payload)) burned.add(url);
  persistBurnedUrls(burned);
}

export function scanDueAt(usedAt: number) {
  return usedAt + SCAN_MS;
}

export function isScanning(usedAt: number | null) {
  if (!usedAt) return false;
  return Date.now() < scanDueAt(usedAt);
}

export function payloadItemCount(payload: BriefingPayload) {
  return payload.arenas.reduce((sum, arena) => sum + arena.items.length, 0);
}

/** True when payload still looks like the static seed exclusives. */
export function looksLikeSeed(payload: BriefingPayload) {
  const seedUrls = new Set(
    CURRENT_BRIEFING.arenas.flatMap((a) => a.items.map((i) => i.url)),
  );
  const urls = payload.arenas.flatMap((a) => a.items.map((i) => i.url));
  if (!urls.length) return false;
  const hit = urls.filter((u) => seedUrls.has(u)).length;
  return hit >= Math.min(3, urls.length) && hit / urls.length >= 0.5;
}

export function activePayload(): BriefingPayload {
  const raw = lsGet(PAYLOAD_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as BriefingPayload;
      const stripped = stripBurned(parsed);
      const count = stripped.arenas.reduce((sum, arena) => sum + arena.items.length, 0);
      if (count > 0) return stripped;
    } catch {
      /* ignore */
    }
  }
  const seed = stripBurned(structuredClone(CURRENT_BRIEFING));
  const seedCount = seed.arenas.reduce((sum, arena) => sum + arena.items.length, 0);
  if (seedCount > 0) return seed;
  // Last resort: never show a blank card even if burns wiped the seed.
  return structuredClone(CURRENT_BRIEFING);
}

export function persistPayloadLocal(payload: BriefingPayload) {
  lsSet(PAYLOAD_KEY, JSON.stringify(payload));
}

export function formatDue(ts: number) {
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: "Asia/Jerusalem",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(ts));
}

export function remainingOriginal(payload: BriefingPayload, originalIds: string[]) {
  const live = new Set(listItemIds(payload));
  return originalIds.filter((id) => live.has(id));
}

export { formatHeDateTime, hourKey, hourLabelFromKey, todayDateLabel };

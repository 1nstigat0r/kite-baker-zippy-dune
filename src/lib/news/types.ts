export const ARENA_ORDER = [
  "iran",
  "lebanon",
  "north",
  "axis",
  "gulf",
  "turkey",
  "region",
  "intl",
] as const;

export type ArenaId = (typeof ARENA_ORDER)[number];

export type BriefingItem = {
  id: string;
  speaker: string;
  body: string;
  url: string;
  shortUrl?: string;
  publishedAt: string;
};

export type SpareItem = BriefingItem & { arena: ArenaId };

export type BriefingArena = {
  id: ArenaId;
  title: string;
  flags: string[];
  items: BriefingItem[];
};

export type BriefingPayload = {
  arenas: BriefingArena[];
  spares: SpareItem[];
  desk?: number;
};

export type BriefingRecord = {
  id: string;
  hourLabel: string;
  dateLabel: string;
  generatedAt: string;
  status: "generating" | "ready" | "error";
  error?: string | null;
  payload: BriefingPayload;
};

export type HourChip = {
  id: string;
  hourLabel: string;
  status: "generating" | "ready" | "error";
};

export type TickerItem = {
  id: string;
  title: string;
  titleHe: string | null;
  source: string;
  url: string;
  publishedAt: string | null;
  arena: string | null;
};

export type DashboardData = {
  briefing: BriefingRecord | null;
  latestBriefing: BriefingRecord | null;
  hours: HourChip[];
  ticker: TickerItem[];
  scanQueue: SpareItem[];
  currentHourKey: string;
  currentClock: string;
  currentDateLabel: string;
  generatingHour: string | null;
  scanningNext: boolean;
  scanDueAt: string | null;
  scanDueLabel: string | null;
};

export type RawStory = {
  title: string;
  url: string;
  source: string;
  publishedAt: string | null;
  arena: ArenaId | null;
  via: "rss" | "telegram";
};

export const DESK_STYLE = 1;

export const ARENA_META: Record<ArenaId, { title: string; flags: string[] }> = {
  iran: { title: "איראן", flags: ["ir"] },
  lebanon: { title: "לבנון", flags: ["lb"] },
  north: { title: "סוריה", flags: ["sy"] },
  axis: { title: "הציר", flags: ["ye", "iq"] },
  gulf: { title: "המפרציות", flags: ["sa", "ae"] },
  turkey: { title: "תורכיה", flags: ["tr"] },
  region: { title: "באזור", flags: ["eg"] },
  intl: { title: "בינ״ל", flags: ["globe"] },
};

export const FLAG_EMOJI: Record<string, string> = {
  ir: "🇮🇷",
  lb: "🇱🇧",
  sy: "🇸🇾",
  ye: "🇾🇪",
  iq: "🇮🇶",
  sa: "🇸🇦",
  ae: "🇦🇪",
  qa: "🇶🇦",
  kw: "🇰🇼",
  bh: "🇧🇭",
  om: "🇴🇲",
  tr: "🇹🇷",
  eg: "🇪🇬",
  jo: "🇯🇴",
  us: "🇺🇸",
  globe: "🌐",
};

const FLAG_MARKS: { code: string; re: RegExp }[] = [
  { code: "ir", re: /איראן|טהראן|פזשכיאן|קאליבאף|משה["״]מ|הורמוז/ },
  { code: "lb", re: /לבנון|ביירות|חיזבאללה|עלי אלטאהר|דאחיה|בעלבק|הרמל/ },
  { code: "sy", re: /סוריה|דמשק|אלשרע/ },
  { code: "ye", re: /תימן|חות['׳]ים|צנעא|מצור תמורת מצור/ },
  { code: "iq", re: /עיראק|בגדאד|אלגיוס העממי|עצאא['׳]ב|פלוגות|אלנוג['׳]בא|בדר/ },
  { code: "sa", re: /סעודיה|ריאד/ },
  { code: "ae", re: /אמירויות|מאע["״]מ|אבו דאבי/ },
  { code: "qa", re: /קטר|דוחא/ },
  { code: "kw", re: /כווית/ },
  { code: "bh", re: /בחריין/ },
  { code: "jo", re: /ירדן/ },
  { code: "tr", re: /תורכיה|אנקרה|ארדואן/ },
  { code: "eg", re: /מצרים|קהיר|סיסי/ },
];

export function flagsForItems(items: BriefingItem[]): string[] {
  const ordered: string[] = [];
  for (const item of items) {
    const text = `${item.speaker} ${item.body}`;
    for (const mark of FLAG_MARKS) {
      if (mark.re.test(text) && !ordered.includes(mark.code)) ordered.push(mark.code);
    }
  }
  return ordered;
}

export function arenaPresentation(id: ArenaId, items: BriefingItem[]) {
  if (id === "intl") return { title: "בינ״ל", flags: ["globe"] as string[] };
  if (id === "iran") return { title: "איראן", flags: ["ir"] as string[] };
  const flags = flagsForItems(items).map((c) => c.toLowerCase()).filter((c) => c !== "us");
  const names: Record<string, string> = {
    ir: "איראן",
    lb: "לבנון",
    sy: "סוריה",
    ye: "תימן",
    iq: "עיראק",
    sa: "סעודיה",
    ae: "מאע״מ",
    qa: "קטר",
    kw: "כווית",
    bh: "בחריין",
    eg: "מצרים",
    tr: "תורכיה",
  };
  if (id === "axis" && flags.length === 1 && names[flags[0]]) {
    return { title: names[flags[0]], flags };
  }
  if (id === "gulf") {
    const gulfOnly = flags.filter((c) => ["sa", "ae", "qa", "kw", "bh", "om"].includes(c));
    if (gulfOnly.length === 1 && names[gulfOnly[0]]) {
      return { title: names[gulfOnly[0]], flags: gulfOnly };
    }
    return { title: "המפרציות", flags: gulfOnly.length ? gulfOnly : ["sa", "ae"] };
  }
  if (flags.length === 1 && names[flags[0]]) {
    return { title: names[flags[0]], flags };
  }
  if (flags.length > 1) {
    return { title: ARENA_META[id].title, flags };
  }
  return { title: ARENA_META[id].title, flags: ARENA_META[id].flags };
}

function clonePayload(payload: BriefingPayload): BriefingPayload {
  return {
    desk: payload.desk,
    arenas: payload.arenas.map((arena) => ({
      ...arena,
      items: arena.items.map((item) => ({ ...item })),
    })),
    spares: payload.spares.map((row) => ({ ...row })),
  };
}

export function briefingItemCount(payload: BriefingPayload) {
  return payload.arenas.reduce((sum, arena) => sum + arena.items.length, 0);
}

export function briefingHasContent(rec: BriefingRecord | null | undefined) {
  if (!rec) return false;
  return briefingItemCount(rec.payload) > 0;
}

function findSpareIndex(spares: SpareItem[], id: string) {
  return spares.findIndex((row) => row.id === id || row.url === id);
}

function findItemLoc(arenas: BriefingArena[], id: string) {
  for (let ai = 0; ai < arenas.length; ai += 1) {
    const ii = arenas[ai].items.findIndex((row) => row.id === id || row.url === id);
    if (ii >= 0) return { ai, ii };
  }
  return null;
}

function getOrCreateArena(arenas: BriefingArena[], id: ArenaId): BriefingArena {
  let arena = arenas.find((row) => row.id === id);
  if (!arena) {
    const meta = ARENA_META[id];
    arena = { id, title: meta.title, flags: meta.flags, items: [] };
    arenas.push(arena);
  }
  return arena;
}

export function sortArenas(arenas: BriefingArena[]): BriefingArena[] {
  const byId = new Map(
    arenas.filter((arena) => arena.items.length > 0).map((arena) => [arena.id, arena]),
  );
  return ARENA_ORDER.filter((id) => byId.has(id)).map((id) => {
    const arena = byId.get(id)!;
    const shown = arenaPresentation(id, arena.items);
    return { ...arena, title: shown.title, flags: shown.flags };
  });
}

export function applySwap(
  payload: BriefingPayload,
  spareId: string,
  itemId: string,
): BriefingPayload | null {
  const next = clonePayload(payload);
  const spareIndex = findSpareIndex(next.spares, spareId);
  const loc = findItemLoc(next.arenas, itemId);
  if (spareIndex < 0 || !loc) return null;
  const spare = next.spares[spareIndex];
  const from = next.arenas[loc.ai];
  const item = from.items[loc.ii];
  from.items.splice(loc.ii, 1);
  const targetId = ARENA_META[spare.arena] ? spare.arena : from.id;
  const to = getOrCreateArena(next.arenas, targetId);
  to.items.push({
    id: spare.id,
    speaker: spare.speaker,
    body: spare.body,
    url: spare.url,
    shortUrl: spare.shortUrl,
    publishedAt: spare.publishedAt,
  });
  next.spares[spareIndex] = { ...item, arena: from.id };
  next.arenas = sortArenas(next.arenas);
  return next;
}


export function applyRemoveItem(payload: BriefingPayload, itemId: string): BriefingPayload | null {
  const next = clonePayload(payload);
  const loc = findItemLoc(next.arenas, itemId);
  if (!loc) return null;
  const item = next.arenas[loc.ai].items[loc.ii];
  next.arenas[loc.ai].items.splice(loc.ii, 1);
  const drop = new Set([item.id, item.url, item.shortUrl ?? ""]);
  next.spares = next.spares.filter(
    (row) => !drop.has(row.id) && !drop.has(row.url) && !drop.has(row.shortUrl ?? ""),
  );
  next.arenas = sortArenas(next.arenas);
  return next;
}

export function applyEditItem(
  payload: BriefingPayload,
  itemId: string,
  patch: { speaker?: string; body?: string },
): BriefingPayload | null {
  const next = clonePayload(payload);
  const loc = findItemLoc(next.arenas, itemId);
  if (!loc) return null;
  const item = next.arenas[loc.ai].items[loc.ii];
  if (patch.speaker !== undefined) item.speaker = patch.speaker.trim();
  if (patch.body !== undefined) item.body = patch.body.trim();
  if (!item.body) return null;
  return next;
}

export function applyAdd(payload: BriefingPayload, spareId: string): BriefingPayload | null {
  if (briefingItemCount(payload) >= 8) return null;
  const next = clonePayload(payload);
  const spareIndex = findSpareIndex(next.spares, spareId);
  if (spareIndex < 0) return null;
  const spare = next.spares[spareIndex];
  next.spares.splice(spareIndex, 1);
  const targetId = ARENA_META[spare.arena] ? spare.arena : "intl";
  const to = getOrCreateArena(next.arenas, targetId);
  to.items.push({
    id: spare.id,
    speaker: spare.speaker,
    body: spare.body,
    url: spare.url,
    shortUrl: spare.shortUrl,
    publishedAt: spare.publishedAt,
  });
  next.arenas = sortArenas(next.arenas);
  return next;
}

export function listItemIds(payload: BriefingPayload): string[] {
  return payload.arenas.flatMap((arena) => arena.items.map((item) => item.id));
}

export function replaceNextOriginal(
  payload: BriefingPayload,
  originalIds: string[],
  incoming: SpareItem,
): { payload: BriefingPayload; replacedId: string } | null {
  const next = clonePayload(payload);
  let loc: { ai: number; ii: number } | null = null;
  let replacedId = "";
  for (const id of originalIds) {
    loc = findItemLoc(next.arenas, id);
    if (loc) {
      replacedId = id;
      break;
    }
  }
  if (!loc) return null;
  const from = next.arenas[loc.ai];
  const old = from.items[loc.ii];
  from.items.splice(loc.ii, 1);
  const targetId = ARENA_META[incoming.arena] ? incoming.arena : from.id;
  const to = getOrCreateArena(next.arenas, targetId);
  to.items.push({
    id: incoming.id,
    speaker: incoming.speaker,
    body: incoming.body,
    url: incoming.url,
    shortUrl: incoming.shortUrl,
    publishedAt: incoming.publishedAt,
  });
  next.spares = [{ ...old, arena: from.id }, ...next.spares.filter((row) => row.id !== incoming.id)].slice(
    0,
    10,
  );
  next.arenas = sortArenas(next.arenas);
  return { payload: next, replacedId };
}

export function ensureItemIds(payload: BriefingPayload): BriefingPayload {
  let n = 0;
  const stamp = Date.now().toString(36);
  return {
    desk: payload.desk,
    arenas: payload.arenas.map((arena) => ({
      ...arena,
      items: arena.items.map((item) => ({
        ...item,
        id: item.id || `i-${stamp}-${(n += 1)}`,
      })),
    })),
    spares: payload.spares.map((row) => ({
      ...row,
      id: row.id || `s-${stamp}-${(n += 1)}`,
    })),
  };
}

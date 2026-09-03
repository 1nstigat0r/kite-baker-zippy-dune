import {
  listItemIds,
  sortArenas,
  type BriefingPayload,
} from "./types";
import { formatHeDateTime, hourLabelFromKey, hourKey, todayDateLabel } from "./time";

function sortArenasPayload(payload: BriefingPayload): BriefingPayload {
  return { arenas: sortArenas(payload.arenas), spares: payload.spares };
}

/** Empty shell only — never ship static exclusives. Live ingest fills this. */
export const CURRENT_BRIEFING: BriefingPayload = sortArenasPayload({
  arenas: [],
  spares: [],
});

export type TickerLine = { source: string; text: string; url: string };

/** Placeholder ticker until live ingest returns rows — no stale exclusives. */
export const TICKER: TickerLine[] = [];

export function briefingHeaderNow() {
  return `עדכון | ${todayDateLabel()}, ${hourLabelFromKey(hourKey())}`;
}

export const BRIEFING_HEADER = briefingHeaderNow();
export const SWAP_EVERY_MS = 12_000;
export const SCAN_MS = 40 * 60 * 1000;

const USED_KEY = "idkun-used-at-v9";
const PAYLOAD_KEY = "idkun-payload-v9";
const BURNED_KEY = "idkun-burned-urls-v9";
const ORIG_KEY = "idkun-orig-ids-v9";
const QUEUE_KEY = "idkun-queue-at-v9";

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

export function markUsedLocal(payload: BriefingPayload) {
  lsSet(USED_KEY, String(Date.now()));
  lsSet(ORIG_KEY, JSON.stringify(listItemIds(payload)));
  lsSet(QUEUE_KEY, "0");
}

export function scanDueAt(usedAt: number) {
  return usedAt + SCAN_MS;
}

export function isScanning(usedAt: number | null) {
  if (!usedAt) return false;
  return Date.now() < scanDueAt(usedAt);
}

export function emptyBriefing(): BriefingPayload {
  return { arenas: [], spares: [], desk: 1 };
}

export function activePayload(): BriefingPayload {
  const raw = lsGet(PAYLOAD_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as BriefingPayload;
      if (parsed?.arenas?.length || parsed?.spares?.length) return parsed;
    } catch {
      /* ignore */
    }
  }
  return emptyBriefing();
}

/** One-shot: drop pre-v9 caches that still held static exclusives. */
export function purgeLegacyDeskCache() {
  try {
    if (typeof localStorage === "undefined") return;
    for (const k of [
      "idkun-payload-v7",
      "idkun-payload-v8",
      "idkun-used-at-v7",
      "idkun-used-at-v8",
      "idkun-orig-ids-v7",
      "idkun-orig-ids-v8",
      "idkun-queue-at-v7",
      "idkun-queue-at-v8",
      "idkun-burned-urls-v8",
    ]) {
      localStorage.removeItem(k);
    }
  } catch {
    /* ignore */
  }
}

export function persistPayloadLocal(payload: BriefingPayload) {
  lsSet(PAYLOAD_KEY, JSON.stringify(payload));
}

export function loadBurnedUrls(): string[] {
  try {
    const raw = lsGet(BURNED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.filter((u) => typeof u === "string") : [];
  } catch {
    return [];
  }
}

export function burnUrls(urls: string[]) {
  const set = new Set(loadBurnedUrls());
  for (const u of urls) if (u) set.add(u);
  lsSet(BURNED_KEY, JSON.stringify([...set].slice(-400)));
}

export function filterBurned(payload: BriefingPayload): BriefingPayload {
  const burned = new Set(loadBurnedUrls());
  if (burned.size === 0) return payload;
  return {
    desk: payload.desk,
    arenas: payload.arenas
      .map((a) => ({ ...a, items: a.items.filter((i) => !burned.has(i.url)) }))
      .filter((a) => a.items.length > 0),
    spares: payload.spares.filter((i) => !burned.has(i.url)),
  };
}

export function clearLocalDeskCache() {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(PAYLOAD_KEY);
  } catch {
    /* ignore */
  }
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

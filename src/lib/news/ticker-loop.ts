import type { TickerItem } from "./types";
import { hasHebrew } from "./text";

export const MAX_TICKER = 12;

export function tickerInterest(item: {
  title: string;
  titleHe?: string | null;
  source?: string;
  publishedAt?: string | null;
}) {
  const t = `${item.titleHe ?? ""} ${item.title} ${item.source ?? ""}`;
  let s = 0;
  if (/גורמים ל-|בלעדי|מסר(?:ו)? ל|דווח ב-/.test(t)) s += 6;
  if (/משה["״]מ|הורמוז|חיזבאללה|חות|קאליבאף|טראמפ|תקיפ|טיל/.test(t)) s += 4;
  if (/איראן|לבנון|תימן|עיראק|סוריה|עזה/.test(t)) s += 2;
  const tms = item.publishedAt ? Date.parse(item.publishedAt) : 0;
  if (tms) s += Math.max(0, 5 - (Date.now() - tms) / 3_600_000);
  return s;
}

export function mergeTicker(
  current: TickerItem[],
  finds: TickerItem[],
  blocked: Set<string>,
  max = MAX_TICKER,
): TickerItem[] {
  const byUrl = new Map<string, TickerItem>();
  for (const row of current) {
    if (!row.url || blocked.has(row.url)) continue;
    byUrl.set(row.url.replace(/\/$/, ""), row);
  }
  for (const row of finds) {
    const key = (row.url || "").replace(/\/$/, "");
    if (!key || blocked.has(row.url) || blocked.has(key)) continue;
    const prev = byUrl.get(key);
    if (!prev || tickerInterest(row) > tickerInterest(prev)) byUrl.set(key, row);
  }
  const ranked = [...byUrl.values()]
    .filter((row) => hasHebrew(row.titleHe || ""))
    .sort((a, b) => tickerInterest(b) - tickerInterest(a));
  return ranked.slice(0, max);
}

export function nextPackLabel(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jerusalem",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  let hour = Number(get("hour"));
  const minute = Number(get("minute"));
  if (minute >= 45) hour = (hour + 1) % 24;
  return `${String(hour).padStart(2, "0")}:45`;
}

export function shouldPackHour(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const minute = Number(get("minute"));
  if (minute < 45) return null;
  const hour = String((Number(get("hour")) + 1) % 24).padStart(2, "0");
  return `${get("year")}-${get("month")}-${get("day")}T${hour}:00`;
}

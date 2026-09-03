import { createHash } from "node:crypto";
import { getSql } from "@/lib/db";
import { arenaPresentation, hasHebrew, isDeskStory } from "./text";
import {
  dateLabelFromKey,
  formatHeClock,
  formatHeDateTime,
  hourKey,
  hourLabelFromKey,
  israelParts,
  parsePossiblyUtc,
  todayDateLabel,
} from "./time";
import type {
  ArenaId,
  BriefingPayload,
  BriefingRecord,
  DashboardData,
  HourChip,
  SpareItem,
  TickerItem,
} from "./types";
import { ARENA_META, applyAdd, applySwap, briefingHasContent, sortArenas } from "./types";

type BriefingRow = {
  id: string;
  hour_label: string;
  date_label: string;
  generated_at: string | Date;
  payload: string;
  status: string;
  error: string | null;
};

type TickerRow = {
  id: string;
  title: string;
  title_he: string | null;
  source: string;
  url: string;
  published_at: string | Date | null;
  arena: string | null;
};

type SeenRow = { fingerprint: string };

function asIso(value: string | Date | null | undefined) {
  const d = parsePossiblyUtc(value ?? null);
  return d ? d.toISOString() : null;
}

function emptyPayload(): BriefingPayload {
  return { arenas: [], spares: [], desk: 0 };
}

function parsePayload(raw: string): BriefingPayload {
  try {
    const parsed = JSON.parse(raw) as BriefingPayload;
    if (!parsed || !Array.isArray(parsed.arenas)) return emptyPayload();
    return {
      arenas: parsed.arenas,
      spares: Array.isArray(parsed.spares) ? parsed.spares : [],
      desk: parsed.desk ?? 0,
    };
  } catch {
    return emptyPayload();
  }
}

function mapBriefing(row: BriefingRow): BriefingRecord {
  const status =
    row.status === "generating" || row.status === "error" ? row.status : "ready";
  return {
    id: row.id,
    hourLabel: row.hour_label,
    dateLabel: row.date_label,
    generatedAt: asIso(row.generated_at) ?? new Date().toISOString(),
    status,
    error: row.error,
    payload: parsePayload(row.payload),
  };
}

export async function getBriefing(id: string): Promise<BriefingRecord | null> {
  const sql = await getSql();
  const rows = await sql<BriefingRow>`
    select id, hour_label, date_label, generated_at, payload, status, error
    from briefings where id = ${id} limit 1
  `;
  return rows[0] ? mapBriefing(rows[0]) : null;
}

export async function getLatestReady(dayPrefix: string): Promise<BriefingRecord | null> {
  const sql = await getSql();
  const like = `${dayPrefix}T%`;
  const rows = await sql<BriefingRow>`
    select id, hour_label, date_label, generated_at, payload, status, error
    from briefings
    where id like ${like}
    order by id desc
    limit 24
  `;
  let fallback: BriefingRecord | null = null;
  for (const row of rows) {
    const rec = mapBriefing(row);
    if (!briefingHasContent(rec)) continue;
    if (rec.status === "ready") return rec;
    if (!fallback) fallback = rec;
  }
  return fallback;
}

export async function listHours(dayPrefix: string): Promise<HourChip[]> {
  const sql = await getSql();
  const like = `${dayPrefix}T%`;
  const rows = await sql<{ id: string; hour_label: string; status: string }>`
    select id, hour_label, status from briefings
    where id like ${like}
    order by id desc
  `;
  return rows.map((row) => ({
    id: row.id,
    hourLabel: row.hour_label,
    status:
      row.status === "generating" || row.status === "error"
        ? row.status
        : "ready",
  }));
}

function mapTicker(row: TickerRow): TickerItem {
  return {
    id: row.id,
    title: row.title,
    titleHe: row.title_he,
    source: row.source,
    url: row.url,
    publishedAt: asIso(row.published_at),
    arena: row.arena,
  };
}

export async function listTicker(limit = 40): Promise<TickerItem[]> {
  const sql = await getSql();
  const rows = await sql<TickerRow>`
    select id, title, title_he, source, url, published_at, arena
    from ticker_items
    order by published_at desc nulls last, fetched_at desc
    limit ${limit}
  `;
  const mapped = rows.map(mapTicker);
  return mapped
    .filter((item) => {
      const text = `${item.titleHe ?? ""} ${item.title}`;
      if (!(hasHebrew(item.titleHe ?? "") || hasHebrew(item.title))) return false;
      return isDeskStory(text) || isDeskStory(item.titleHe ?? item.title);
    })
    .sort((a, b) => tickerScore(b) - tickerScore(a));
}

export function tickerScore(item: {
  title: string;
  titleHe: string | null;
  publishedAt: string | null;
}) {
  const t = `${item.titleHe ?? ""} ${item.title}`;
  let s = 0;
  if (/גורמים ל-|בלעדי|מסר(?:ו)? ל/.test(t)) s += 6;
  if (/משה["״]מ|הורמוז|חיזבאללה|חות|קאליבאף|טראמפ|עלי אלטאהר/.test(t)) s += 3;
  if (/איראן|לבנון|תימן|עיראק|כווית|סעודי/.test(t)) s += 2;
  const tms = item.publishedAt ? Date.parse(item.publishedAt) : 0;
  if (tms) s += Math.max(0, 5 - (Date.now() - tms) / 3_600_000);
  return s;
}

export async function listTickerNeedingHe(limit = 18): Promise<TickerItem[]> {
  const sql = await getSql();
  const rows = await sql<TickerRow>`
    select id, title, title_he, source, url, published_at, arena
    from ticker_items
    where title_he is null or title_he = ${""}
    order by published_at desc nulls last, fetched_at desc
    limit ${limit}
  `;
  return rows.map(mapTicker);
}

export async function insertTicker(
  items: {
    id: string;
    title: string;
    titleHe?: string | null;
    source: string;
    url: string;
    publishedAt: string | null;
    arena: string | null;
  }[],
) {
  if (items.length === 0) return;
  const sql = await getSql();
  for (const item of items) {
    await sql`
      insert into ticker_items (id, title, title_he, source, url, published_at, arena)
      values (
        ${item.id},
        ${item.title},
        ${item.titleHe ?? null},
        ${item.source},
        ${item.url},
        ${item.publishedAt},
        ${item.arena}
      )
      on conflict (id) do update set
        title = excluded.title,
        title_he = coalesce(ticker_items.title_he, excluded.title_he),
        source = excluded.source,
        published_at = coalesce(excluded.published_at, ticker_items.published_at),
        arena = coalesce(excluded.arena, ticker_items.arena)
    `;
  }
}

export async function pruneTicker(keep = 16) {
  const sql = await getSql();
  const rows = await sql<TickerRow>`
    select id, title, title_he, source, url, published_at, arena
    from ticker_items
    order by published_at desc nulls last, fetched_at desc
    limit 80
  `;
  const ranked = rows
    .map(mapTicker)
    .filter((item) => hasHebrew(item.titleHe ?? "") || hasHebrew(item.title))
    .sort((a, b) => tickerScore(b) - tickerScore(a));
  if (ranked.length <= keep) return;
  const drop = ranked.slice(keep);
  for (const item of drop) {
    await sql`delete from ticker_items where id = ${item.id}`;
  }
}

export async function seedTicker(
  rows: { url: string; titleHe: string; source?: string; arena?: string | null }[],
) {
  await insertTicker(
    rows
      .filter((row) => row.url && hasHebrew(row.titleHe))
      .map((row) => ({
        id: createHash("sha256").update(row.url).digest("hex").slice(0, 24),
        title: row.titleHe,
        titleHe: row.titleHe,
        source: row.source ?? "",
        url: row.url,
        publishedAt: new Date().toISOString(),
        arena: row.arena ?? null,
      })),
  );
  await pruneTicker(16);
}

export async function applyTickerHe(updates: { url: string; titleHe: string }[]) {
  if (updates.length === 0) return;
  const sql = await getSql();
  for (const row of updates) {
    await sql`
      update ticker_items set title_he = ${row.titleHe} where url = ${row.url}
    `;
    if (!row.url.endsWith("/")) {
      await sql`
        update ticker_items set title_he = ${row.titleHe} where url = ${`${row.url}/`}
      `;
    }
  }
}

export async function claimBriefing(
  id: string,
  force = false,
): Promise<"owned" | "busy" | "ready"> {
  const existing = await getBriefing(id);
  if (
    !force &&
    existing?.status === "ready" &&
    existing.payload.arenas.length > 0
  ) {
    return "ready";
  }
  if (existing?.status === "generating") {
    const started = parsePossiblyUtc(existing.generatedAt)?.getTime() ?? 0;
    if (Date.now() - started < 2 * 60 * 1000) return "busy";
  }

  const sql = await getSql();
  const hourLabel = hourLabelFromKey(id);
  const dateLabel = dateLabelFromKey(id);
  if (!existing) {
    await sql`
      insert into briefings (id, hour_label, date_label, payload, status)
      values (${id}, ${hourLabel}, ${dateLabel}, ${"{}"}, ${"generating"})
    `;
    return "owned";
  }
  await sql`
    update briefings
    set status = ${"generating"}, error = null, generated_at = now()
    where id = ${id}
  `;
  return "owned";
}

export async function saveBriefing(id: string, payload: BriefingPayload) {
  const sql = await getSql();
  await sql`
    update briefings
    set payload = ${JSON.stringify(payload)},
        status = ${"ready"},
        error = null,
        generated_at = now()
    where id = ${id}
  `;
}

export async function failBriefing(id: string, error: string) {
  const sql = await getSql();
  await sql`
    update briefings
    set status = ${"error"}, error = ${error}, generated_at = now()
    where id = ${id}
  `;
}

export async function listSeen(dayPrefix: string): Promise<string[]> {
  const sql = await getSql();
  const like = `${dayPrefix}%`;
  const rows = await sql<SeenRow>`
    select fingerprint from seen_stories
    where briefing_id like ${like}
  `;
  return rows.map((row) => row.fingerprint);
}

export async function addSeen(
  briefingId: string,
  prints: string[],
) {
  if (prints.length === 0) return;
  const sql = await getSql();
  for (const fp of prints) {
    await sql`
      insert into seen_stories (fingerprint, briefing_id)
      values (${fp}, ${briefingId})
      on conflict (fingerprint) do nothing
    `;
  }
}

export async function previousBodies(dayPrefix: string, excludeId: string) {
  const sql = await getSql();
  const like = `${dayPrefix}T%`;
  const rows = await sql<{ payload: string }>`
    select payload from briefings
    where id like ${like} and id <> ${excludeId} and status = ${"ready"}
    order by id desc
    limit 12
  `;
  const lines: string[] = [];
  for (const row of rows) {
    const payload = parsePayload(row.payload);
    for (const arena of payload.arenas) {
      for (const item of arena.items) {
        lines.push(`${arena.title} | ${item.speaker}: ${item.body}`.slice(0, 220));
      }
    }
  }
  return lines;
}

export async function getMeta(key: string): Promise<string | null> {
  const sql = await getSql();
  const rows = await sql<{ value: string }>`
    select value from gen_meta where key = ${key} limit 1
  `;
  return rows[0]?.value ?? null;
}

export async function setMeta(key: string, value: string) {
  const sql = await getSql();
  await sql`
    insert into gen_meta (key, value, updated_at)
    values (${key}, ${value}, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()
  `;
}

export const SCAN_LEAD_MS = 40 * 60 * 1000;

export async function getScanState() {
  const [status, due, consumed] = await Promise.all([
    getMeta("scan_status"),
    getMeta("next_due_at"),
    getMeta("consumed_id"),
  ]);
  return {
    scanning: status === "scanning",
    dueAt: due && due.length > 0 ? due : null,
    consumedId: consumed && consumed.length > 0 ? consumed : null,
  };
}

export async function markBriefingUsed(id: string) {
  const due = new Date(Date.now() + SCAN_LEAD_MS);
  await setMeta("consumed_id", id);
  await setMeta("consumed_at", new Date().toISOString());
  await setMeta("next_due_at", due.toISOString());
  await setMeta("scan_status", "scanning");
  return due;
}

export async function clearScan() {
  await setMeta("scan_status", "");
  await setMeta("next_due_at", "");
}

export async function buildDashboard(selectedHour?: string): Promise<DashboardData> {
  const now = new Date();
  const current = hourKey(now);
  const hour = selectedHour && selectedHour.length >= 13 ? selectedHour : current;
  const parts = israelParts(now);
  const dayPrefix = `${parts.year}-${parts.month}-${parts.day}`;

  const [briefing, hours, ticker, latest, scan] = await Promise.all([
    getBriefing(hour),
    listHours(dayPrefix),
    listTicker(48),
    getLatestReady(dayPrefix),
    getScanState(),
  ]);

  const hourSet = new Map(hours.map((h) => [h.id, h]));
  if (!hourSet.has(current)) {
    hourSet.set(current, {
      id: current,
      hourLabel: hourLabelFromKey(current),
      status: briefing && briefing.id === current ? briefing.status : "ready",
    });
  }
  if (latest && !hourSet.has(latest.id)) {
    hourSet.set(latest.id, {
      id: latest.id,
      hourLabel: latest.hourLabel,
      status: latest.status,
    });
  }

  const generating =
    [...hourSet.values()].find((h) => h.status === "generating")?.id ??
    (briefing?.status === "generating" ? briefing.id : null);

  const view = briefingHasContent(briefing)
    ? briefing
    : briefingHasContent(latest)
      ? latest
      : briefing;
  const scanQueue = (view?.payload.spares ?? []).slice(0, 10);

  return {
    briefing: briefing ?? null,
    latestBriefing: latest,
    hours: [...hourSet.values()].sort((a, b) => (a.id < b.id ? 1 : -1)),
    ticker,
    scanQueue,
    currentHourKey: current,
    currentClock: formatHeClock(now),
    currentDateLabel: todayDateLabel(now),
    generatingHour: generating,
    scanningNext: Boolean(
      scan.scanning && scan.dueAt && Date.now() < Date.parse(scan.dueAt),
    ),
    scanDueAt: scan.dueAt,
    scanDueLabel: scan.dueAt
      ? formatHeClock(new Date(scan.dueAt))
      : null,
  };
}

export function decorateArenas(payload: BriefingPayload): BriefingPayload {
  return {
    desk: payload.desk,
    arenas: sortArenas(
      payload.arenas
        .filter((arena) => ARENA_META[arena.id as ArenaId] && arena.items.length > 0)
        .map((arena) => {
          const pres = arenaPresentation(arena.id as ArenaId, arena.items);
          return {
            ...arena,
            id: arena.id as ArenaId,
            title: pres.title,
            flags: pres.flags,
            items: arena.items,
          };
        }),
    ),
    spares: (payload.spares ?? []).slice(0, 10),
  };
}

export async function swapSpareItem(
  id: string,
  spareUrl: string,
  itemUrl: string,
): Promise<BriefingRecord | null> {
  const current = await getBriefing(id);
  if (!current || !briefingHasContent(current)) return current;
  const next = applySwap(current.payload, spareUrl, itemUrl);
  if (!next) return current;
  await saveBriefing(id, decorateArenas(next));
  return (await getBriefing(id)) ?? current;
}

export async function addSpareItem(
  id: string,
  spareUrl: string,
): Promise<BriefingRecord | null> {
  const current = await getBriefing(id);
  if (!current || !briefingHasContent(current)) return current;
  const next = applyAdd(current.payload, spareUrl);
  if (!next) return current;
  await saveBriefing(id, decorateArenas(next));
  return (await getBriefing(id)) ?? current;
}

export { formatHeDateTime };

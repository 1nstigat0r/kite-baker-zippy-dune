import { createHash } from "node:crypto";
import { RSS_SOURCES, TELEGRAM_SOURCES } from "./sources";
import { insertTicker, getMeta, setMeta } from "./store";
import {
  resolveArena,
  firstLine,
  hasHebrew,
  isDeskStory,
  isRegional,
  stripHtml,
} from "./text";
import { israelParts, parsePossiblyUtc } from "./time";
import type { RawStory } from "./types";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

function storyId(url: string) {
  return createHash("sha256").update(url).digest("hex").slice(0, 24);
}

async function fetchText(url: string, ms = 5000): Promise<string | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
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
  } finally {
    clearTimeout(timer);
  }
}

function tag(block: string, name: string) {
  const re = new RegExp(
    `<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`,
    "i",
  );
  const match = block.match(re);
  if (match?.[1]) return stripHtml(match[1]);
  const alt = block.match(
    new RegExp(`<${name}[^>]+href=["']([^"']+)["']`, "i"),
  );
  return alt?.[1] ? stripHtml(alt[1]) : "";
}

function parseRss(xml: string, source: string): RawStory[] {
  const blocks =
    xml.match(/<item[\s\S]*?<\/item>/gi) ??
    xml.match(/<entry[\s\S]*?<\/entry>/gi) ??
    [];
  const items: RawStory[] = [];
  for (const block of blocks) {
    const title = tag(block, "title");
    const url =
      tag(block, "link") ||
      block.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] ||
      "";
    if (!title || !url) continue;
    const published =
      tag(block, "pubDate") ||
      tag(block, "published") ||
      tag(block, "updated") ||
      null;
    const text = `${title} ${tag(block, "description")}`;
    if (title.length < 12) continue;
    items.push({
      title: firstLine(title, 220),
      url: url.trim(),
      source,
      publishedAt: parsePossiblyUtc(published)?.toISOString() ?? null,
      arena: resolveArena(text),
      via: "rss",
    });
  }
  return items.slice(0, 6);
}

function parseTelegram(
  html: string,
  channel: string,
  source: string,
): RawStory[] {
  const chunks = html.split(/class="tgme_widget_message /);
  const items: RawStory[] = [];
  for (const chunk of chunks.slice(1)) {
    const post = chunk.match(/data-post="([^"]+)"/)?.[1];
    const time = chunk.match(/datetime="([^"]+)"/)?.[1] ?? null;
    const textHtml = chunk.match(
      /class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/,
    )?.[1];
    if (!textHtml) continue;
    const body = stripHtml(textHtml);
    if (body.length < 24) continue;
    const url = post ? `https://t.me/${post}` : `https://t.me/s/${channel}`;
    const title = firstLine(body, 220);
    items.push({
      title,
      url,
      source,
      publishedAt: parsePossiblyUtc(time)?.toISOString() ?? null,
      arena: resolveArena(`${title} ${body}`),
      via: "telegram",
    });
  }
  return items.slice(0, 5);
}

function isTodayIsrael(iso: string | null) {
  if (!iso) return false;
  const d = parsePossiblyUtc(iso);
  if (!d) return false;
  const p = israelParts(d);
  const now = israelParts(new Date());
  return p.year === now.year && p.month === now.month && p.day === now.day;
}

async function poolMap<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    const chunk = items.slice(i, i + size);
    const settled = await Promise.allSettled(chunk.map(fn));
    for (const result of settled) {
      if (result.status === "fulfilled") out.push(result.value);
    }
  }
  return out;
}

function rotate<T>(items: T[], cursor: number, take: number): T[] {
  if (items.length === 0 || take <= 0) return [];
  const start = ((cursor % items.length) + items.length) % items.length;
  const n = Math.min(take, items.length);
  const out: T[] = [];
  for (let i = 0; i < n; i += 1) {
    out.push(items[(start + i) % items.length]!);
  }
  return out;
}

export type IngestMode = "full" | "hot";

export async function ingestStories(
  force = false,
  mode: IngestMode = "full",
): Promise<RawStory[]> {
  try {
    const last = await getMeta("ticker_at");
    if (!force && mode !== "hot" && last) {
      const then = Number(last);
      if (Number.isFinite(then) && Date.now() - then < 75_000) {
        return [];
      }
    }
    if (mode === "full") {
      await setMeta("ticker_at", String(Date.now()));
    }
  } catch {
    /* store optional on cold start */
  }

  type RssJob = { kind: "rss"; src: (typeof RSS_SOURCES)[number] };
  type TgJob = { kind: "tg"; src: (typeof TELEGRAM_SOURCES)[number] };
  let jobs: Array<RssJob | TgJob>;
  let concurrency = 10;

  if (mode === "hot") {
    concurrency = 6;
    const rssCursor = Number((await getMeta("ingest_rss_cursor")) || "0") || 0;
    const tgCursor = Number((await getMeta("ingest_tg_cursor")) || "0") || 0;
    const rssBatch = rotate(RSS_SOURCES, rssCursor, 6);
    const tgPool = TELEGRAM_SOURCES.filter((src) => !src.indicator);
    const tgBatch = rotate(tgPool, tgCursor, 8);
    try {
      await Promise.all([
        setMeta("ingest_rss_cursor", String(RSS_SOURCES.length ? (rssCursor + rssBatch.length) % RSS_SOURCES.length : 0)),
        setMeta("ingest_tg_cursor", String(tgPool.length ? (tgCursor + tgBatch.length) % tgPool.length : 0)),
      ]);
    } catch {
      /* meta optional */
    }
    jobs = [
      ...rssBatch.map((src) => ({ kind: "rss" as const, src })),
      ...tgBatch.map((src) => ({ kind: "tg" as const, src })),
    ];
  } else {
    jobs = [
      ...RSS_SOURCES.map((src) => ({ kind: "rss" as const, src })),
      ...TELEGRAM_SOURCES.map((src) => ({ kind: "tg" as const, src })),
    ];
  }

  const batches = await poolMap(
    jobs,
    concurrency,
    async (job) => {
      if (job.kind === "rss") {
        const xml = await fetchText(job.src.url, mode === "hot" ? 3500 : 5000);
        if (!xml || !/[<](rss|feed|item|entry)/i.test(xml)) return [] as RawStory[];
        return parseRss(xml, job.src.name);
      }
      const html = await fetchText(`https://t.me/s/${job.src.channel}`, mode === "hot" ? 3500 : 5000);
      if (!html) return [] as RawStory[];
      return parseTelegram(html, job.src.channel, job.src.name);
    },
  );

  const merged: RawStory[] = [];
  const seen = new Set<string>();
  for (const group of batches) {
    for (const story of group) {
      const key = story.url.replace(/\/$/, "");
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(story);
    }
  }

  merged.sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });

  const recent = merged.filter((story) => {
    if (!story.publishedAt) return true;
    const d = parsePossiblyUtc(story.publishedAt);
    if (!d) return true;
    return Date.now() - d.getTime() < 36 * 60 * 60 * 1000;
  });

  try {
    await insertTicker(
      recent.slice(0, 140).map((story) => ({
        id: storyId(story.url),
        title: story.title,
        titleHe: hasHebrew(story.title) ? story.title : null,
        source: story.source,
        url: story.url,
        publishedAt: story.publishedAt,
        arena: story.arena,
      })),
    );
  } catch (err) {
    console.error("[insertTicker]", err instanceof Error ? err.message : err);
  }

  // Hot scan feeds compose immediately — keep the 36h window, do not require today-IL.
  if (mode === "hot") return recent;
  return recent.filter((story) => !story.publishedAt || isTodayIsrael(story.publishedAt));
}

export function storiesForPrompt(stories: RawStory[], limit = 50) {
  return stories.slice(0, limit).map((story, i) => {
    const when = story.publishedAt
      ? parsePossiblyUtc(story.publishedAt)?.toISOString() ?? ""
      : "";
    return `${i + 1}. [${story.source}${story.via === "telegram" ? "/טלגרם" : ""}] ${story.title}\n   ${story.url}${when ? `\n   ${when}` : ""}`;
  });
}

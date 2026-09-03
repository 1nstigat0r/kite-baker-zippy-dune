import { getMeta, setMeta } from "./store";
import type { BriefingPayload } from "./types";

const mem = new Map<string, string>();

function extractShort(msg: string) {
  return msg.match(/https:\/\/katzr\.net\/[a-zA-Z0-9]+/)?.[0] ?? null;
}

export async function katzrShort(url: string): Promise<string> {
  const raw = (url ?? "").trim();
  if (!raw) return raw;
  if (/^https:\/\/katzr\.net\/[a-zA-Z0-9]+$/.test(raw)) return raw;
  if (mem.has(raw)) return mem.get(raw)!;
  const cached = await getMeta(`katzr:${raw}`);
  if (cached && /^https:\/\/katzr\.net\/[a-zA-Z0-9]+$/.test(cached)) {
    mem.set(raw, cached);
    return cached;
  }
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch("https://katzr.net/ajax.php", {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "content-type": "application/json",
        origin: "https://katzr.net",
        referer: "https://katzr.net/",
        accept: "application/json, text/plain, */*",
      },
      body: JSON.stringify({ action: "shortUrl", url: raw }),
    });
    clearTimeout(timer);
    const data = (await res.json()) as { success?: boolean; msg?: string };
    const short = extractShort(String(data?.msg ?? ""));
    if (short) {
      mem.set(raw, short);
      await setMeta(`katzr:${raw}`, short);
      return short;
    }
  } catch {
    /* keep original */
  }
  return raw;
}

export async function shortenPayload(payload: BriefingPayload): Promise<BriefingPayload> {
  const items = [
    ...payload.arenas.flatMap((arena) => arena.items),
    ...payload.spares,
  ];
  const unique = [...new Set(items.map((item) => item.url).filter(Boolean))];
  const map = new Map<string, string>();
  for (let i = 0; i < unique.length; i += 4) {
    const chunk = unique.slice(i, i + 4);
    const shorts = await Promise.all(chunk.map((url) => katzrShort(url)));
    chunk.forEach((url, idx) => map.set(url, shorts[idx]));
  }
  for (const item of items) {
    item.shortUrl = map.get(item.url) ?? item.url;
  }
  return payload;
}

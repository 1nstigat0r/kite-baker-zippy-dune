import { hasHebrew, toDeskHebrew } from "./text";

const cache = new Map<string, string>();

function clip(s: string, n: number) {
  const t = (s ?? "").replace(/\s+/g, " ").trim();
  return t.length <= n ? t : t.slice(0, n);
}

async function gtx(text: string): Promise<string | null> {
  const q = encodeURIComponent(clip(text, 280));
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=he&dt=t&q=${q}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2500);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data) || !Array.isArray(data[0])) return null;
    const out = (data[0] as unknown[])
      .map((row) => (Array.isArray(row) && typeof row[0] === "string" ? row[0] : ""))
      .join("");
    return out.trim() || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function translateToHebrew(text: string): Promise<string> {
  const raw = (text ?? "").replace(/\*\*/g, "").trim();
  if (!raw) return "";
  const hit = cache.get(raw);
  if (hit) return hit;
  let he = toDeskHebrew(raw);
  if (!hasHebrew(he)) {
    const got = await gtx(raw);
    if (got) he = toDeskHebrew(got);
  }
  const out = he.slice(0, 180);
  cache.set(raw, out);
  return out;
}

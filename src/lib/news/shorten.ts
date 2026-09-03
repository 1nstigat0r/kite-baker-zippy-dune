const cache = new Map<string, string>();

function isKatzr(url: string) {
  return /https:\/\/katzr\.net\/[a-z0-9]+/i.test(url);
}

export async function katzrShort(url: string): Promise<string> {
  if (isKatzr(url)) return url;
  const hit = cache.get(url);
  if (hit) return hit;
  try {
    const res = await fetch("https://katzr.net/ajax.php", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "https://katzr.net" },
      body: JSON.stringify({ action: "shortUrl", url }),
    });
    const data = (await res.json()) as { success?: boolean; msg?: string };
    const match = data.msg?.match(/https:\/\/katzr\.net\/[a-z0-9]+/i);
    if (data.success && match) {
      cache.set(url, match[0]);
      return match[0];
    }
  } catch {
    /* keep original */
  }
  return url;
}

export function displayShort(url?: string, fallback?: string) {
  const candidates = [url, fallback].filter(Boolean) as string[];
  for (const row of candidates) {
    if (isKatzr(row) && !/tinyurl/i.test(row)) return row;
  }
  return "";
}

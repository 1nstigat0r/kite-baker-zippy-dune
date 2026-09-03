export function displayShort(url?: string, fallback?: string) {
  const candidates = [url, fallback].filter(Boolean) as string[];
  for (const row of candidates) {
    if (/https:\/\/katzr\.net\/[a-z0-9]+/i.test(row) && !/tinyurl/i.test(row)) return row;
  }
  return "";
}

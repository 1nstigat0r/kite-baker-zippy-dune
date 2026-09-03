import { FLAG_EMOJI } from "@/lib/news/types";

export function ArenaFlags({ codes }: { codes: string[] }) {
  return (
    <span className="inline-flex items-center gap-1 text-[1.15rem] leading-none" aria-hidden>
      {codes.map((code) => (
        <span key={code}>{FLAG_EMOJI[code] ?? "🌍"}</span>
      ))}
    </span>
  );
}

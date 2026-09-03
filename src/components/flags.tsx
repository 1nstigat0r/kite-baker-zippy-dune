import { FLAG_EMOJI } from "@/lib/news/types";

/** Web-safe flags: emoji often renders as "IR"/"LB" without a color-emoji font. */
export function ArenaFlags({ codes }: { codes: string[] }) {
  return (
    <span className="inline-flex items-center gap-1 text-[1.15rem] leading-none" aria-hidden>
      {codes.map((raw) => {
        const code = (raw || "").toLowerCase();
        if (!code || code === "globe" || code === "intl") {
          return (
            <span key={`${code}-globe`} className="text-base">
              🌐
            </span>
          );
        }
        return (
          <img
            key={code}
            src={`https://flagcdn.com/h20/${code}.png`}
            srcSet={`https://flagcdn.com/h40/${code}.png 2x`}
            width={20}
            height={15}
            alt=""
            title={FLAG_EMOJI[code] ?? code}
            className="inline-block h-[15px] w-5 rounded-[2px] object-cover shadow-sm"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        );
      })}
    </span>
  );
}

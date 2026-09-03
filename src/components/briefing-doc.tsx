import { ArrowLeftRight, Check, Copy, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { ArenaFlags } from "@/components/flags";
import { displayShort } from "@/lib/news/display-short";
import {
  applyAdd,
  applySwap,
  arenaPresentation,
  briefingItemCount,
  FLAG_EMOJI,
  type BriefingArena,
  type BriefingItem,
  type BriefingPayload,
} from "@/lib/news/types";
import { cn } from "@/lib/utils";

function renderBody(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-fg">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function Lead({ item }: { item: BriefingItem }) {
  return (
    <>
      {item.speaker ? <strong className="font-semibold">{item.speaker}:</strong> : null}
      {item.speaker ? " " : null}
      {renderBody(item.body)}
    </>
  );
}

function linkHref(item: BriefingItem) {
  return displayShort(item.shortUrl, item.url);
}

function ItemBlock({ n, item }: { n: number; item: BriefingItem }) {
  const href = linkHref(item);
  return (
    <article className="mb-7 text-right">
      <p className="text-pretty text-[1.05rem] leading-relaxed text-fg">
        <span className="ms-1 tabular-nums text-muted">{n}. </span>
        <Lead item={item} />
      </p>
      {href ? (
        <p className="mt-1.5 text-sm">
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-gold-deep underline decoration-line-strong underline-offset-4 hover:text-fg"
            dir="ltr"
          >
            {href}
          </a>
        </p>
      ) : null}
    </article>
  );
}

function preview(item: BriefingItem) {
  const raw = `${item.speaker ? `${item.speaker}: ` : ""}${item.body}`.replace(/\*\*/g, "");
  return raw.length > 72 ? `${raw.slice(0, 72)}…` : raw;
}

function toWhatsAppBold(text: string) {
  return text.replace(/\*\*([^*]+)\*\*/g, "*$1*");
}

function whatsAppText(header: string, payload: BriefingPayload) {
  const lines: string[] = [header, ""];
  let n = 0;
  for (const arena of payload.arenas) {
    const shown = arenaPresentation(arena.id, arena.items);
    const flags = shown.flags.map((c) => FLAG_EMOJI[c.toLowerCase()] ?? "🌐").join("");
    lines.push(`${shown.title} ${flags}`.trim());
    for (const item of arena.items) {
      n += 1;
      const speaker = item.speaker ? `*${item.speaker}:* ` : "";
      lines.push(`${n}. ${speaker}${toWhatsAppBold(item.body)}`);
      const href = linkHref(item);
      if (href) lines.push(href);
      lines.push("");
    }
  }
  return lines.join("\n").trim() + "\n";
}

export function BriefingDoc({
  header,
  payload,
  onChange,
  onUsed,
  onSwap,
  onAdd,
  used,
  scanDueLabel,
  replaced = 0,
  total = 0,
}: {
  header: string;
  payload: BriefingPayload;
  onChange: (next: BriefingPayload) => void;
  onUsed: () => void;
  onSwap?: (spareId: string, itemId: string) => void;
  onAdd?: (spareId: string) => void;
  used: boolean;
  scanDueLabel: string | null;
  replaced?: number;
  total?: number;
}) {
  const [armed, setArmed] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const arenas = payload.arenas;
  const spares = payload.spares;
  const count = briefingItemCount(payload);
  const canAdd = count < 8;

  const numbered = useMemo(() => {
    let n = 0;
    return arenas.map((arena) => {
      const shown = arenaPresentation(arena.id, arena.items);
      const items = arena.items.map((item) => {
        n += 1;
        return { n, item };
      });
      return { arena: { ...arena, ...shown }, items };
    });
  }, [arenas]);

  function swap(spareId: string, itemId: string) {
    if (onSwap) {
      setArmed(null);
      onSwap(spareId, itemId);
      return;
    }
    const next = applySwap(payload, spareId, itemId);
    if (!next) return;
    setArmed(null);
    onChange(next);
  }

  function add(spareId: string) {
    if (onAdd) {
      onAdd(spareId);
      return;
    }
    const next = applyAdd(payload, spareId);
    if (!next) return;
    onChange(next);
  }

  async function copyBriefing() {
    const text = whatsAppText(header, payload);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={onUsed}
          disabled={used}
          className={cn(
            "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-[0_6px_0_0_var(--color-gold-deep),0_10px_18px_rgba(0,0,0,0.35)] transition active:translate-y-0.5 active:shadow-[0_3px_0_0_var(--color-gold-deep)]",
            used ? "bg-navy-2 text-fg-on-dark/80" : "bg-gold text-bg hover:bg-gold-deep",
          )}
        >
          <Check className="size-4" strokeWidth={2.4} />
          {used ? "סומן כמשומש" : "השתמשתי בעדכון"}
        </button>
      </div>

      {used ? (
        <p className="mb-4 rounded-lg bg-gold/15 px-4 py-3 text-sm text-fg-on-dark shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
          סריקה חיה עד נעילה ({scanDueLabel ?? "כ־40 דק׳"}): ממצאים חדשים מחליפים את החלש בעדכון, ואם לא — את החלש בספיירים.
        </p>
      ) : null}

      <section className="rounded-lg bg-surface px-5 py-6 text-fg shadow-[0_14px_0_0_rgba(12,28,55,0.55),0_22px_40px_rgba(0,0,0,0.45)] sm:px-8 sm:py-8">
        <div className="mb-6 flex items-start justify-between gap-3 border-b border-line/60 pb-4">
          <button
            type="button"
            onClick={() => void copyBriefing()}
            className="order-2 inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 text-xs font-semibold text-navy shadow-[0_4px_0_0_rgba(12,28,55,0.18)] hover:bg-gold/20"
            aria-label={copied ? "הועתק" : "העתק את העדכון"}
            title={copied ? "הועתק" : "העתק לוואטסאפ"}
          >
            <Copy className="size-3.5" />
            {copied ? "הועתק" : "העתק"}
          </button>
          <h1 className="order-1 min-w-0 flex-1 text-right text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
            <span className="block">{header}</span>
            <span className="mt-2 inline-block h-[3px] w-16 bg-gold" />
          </h1>
        </div>
        {numbered.map(({ arena, items }) => (
          <div key={arena.id} className="mb-2">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-navy">
              <span>{arena.title}</span>
              <ArenaFlags codes={arena.flags} />
            </h2>
            {items.map(({ n, item }) => (
              <ItemBlock key={item.id} n={n} item={item} />
            ))}
          </div>
        ))}
      </section>

      {spares.length > 0 ? (
        <section className="mt-8 rounded-lg border border-gold/25 bg-navy-2/50 px-4 py-5 shadow-[0_12px_0_0_rgba(7,20,40,0.7),0_20px_36px_rgba(0,0,0,0.4)] sm:px-6">
          <h2 className="mb-1 text-right text-base font-semibold text-fg-on-dark">ספיירים</h2>
          <p className="mb-4 text-right text-xs text-fg-on-dark/70">
            «הוסף» מכניס לזירה הנכונה. «החלף» ואז בחרו ידיעה בעדכון — הספייר נכנס לזירה שלו.
          </p>
          <ol className="space-y-3">
            {spares.map((row, i) => {
              const selected = armed === row.id;
              const arenaTitle = arenaPresentation(row.arena, [row]).title;
              return (
                <li
                  key={row.id}
                  className={cn(
                    "rounded-lg border px-3 py-3 shadow-[0_8px_0_0_rgba(12,28,55,0.18),0_10px_18px_rgba(0,0,0,0.12)] sm:px-4",
                    selected ? "border-gold bg-surface" : "border-line/40 bg-surface",
                  )}
                >
                  <div className="flex gap-3">
                    <div className="min-w-0 flex-1 text-fg">
                      <p className="text-pretty text-base leading-relaxed">
                        <span className="tabular-nums text-muted">{i + 1}. </span>
                        <span className="text-xs font-medium text-muted">{arenaTitle}</span>{" "}
                        <Lead item={row} />
                      </p>
                      {linkHref(row) ? (
                        <p className="mt-1.5 text-sm">
                          <a
                            href={linkHref(row)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-gold-deep underline underline-offset-4"
                            dir="ltr"
                          >
                            {linkHref(row)}
                          </a>
                        </p>
                      ) : null}
                      {selected ? (
                        <div className="mt-3 space-y-1.5 rounded-md border border-gold/40 bg-gold/10 p-2">
                          <p className="text-xs font-semibold text-navy">בחרו ידיעה להחלפה:</p>
                          {targetsOf(arenas).map((target) => (
                            <button
                              key={target.id}
                              type="button"
                              onClick={() => swap(row.id, target.id)}
                              className="block w-full rounded-md bg-surface-2 px-2 py-2 text-right text-sm text-fg shadow-[0_3px_0_0_rgba(12,28,55,0.15)] hover:bg-gold/25"
                            >
                              {target.n}. {target.label}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-col gap-1.5">
                      <button
                        type="button"
                        disabled={!canAdd}
                        onClick={() => add(row.id)}
                        className="inline-flex min-h-10 items-center justify-center gap-1 rounded-md border border-line bg-surface-2 px-2.5 text-xs font-semibold text-navy shadow-[0_4px_0_0_rgba(12,28,55,0.18)] disabled:opacity-40"
                      >
                        <Plus className="size-3.5" />
                        הוסף
                      </button>
                      <button
                        type="button"
                        onClick={() => setArmed(selected ? null : row.id)}
                        className="inline-flex min-h-10 items-center justify-center gap-1 rounded-md border border-line bg-surface-2 px-2.5 text-xs font-semibold text-navy shadow-[0_4px_0_0_rgba(12,28,55,0.18)]"
                      >
                        <ArrowLeftRight className="size-3.5" />
                        {selected ? "ביטול" : "החלף"}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}
    </div>
  );
}

function targetsOf(arenas: BriefingArena[]) {
  const targets: { n: number; id: string; label: string }[] = [];
  let n = 0;
  for (const arena of arenas) {
    for (const item of arena.items) {
      n += 1;
      targets.push({ n, id: item.id, label: preview(item) });
    }
  }
  return targets;
}

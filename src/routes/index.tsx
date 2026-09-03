import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BriefingDoc } from "@/components/briefing-doc";
import {
  BRIEFING_HEADER,
  SCAN_QUEUE,
  SWAP_EVERY_MS,
  TICKER,
  activePayload,
  formatDue,
  isScanning,
  loadOriginalIds,
  loadQueueAt,
  loadUsedAt,
  markUsed,
  persistPayload,
  remainingOriginal,
  saveQueueAt,
  scanDueAt,
} from "@/lib/news/desk";
import { replaceNextOriginal, type BriefingPayload } from "@/lib/news/types";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [usedAt, setUsedAt] = useState<number | null>(null);
  const [payload, setPayload] = useState<BriefingPayload | null>(null);
  const [originalIds, setOriginalIds] = useState<string[]>([]);
  const [tickKey, setTickKey] = useState(0);
  const queueAt = useRef(0);
  const originalsRef = useRef<string[]>([]);

  useEffect(() => {
    const used = loadUsedAt();
    const orig = loadOriginalIds();
    originalsRef.current = orig;
    setUsedAt(used);
    setOriginalIds(orig);
    setPayload(activePayload());
    queueAt.current = loadQueueAt();
  }, []);

  useEffect(() => {
    if (!usedAt) return;
    const tick = () => {
      setPayload((curr) => {
        if (!curr) return curr;
        const still = remainingOriginal(curr, originalsRef.current);
        if (still.length === 0) return curr;
        if (queueAt.current >= SCAN_QUEUE.length) return curr;
        const nextIn = SCAN_QUEUE[queueAt.current];
        const result = replaceNextOriginal(curr, still, nextIn);
        if (!result) return curr;
        queueAt.current += 1;
        saveQueueAt(queueAt.current);
        persistPayload(result.payload);
        return result.payload;
      });
    };
    const first = window.setTimeout(tick, 8_000);
    const loop = window.setInterval(tick, SWAP_EVERY_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(loop);
    };
  }, [usedAt]);

  const scanning =
    Boolean(usedAt) &&
    (isScanning(usedAt) || (payload ? remainingOriginal(payload, originalIds).length > 0 : false));
  const due = usedAt ? formatDue(scanDueAt(usedAt)) : null;
  const left = payload ? remainingOriginal(payload, originalIds).length : 0;
  const total = Math.max(originalIds.length, 1);
  const replaced = Math.max(0, originalIds.length - left);
  const ticker = useMemo(() => [...TICKER, ...TICKER], []);

  function onUsed() {
    if (!payload) return;
    markUsed(payload);
    const ids = payload.arenas.flatMap((a) => a.items.map((i) => i.id));
    originalsRef.current = ids;
    queueAt.current = 0;
    saveQueueAt(0);
    setOriginalIds(ids);
    setUsedAt(Date.now());
  }

  function onChange(next: BriefingPayload) {
    setPayload(next);
    persistPayload(next);
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,var(--color-bg)_0%,var(--color-bg-mid)_42%,var(--color-navy)_100%)]">
      <header className="sticky top-0 z-20 border-b border-gold/30 bg-bg/95 backdrop-blur">
        <div className="flex h-12 items-center">
          <button
            type="button"
            onClick={() => setTickKey((k) => k + 1)}
            className="inline-flex h-full shrink-0 items-center gap-2 border-e border-gold/30 bg-navy px-3 text-xs font-semibold text-fg-on-dark hover:bg-navy-2 sm:px-4"
          >
            <RefreshCw className="size-3.5" />
            רענון מבזקים
          </button>
          <div className="flex h-full min-w-0 flex-1 items-center overflow-hidden">
            <div
              key={tickKey}
              className="ticker-track flex h-full w-max items-center gap-10 whitespace-nowrap px-4 text-sm text-fg-on-dark"
            >
              {ticker.map((row, i) => (
                <a
                  key={row.url + i}
                  href={row.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 leading-none hover:text-gold"
                >
                  <span className="font-semibold text-gold">{row.source}</span>
                  <span className="text-fg-on-dark/90">{row.text}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        {payload ? (
          <BriefingDoc
            header={BRIEFING_HEADER}
            payload={payload}
            onChange={onChange}
            onUsed={onUsed}
            used={scanning}
            scanDueLabel={due}
            replaced={replaced}
            total={total}
          />
        ) : (
          <p className="text-center text-fg-on-dark">טוען עדכון…</p>
        )}
      </main>
    </div>
  );
}

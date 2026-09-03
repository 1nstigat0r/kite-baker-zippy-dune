import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BriefingDoc } from "@/components/briefing-doc";
import {
  BRIEFING_HEADER,
  CURRENT_BRIEFING,
  TICKER,
  formatDue,
  isScanning,
  loadOriginalIds,
  loadQueueAt,
  loadUsedAt,
  markUsedLocal,
  persistPayloadLocal,
  saveQueueAt,
  scanDueAt,
  stripBurned,
} from "@/lib/news/desk";
import {
  addSpare,
  ensureBriefing,
  getDashboard,
  markUsed,
  persistPayload,
  refreshTicker,
  swapSpare,
} from "@/lib/news/server";
import { displayShort } from "@/lib/news/display-short";
import {
  briefingHasContent,
  type BriefingPayload,
  type DashboardData,
  type SpareItem,
} from "@/lib/news/types";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      return await ensureBriefing({ data: {} });
    } catch (err) {
      console.error("[loader]", err);
      return null;
    }
  },
  component: Home,
});

function seedDash(): DashboardData {
  return {
    briefing: {
      id: "seed",
      hourLabel: "21:00",
      dateLabel: "3 בספטמבר",
      generatedAt: new Date().toISOString(),
      status: "ready",
      payload: structuredClone(CURRENT_BRIEFING),
    },
    latestBriefing: null,
    hours: [],
    ticker: TICKER.map((row, i) => ({
      id: `t${i}`,
      title: row.text,
      titleHe: `${row.source}: ${row.text}`,
      source: row.source,
      url: row.url,
      publishedAt: null,
      arena: null,
    })),
    scanQueue: CURRENT_BRIEFING.spares.slice(0, 6),
    currentHourKey: "seed",
    currentClock: "21:00",
    currentDateLabel: "3 בספטמבר",
    generatingHour: null,
    scanningNext: false,
    scanDueAt: null,
    scanDueLabel: null,
  };
}

function pickPayload(dash: DashboardData | null): { hourKey: string; header: string; payload: BriefingPayload } {
  const fallback = structuredClone(CURRENT_BRIEFING);
  if (!dash) {
    return { hourKey: "seed", header: BRIEFING_HEADER, payload: fallback };
  }
  const view =
    (briefingHasContent(dash.briefing) && dash.briefing) ||
    (briefingHasContent(dash.latestBriefing) && dash.latestBriefing) ||
    null;
  if (!view) {
    return {
      hourKey: dash.currentHourKey,
      header: `עדכון | ${dash.currentDateLabel}, ${dash.currentClock}`,
      payload: fallback,
    };
  }
  return {
    hourKey: view.id,
    header: `עדכון | ${view.dateLabel}, ${view.hourLabel}`,
    payload: view.payload,
  };
}

function Home() {
  const initial = Route.useLoaderData();
  const [dash, setDash] = useState<DashboardData>(() => initial ?? seedDash());
  const picked = pickPayload(dash);
  const [usedAt, setUsedAt] = useState<number | null>(null);
  const [payload, setPayload] = useState<BriefingPayload>(picked.payload);
  const [header, setHeader] = useState(picked.header);
  const [hourKey, setHourKey] = useState(picked.hourKey);
  const [originalIds, setOriginalIds] = useState<string[]>([]);
  const [tickKey, setTickKey] = useState(0);
  const [scanningTicker, setScanningTicker] = useState(false);
  const queueAt = useRef(0);
  const originalsRef = useRef<string[]>([]);
  const scanQueueRef = useRef<SpareItem[]>([]);

  useEffect(() => {
    const used = loadUsedAt();
    const orig = loadOriginalIds();
    originalsRef.current = orig;
    setUsedAt(used);
    setOriginalIds(orig);
    queueAt.current = loadQueueAt();
    const p = pickPayload(initial ?? seedDash());
    setPayload(p.payload);
    setHeader(p.header);
    setHourKey(p.hourKey);
    scanQueueRef.current = (initial?.scanQueue ?? CURRENT_BRIEFING.spares).slice(0, 10);
  }, []);

  useEffect(() => {
    scanQueueRef.current = (dash.scanQueue ?? []).slice(0, 10);
  }, [dash.scanQueue]);


  useEffect(() => {
    const applyDash = (next: DashboardData) => {
      setDash(next);
      const p = pickPayload(next);
      if (briefingHasContent(next.briefing) || briefingHasContent(next.latestBriefing)) {
        setPayload(p.payload);
        setHeader(p.header);
        setHourKey(p.hourKey);
        persistPayloadLocal(p.payload);
      }
    };
    const poll = window.setInterval(() => {
      void getDashboard({ data: {} }).then(applyDash).catch(() => undefined);
    }, 15_000);
    const tick = window.setInterval(() => {
      void onRefreshTicker();
    }, 45_000);
    return () => {
      window.clearInterval(poll);
      window.clearInterval(tick);
    };
  }, []);

  const scanning = Boolean(usedAt) && (isScanning(usedAt) || dash.scanningNext);
  const due =
    (dash.scanDueLabel && dash.scanningNext ? dash.scanDueLabel : null) ||
    (usedAt ? formatDue(scanDueAt(usedAt)) : null);
  const total = Math.max(originalIds.length, 1);
  const replaced = 0;

  const tickerRows = useMemo(() => {
    const live = dash.ticker
      .map((row) => {
        const text = (row.titleHe || row.title || "").replace(/\*\*/g, "");
        const source = row.source || "מבזק";
        const url = displayShort(undefined, row.url) || row.url;
        return { source, text, url };
      })
      .filter((row) => row.text.length > 8);
    const base = live.length ? live : TICKER;
    return [...base, ...base];
  }, [dash.ticker]);

  async function onRefreshTicker() {
    setScanningTicker(true);
    setTickKey((k) => k + 1);
    try {
      const next = await refreshTicker();
      setDash(next);
      const p = pickPayload(next);
      if (briefingHasContent(next.briefing) || briefingHasContent(next.latestBriefing)) {
        setPayload(p.payload);
        setHeader(p.header);
        setHourKey(p.hourKey);
        persistPayloadLocal(p.payload);
      }
    } catch {
      /* keep */
    } finally {
      setScanningTicker(false);
    }
  }

  async function onUsed() {
    markUsedLocal(payload);
    const ids = payload.arenas.flatMap((a) => a.items.map((i) => i.id));
    originalsRef.current = ids;
    queueAt.current = 0;
    saveQueueAt(0);
    setOriginalIds(ids);
    setUsedAt(Date.now());
    try {
      const next = await markUsed({
        data: {
          hourKey: hourKey === "seed" ? dash.currentHourKey : hourKey,
          payload,
        },
      });
      setDash(next);
      const p = pickPayload(next);
      const cleaned = stripBurned(p.payload);
      setPayload(cleaned);
      setHeader(p.header);
      setHourKey(p.hourKey);
      persistPayloadLocal(cleaned);
      scanQueueRef.current = (cleaned.spares ?? next.scanQueue ?? []).slice(0, 10);
    } catch {
      const { briefingFromSpares } = await import("@/lib/news/compose");
      const local = stripBurned(briefingFromSpares(payload, 6));
      setPayload(local);
      persistPayloadLocal(local);
      scanQueueRef.current = local.spares.slice(0, 10);
    }
  }

  async function onChange(next: BriefingPayload) {
    setPayload(next);
    persistPayloadLocal(next);
    if (hourKey && hourKey !== "seed") {
      try {
        const dashNext = await persistPayload({ data: { hourKey, payload: next } });
        setDash(dashNext);
      } catch {
        /* local only */
      }
    }
  }

  async function onSwap(spareId: string, itemId: string) {
    if (hourKey && hourKey !== "seed") {
      try {
        const next = await swapSpare({ data: { hourKey, spareId, itemId } });
        setDash(next);
        const p = pickPayload(next);
        setPayload(p.payload);
        persistPayloadLocal(p.payload);
        return;
      } catch {
        /* fall through */
      }
    }
    const { applySwap } = await import("@/lib/news/types");
    const next = applySwap(payload, spareId, itemId);
    if (next) void onChange(next);
  }

  async function onAdd(spareId: string) {
    if (hourKey && hourKey !== "seed") {
      try {
        const next = await addSpare({ data: { hourKey, spareId } });
        setDash(next);
        const p = pickPayload(next);
        setPayload(p.payload);
        persistPayloadLocal(p.payload);
        return;
      } catch {
        /* fall through */
      }
    }
    const { applyAdd } = await import("@/lib/news/types");
    const next = applyAdd(payload, spareId);
    if (next) void onChange(next);
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,var(--color-bg)_0%,var(--color-bg-mid)_42%,var(--color-navy)_100%)]">
      <header className="sticky top-0 z-20 border-b border-gold/30 bg-bg/95 backdrop-blur">
        <div className="flex h-12 items-center">
          <button
            type="button"
            onClick={() => void onRefreshTicker()}
            className="inline-flex h-full shrink-0 items-center gap-2 border-e border-gold/30 bg-navy px-3 text-xs font-semibold text-fg-on-dark hover:bg-navy-2 sm:px-4"
          >
            <RefreshCw className={`size-3.5 ${scanningTicker ? "animate-spin" : ""}`} />
            רענון מבזקים
          </button>
          <div className="flex h-full min-w-0 flex-1 items-center overflow-hidden">
            <div
              key={tickKey}
              className="ticker-track flex h-full w-max items-center gap-10 whitespace-nowrap px-4 text-sm text-fg-on-dark"
            >
              {tickerRows.map((row, i) => (
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
        <BriefingDoc
          header={header}
          payload={payload}
          onChange={onChange}
          onUsed={() => void onUsed()}
          onSwap={(spareId, itemId) => void onSwap(spareId, itemId)}
          onAdd={(spareId) => void onAdd(spareId)}
          used={scanning}
          scanDueLabel={due}
          replaced={replaced}
          total={total}
        />
      </main>
    </div>
  );
}

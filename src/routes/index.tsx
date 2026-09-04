import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BriefingDoc } from "@/components/briefing-doc";
import {
  BRIEFING_HEADER,
  CURRENT_BRIEFING,
  TICKER,
  activePayload,
  burnSeedBriefingUrls,
  clearLocalTicker,
  clearUsedLocal,
  loadBurnedUrls,
  loadLastPack,
  loadLocalTicker,
  loadOriginalIds,
  loadQueueAt,
  loadUsedAt,
  looksLikeSeed,
  markUsedLocal,
  payloadItemCount,
  persistPayloadLocal,
  saveLastPack,
  saveLocalTicker,
  saveQueueAt,
  stripBurned,
} from "@/lib/news/desk";
import {
  addSpare,
  composeFromTicker,
  ensureBriefing,
  getDashboard,
  markUsed,
  persistPayload,
  scanMinute,
  swapSpare,
} from "@/lib/news/server";
import { packSparesNow, tickerToSpare } from "@/lib/news/compose";
import { formatHeDateTime } from "@/lib/news/time";
import { mergeTicker, nextPackLabel, shouldPackHour } from "@/lib/news/ticker-loop";
import { displayShort } from "@/lib/news/display-short";
import { attributionLead, formatOutlet, hasHebrew, stripEmoji } from "@/lib/news/text";
import {
  briefingHasContent,
  briefingItemCount,
  type BriefingPayload,
  type DashboardData,
  type SpareItem,
  type TickerItem,
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
  const local = activePayload();
  const fallback = stripBurned(structuredClone(CURRENT_BRIEFING));
  const preferLocal = payloadItemCount(local) > 0;
  if (!dash) {
    return {
      hourKey: "seed",
      header: BRIEFING_HEADER,
      payload: preferLocal ? local : fallback,
    };
  }
  const view =
    (briefingHasContent(dash.briefing) && dash.briefing) ||
    (briefingHasContent(dash.latestBriefing) && dash.latestBriefing) ||
    null;
  if (!view) {
    return {
      hourKey: dash.currentHourKey,
      header: `עדכון | ${dash.currentDateLabel}, ${dash.currentClock}`,
      payload: preferLocal ? local : fallback,
    };
  }
  let payload = stripBurned(view.payload);
  // After «השתמשתי», server/PGLite often respawns the static seed — keep local draft.
  if (
    preferLocal &&
    (payloadItemCount(payload) === 0 || looksLikeSeed(payload)) &&
    !looksLikeSeed(local)
  ) {
    payload = local;
  } else if (payloadItemCount(payload) === 0 && preferLocal) {
    payload = local;
  } else if (payloadItemCount(payload) === 0) {
    payload = fallback;
  }
  return {
    hourKey: view.id,
    header: `עדכון | ${view.dateLabel}, ${view.hourLabel}`,
    payload,
  };
}


type DeskSharedState = {
  updatedAt?: string;
  ticker?: TickerItem[];
  lastPackId?: string | null;
  briefing?: BriefingPayload | null;
  hourKey?: string | null;
  header?: string | null;
};

const DESK_STATE_URLS = [
  "/desk-state.json",
  "https://raw.githubusercontent.com/1nstigat0r/kite-baker-zippy-dune/main/desk-state.json",
] as const;

async function fetchDeskShared(): Promise<DeskSharedState | null> {
  let best: DeskSharedState | null = null;
  await Promise.all(
    DESK_STATE_URLS.map(async (url) => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as DeskSharedState;
        if (!data || typeof data !== "object") return;
        if (
          !best ||
          (data.updatedAt && best.updatedAt && data.updatedAt > best.updatedAt) ||
          (data.updatedAt && !best.updatedAt)
        ) {
          best = data;
        }
      } catch {
        /* offline / 404 */
      }
    }),
  );
  return best;
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
  const [tickerItems, setTickerItems] = useState<TickerItem[]>(() => loadLocalTicker());
  const packingRef = useRef(false);
  const scanningRef = useRef(false);
  const queueAt = useRef(0);
  const originalsRef = useRef<string[]>([]);
  const scanQueueRef = useRef<SpareItem[]>([]);

  useEffect(() => {
    let used = loadUsedAt();
    const orig = loadOriginalIds();
    originalsRef.current = orig;
    queueAt.current = loadQueueAt();
    const p = pickPayload(initial ?? seedDash());
    const local = activePayload();
    let chosen =
      payloadItemCount(local) > 0 &&
      (looksLikeSeed(p.payload) || payloadItemCount(stripBurned(p.payload)) === 0)
        ? local
        : p.payload;
    chosen = stripBurned(chosen);

    // Stuck: «משומש» locked but old seed briefing still on screen — unlock + burn seed exclusives.
    if (used && (looksLikeSeed(chosen) || payloadItemCount(chosen) === 0)) {
      burnSeedBriefingUrls();
      clearUsedLocal();
      used = null;
      chosen = stripBurned(
        payloadItemCount(local) > 0 && !looksLikeSeed(local)
          ? local
          : structuredClone(CURRENT_BRIEFING),
      );
      // If still empty after burning seed arenas, keep seed spares promoted locally
      if (payloadItemCount(chosen) === 0) {
        void import("@/lib/news/compose").then(({ briefingFromSpares }) => {
          const next = stripBurned(briefingFromSpares(CURRENT_BRIEFING, 6));
          if (payloadItemCount(next) > 0) {
            setPayload(next);
            persistPayloadLocal(next);
          }
        });
      }
    }

    setUsedAt(used);
    setOriginalIds(used ? orig : []);
    setPayload(chosen);
    setHeader(p.header);
    setHourKey(p.hourKey);
    persistPayloadLocal(chosen);
    scanQueueRef.current = (chosen.spares ?? initial?.scanQueue ?? []).slice(0, 10);
  }, []);

  useEffect(() => {
    scanQueueRef.current = (dash.scanQueue ?? []).slice(0, 10);
  }, [dash.scanQueue]);


  useEffect(() => {
    const applyDash = (next: DashboardData) => {
      setDash(next);
      const p = pickPayload(next);
      if (briefingHasContent(next.briefing) || briefingHasContent(next.latestBriefing) || payloadItemCount(p.payload) > 0) {
        setPayload(p.payload);
        setHeader(p.header);
        setHourKey(p.hourKey);
        // Don't clobber a live local draft with a respawned seed.
        if (!looksLikeSeed(p.payload) || !loadUsedAt()) {
          persistPayloadLocal(p.payload);
        }
      }
    };
    const runScan = async () => {
      if (scanningRef.current) return;
      scanningRef.current = true;
      try {
        const scanned = await scanMinute({ data: {} });
        const finds = scanned?.items ?? [];
        if (typeof console !== "undefined") {
          console.info("[scanMinute]", scanned?.count ?? finds.length, scanned?.error ?? null);
        }
        setTickerItems((prev) => {
          const next = mergeTicker(prev, finds, new Set()); // burns apply at pack/used, not while accumulating
          saveLocalTicker(next);
          return next;
        });
        const packId = shouldPackHour();
        if (packId && loadLastPack() !== packId && !packingRef.current) {
          const pool = loadLocalTicker();
          if (pool.length) {
            packingRef.current = true;
            const next = await composeFromTicker({ data: { items: pool } });
            applyDash(next);
            clearLocalTicker();
            setTickerItems([]);
            saveLastPack(packId);
            packingRef.current = false;
          }
        }
      } catch {
        packingRef.current = false;
      } finally {
        scanningRef.current = false;
        setTickKey((k) => k + 1);
      }
    };
    const hydrateShared = async () => {
      const remote = await fetchDeskShared();
      if (!remote) return;
      if (Array.isArray(remote.ticker) && remote.ticker.length) {
        setTickerItems((prev) => {
          const next = mergeTicker(prev, remote.ticker!, new Set());
          saveLocalTicker(next);
          return next;
        });
      }
      const remoteBriefing = remote.briefing;
      const remoteHour = remote.hourKey;
      if (
        remoteBriefing &&
        remoteHour &&
        payloadItemCount(remoteBriefing) > 0 &&
        !looksLikeSeed(remoteBriefing)
      ) {
        const local = activePayload();
        const localPack = loadLastPack();
        const remotePack = remote.lastPackId || remoteHour;
        const remoteNewer =
          looksLikeSeed(local) ||
          payloadItemCount(local) === 0 ||
          !localPack ||
          remotePack > localPack ||
          remoteHour > localPack;
        if (remoteNewer) {
          const cleaned = stripBurned(remoteBriefing);
          if (payloadItemCount(cleaned) > 0) {
            setPayload(cleaned);
            setHourKey(remoteHour);
            if (remote.header) setHeader(remote.header);
            persistPayloadLocal(cleaned);
            if (remotePack) saveLastPack(remotePack);
          }
        }
      } else if (remote.lastPackId) {
        const localPack = loadLastPack();
        if (localPack !== remote.lastPackId) saveLastPack(remote.lastPackId);
      }
    };

    void runScan();
    void hydrateShared();
    const poll = window.setInterval(() => {
      void getDashboard({ data: {} }).then(applyDash).catch(() => undefined);
      void hydrateShared();
    }, 20_000);
    const tick = window.setInterval(() => {
      void runScan();
      void hydrateShared();
    }, 60_000);
    return () => {
      window.clearInterval(poll);
      window.clearInterval(tick);
    };
  }, []);

  const scanning = false;
  const due = nextPackLabel();
  const total = Math.max(originalIds.length, 1);
  const replaced = 0;

  const tickerRows = useMemo(() => {
    const live = tickerItems
      .map((row) => {
        const text = stripEmoji((row.titleHe || "").replace(/\*\*/g, ""));
        const source = attributionLead(row.source || "מבזק");
        const url = displayShort(undefined, row.url) || row.url;
        return { source, text, url };
      })
      .filter((row) => row.text.length > 8 && hasHebrew(row.text));
    if (!live.length) {
      return [{ source: "עדכון", text: "סורק מבזקים כל דקה…", url: "#" }];
    }
    return [...live, ...live];
  }, [tickerItems]);

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
      let cleaned = stripBurned(p.payload);
      const cleanedCount = cleaned.arenas.reduce((s, a) => s + a.items.length, 0);
      if (cleanedCount === 0) {
        const { briefingFromSpares } = await import("@/lib/news/compose");
        cleaned = stripBurned(briefingFromSpares(payload, 6));
      }
      if (cleaned.arenas.reduce((s, a) => s + a.items.length, 0) === 0) {
        cleaned = payload; // never blank the card
      }
      setPayload(cleaned);
      setHeader(p.header);
      setHourKey(p.hourKey);
      persistPayloadLocal(cleaned);
      clearLocalTicker();
      setTickerItems([]);
      saveLastPack("");
      scanQueueRef.current = (cleaned.spares ?? next.scanQueue ?? []).slice(0, 10);
    } catch {
      const { briefingFromSpares } = await import("@/lib/news/compose");
      let local = stripBurned(briefingFromSpares(payload, 6));
      if (local.arenas.reduce((s, a) => s + a.items.length, 0) === 0) local = payload;
      setPayload(local);
      persistPayloadLocal(local);
      clearLocalTicker();
      setTickerItems([]);
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

  function onPackSpares() {
    const next = packSparesNow(payload, 6);
    if (briefingItemCount(next) === 0) return;
    setPayload(next);
    setHeader(`עדכון | ${formatHeDateTime(new Date())}`);
    persistPayloadLocal(next);
    if (hourKey && hourKey !== "seed") {
      void persistPayload({ data: { hourKey, payload: next } }).then(setDash).catch(() => undefined);
    }
  }

  function onAddTickerToSpare(url: string) {
    const row = tickerItems.find((item) => item.url === url);
    if (!row) return;
    const spare = tickerToSpare(row);
    if (!spare) return;
    const known = new Set([
      ...payload.arenas.flatMap((a) => a.items.map((i) => i.url)),
      ...payload.spares.map((s) => s.url),
    ]);
    if (known.has(spare.url)) return;
    const next = { ...payload, spares: [spare, ...payload.spares].slice(0, 10) };
    setPayload(next);
    persistPayloadLocal(next);
    if (hourKey && hourKey !== "seed") {
      void persistPayload({ data: { hourKey, payload: next } }).then(setDash).catch(() => undefined);
    }
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
        <div className="flex h-16 items-center sm:h-20">
          <div className="flex h-full min-w-0 flex-1 items-center overflow-hidden border-b border-gold/25">
            <div
              className="ticker-track flex h-full w-max items-center gap-12 whitespace-nowrap px-5 text-base text-fg-on-dark sm:text-lg"
            >
              {tickerRows.map((row, i) => (
                <span key={row.url + i} className="ticker-item inline-flex items-center leading-none">
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 hover:text-gold"
                  >
                    <span className="font-semibold text-gold">{row.source}</span>
                    <span className="text-fg-on-dark/90">{row.text}</span>
                  </a>
                  {row.url !== "#" ? (
                    <button
                      type="button"
                      aria-label="הוסף לספיירים"
                      title="לספייר"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onAddTickerToSpare(row.url);
                      }}
                      className="ticker-plus size-6 items-center justify-center rounded-full border border-gold bg-bg text-sm font-bold text-gold shadow hover:bg-gold hover:text-bg"
                    >
                      +
                    </button>
                  ) : null}
                </span>
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
          onPackSpares={onPackSpares}
          used={scanning}
          scanDueLabel={due}
          replaced={replaced}
          total={total}
        />
      </main>
    </div>
  );
}

import { CURRENT_BRIEFING } from "./desk";
import {
  resolveArena,
  deskHeadline,
  fingerprint,
  attributionLead,
  formatOutlet,
  hasHebrew,
  isIsraeliStrike,
  isIsraeliVoice,
  isJunkItem,
  isOffPrimarySource,
  failsTickerQuality,
  isOffTheater,
  isPropagandaCopy,
  isUsDomesticOffDesk,
  sameEvent,
  tooMuchLatin,
  shapeCopy,
  shortenSpeaker,
  toDeskHebrew,
} from "./text";
import type {
  ArenaId,
  BriefingArena,
  BriefingItem,
  BriefingPayload,
  RawStory,
  SpareItem,
} from "./types";
import {
  ARENA_META,
  ARENA_ORDER,
  DESK_STYLE,
  ensureItemIds,
  sortArenas,
} from "./types";
import { arenaPresentation } from "./text";
import { translateToHebrew } from "./translate";
import type { TickerItem } from "./types";

function decorateArenas(payload: BriefingPayload): BriefingPayload {
  return {
    desk: payload.desk,
    arenas: sortArenas(
      payload.arenas
        .filter((arena) => ARENA_META[arena.id as ArenaId] && arena.items.length > 0)
        .map((arena) => {
          const pres = arenaPresentation(arena.id as ArenaId, arena.items);
          return {
            ...arena,
            id: arena.id as ArenaId,
            title: pres.title,
            flags: pres.flags,
            items: arena.items,
          };
        }),
    ),
    spares: (payload.spares ?? []).slice(0, 10),
  };
}

function itemText(row: { speaker: string; body: string }) {
  return `${row.speaker} ${row.body}`;
}

function makeId(prefix: string, url: string) {
  return `${prefix}-${fingerprint(url, url).slice(0, 12)}`;
}

function mkItem(
  speaker: string,
  body: string,
  url: string,
  publishedAt?: string | null,
): BriefingItem {
  const shaped = shapeCopy(speaker, body, url);
  return {
    id: makeId("i", url),
    speaker: shaped.speaker,
    body: shaped.body,
    url,
    publishedAt: publishedAt || new Date().toISOString(),
  };
}

function prunePayload(payload: BriefingPayload, previous: string[]): BriefingPayload {
  const covered = [...previous];
  const arenas: BriefingArena[] = [];
  for (const arena of payload.arenas) {
    const items: BriefingItem[] = [];
    for (const row of arena.items) {
      const t = itemText(row);
      if (covered.some((p) => sameEvent(p, t))) continue;
      items.push(row);
      covered.push(t);
    }
    if (items.length) arenas.push({ ...arena, items });
  }
  const spares: SpareItem[] = [];
  for (const spare of payload.spares ?? []) {
    if (spares.length >= 10) break;
    const t = itemText(spare);
    if (covered.some((p) => sameEvent(p, t))) continue;
    spares.push(spare);
    covered.push(t);
  }
  return ensureItemIds({ ...payload, arenas, spares, desk: DESK_STYLE });
}

function seedPayload(): BriefingPayload {
  return ensureItemIds(structuredClone(CURRENT_BRIEFING));
}

function interestScore(text: string, publishedAt?: string | null) {
  let s = 0;
  if (/גורמים ל-|בלעדי|מסר(?:ו)? ל|דווח ב-/.test(text)) s += 6;
  if (/משה["״]מ|הורמוז|חיזבאללה|חות|קאליבאף|טראמפ|עלי אלטאהר|תקיפ|טיל/.test(text)) s += 4;
  if (/איראן|לבנון|תימן|עיראק|כווית|סעודי|סוריה/.test(text)) s += 2;
  if (publishedAt) {
    const tms = Date.parse(publishedAt);
    if (Number.isFinite(tms)) s += Math.max(0, 5 - (Date.now() - tms) / 3_600_000);
  }
  return s;
}

function storyToItem(story: RawStory): BriefingItem | null {
  const outlet = formatOutlet(story.source);
  const heTitle = toDeskHebrew(story.title);
  const bodyBase = hasHebrew(heTitle) ? heTitle : deskHeadline(story.title);
  if (!bodyBase || bodyBase.length < 12) return null;
  const speaker = attributionLead(story.source);
  // Prefer outlet lead for English; still keep line even if partially English after substitutions
  const cleaned = shapeCopy(
    shortenSpeaker(speaker),
    bodyBase.replace(/\s*20\d{2}-\d{2}-\d{2}T[\d:.Z+-]+/g, "").trim(),
    story.url,
  );
  if (!cleaned.body || isJunkItem(cleaned.speaker, cleaned.body, story.url)) return null;
  if (!hasHebrew(cleaned.body) || tooMuchLatin(cleaned.body)) return null;
  if (/אבו עלי|כאן 11|דסק ערבים|ynet|עמית סגל|יחזקאלי/i.test(story.source)) return null;
  const blob = `${cleaned.speaker} ${cleaned.body} ${story.title}`;
  if (isOffPrimarySource(blob, story.source)) return null;
  if (isIsraeliVoice(cleaned.speaker, cleaned.body, story.url) && !isIsraeliStrike(cleaned.body)) return null;
  if (isUsDomesticOffDesk(blob)) return null;
  if (isPropagandaCopy(cleaned.body) || isOffTheater(`${cleaned.body} ${story.title}`, story.source)) return null;
  if (failsTickerQuality(cleaned.body)) return null;
  return mkItem(
    cleaned.speaker || attributionLead(story.source),
    cleaned.body,
    story.url,
    story.publishedAt,
  );
}

function fromStories(
  stories: RawStory[],
  seen: Set<string>,
  previous: string[],
): BriefingPayload {
  const ranked = [...stories].sort(
    (a, b) =>
      interestScore(`${b.title} ${b.source}`, b.publishedAt) -
      interestScore(`${a.title} ${a.source}`, a.publishedAt),
  );
  const arenas = new Map<ArenaId, BriefingItem[]>();
  const spares: SpareItem[] = [];
  const covered = [...previous];

  for (const story of ranked) {
    const row = storyToItem(story);
    if (!row) continue;
    const fp = fingerprint(row.url, `${row.speaker} ${row.body}`);
    if (seen.has(fp)) continue;
    const text = itemText(row);
    if (covered.some((p) => sameEvent(p, text))) continue;
    covered.push(text);
    seen.add(fp);
    let arenaId = resolveArena(text, story.arena);
    if (!ARENA_META[arenaId]) arenaId = "intl";
    const mainCount = [...arenas.values()].reduce((s, a) => s + a.length, 0);
    if (mainCount < 6) {
      const list = arenas.get(arenaId) ?? [];
      list.push(row);
      arenas.set(arenaId, list);
    } else if (spares.length < 10) {
      spares.push({ ...row, id: makeId("s", row.url), arena: arenaId });
    }
  }

  // Rank arenas by total interest of bundle
  const orderedArenas = ARENA_ORDER.filter((id) => arenas.get(id)?.length).map((id) => {
    const items = (arenas.get(id) ?? []).sort(
      (a, b) => interestScore(itemText(b), b.publishedAt) - interestScore(itemText(a), a.publishedAt),
    );
    return {
      id,
      title: ARENA_META[id].title,
      flags: ARENA_META[id].flags,
      items,
    };
  });

  return ensureItemIds({
    desk: DESK_STYLE,
    arenas: orderedArenas,
    spares,
  });
}

function mergeUnique(
  primary: BriefingPayload,
  extra: BriefingPayload,
  previous: string[],
): BriefingPayload {
  const base = prunePayload(primary, previous);
  const more = prunePayload(extra, [
    ...previous,
    ...base.arenas.flatMap((a) => a.items.map(itemText)),
    ...base.spares.map(itemText),
  ]);
  const byId = new Map(base.arenas.map((a) => [a.id, { ...a, items: [...a.items] }]));
  for (const arena of more.arenas) {
    const existing = byId.get(arena.id);
    if (existing) existing.items.push(...arena.items);
    else byId.set(arena.id, { ...arena, items: [...arena.items] });
  }
  return ensureItemIds({
    desk: DESK_STYLE,
    arenas: [...byId.values()],
    spares: [...base.spares, ...more.spares].slice(0, 10),
  });
}

function capBriefing(payload: BriefingPayload, max = 6): BriefingPayload {
  // Order arenas by bundle interest, then take strongest items up to max
  const scored = payload.arenas
    .map((arena) => ({
      arena,
      score: arena.items.reduce((s, it) => s + interestScore(itemText(it), it.publishedAt), 0),
    }))
    .sort((a, b) => b.score - a.score);

  const extras: SpareItem[] = [];
  let n = 0;
  const arenas: BriefingArena[] = [];
  for (const { arena } of scored) {
    const keep: BriefingItem[] = [];
    for (const row of arena.items) {
      if (n < max) {
        keep.push(row);
        n += 1;
      } else {
        extras.push({ ...row, arena: arena.id });
      }
    }
    if (keep.length) arenas.push({ ...arena, items: keep });
  }
  // Restore ARENA_ORDER among kept
  const byId = new Map(arenas.map((a) => [a.id, a]));
  return ensureItemIds({
    desk: DESK_STYLE,
    arenas: ARENA_ORDER.filter((id) => byId.has(id)).map((id) => byId.get(id)!),
    spares: [...extras, ...payload.spares].slice(0, 10),
  });
}

function padSpares(
  payload: BriefingPayload,
  stories: RawStory[],
  previous: string[],
  fromSeed = true,
): BriefingPayload {
  if (payload.spares.length >= 10) return payload;
  const covered = [
    ...previous,
    ...payload.arenas.flatMap((a) => a.items.map(itemText)),
    ...payload.spares.map(itemText),
  ];
  const seenUrls = new Set([
    ...payload.arenas.flatMap((a) => a.items.map((i) => i.url)),
    ...payload.spares.map((i) => i.url),
  ]);
  const spares = [...payload.spares];
  for (const story of stories) {
    if (spares.length >= 10) break;
    if (seenUrls.has(story.url)) continue;
    const row = storyToItem(story);
    if (!row) continue;
    if (covered.some((p) => sameEvent(p, itemText(row)))) continue;
    let arenaId = resolveArena(itemText(row), story.arena);
    if (!ARENA_META[arenaId]) arenaId = "intl";
    spares.push({ ...row, id: makeId("s", row.url), arena: arenaId });
    covered.push(itemText(row));
    seenUrls.add(row.url);
  }
  // pad from seed if still short (skipped for live-only compose)
  if (fromSeed && spares.length < 10) {
    for (const spare of seedPayload().spares) {
      if (spares.length >= 10) break;
      if (seenUrls.has(spare.url)) continue;
      if (covered.some((p) => sameEvent(p, itemText(spare)))) continue;
      spares.push(spare);
      covered.push(itemText(spare));
      seenUrls.add(spare.url);
    }
  }
  return ensureItemIds({ ...payload, spares: spares.slice(0, 10) });
}

/** Rule-based desk composer — no XAI / no api.x.ai. */
export async function composeBriefing(input: {
  hourLabel: string;
  stories: RawStory[];
  previous: string[];
  seen: Set<string> | string[];
}) {
  const seen = input.seen instanceof Set ? input.seen : new Set(input.seen);
  const seed = prunePayload(seedPayload(), input.previous);
  const live = fromStories(input.stories, seen, input.previous);
  const liveCount = live.arenas.reduce((s, a) => s + a.items.length, 0);
  // Prefer live stories; seed only fills gaps when fetch is thin
  const merged =
    liveCount >= 4
      ? mergeUnique(live, seed, input.previous)
      : mergeUnique(seed, live, input.previous);
  let capped = capBriefing(merged, 6);
  // Ensure 4–8: if under 4 after prune, keep seed items
  const count = capped.arenas.reduce((s, a) => s + a.items.length, 0);
  if (count < 4) {
    capped = capBriefing(mergeUnique(seedPayload(), capped, []), 6);
  }
  capped = padSpares(capped, input.stories, input.previous);
  const payload = decorateArenas(capped);

  const tickerHe = [
    ...payload.arenas.flatMap((arena) =>
      arena.items.map((it) => ({
        url: it.url,
        titleHe: `${it.speaker ? `${it.speaker}: ` : ""}${it.body}`.replace(/\*\*/g, ""),
        source: it.speaker || "עדכון",
        arena: arena.id,
      })),
    ),
    ...payload.spares.map((it) => ({
      url: it.url,
      titleHe: `${it.speaker ? `${it.speaker}: ` : ""}${it.body}`.replace(/\*\*/g, ""),
      source: it.speaker || "עדכון",
      arena: it.arena,
    })),
  ];

  return { payload, tickerHe };
}

/**
 * Live-only desk from scanned stories. Never merges CURRENT_BRIEFING seed.
 * Empty live pool → empty arenas + spares (caller may keep a prior payload).
 */
export function composeLiveOnly(input: {
  stories: RawStory[];
  previous: string[];
  seen: Set<string> | string[];
}): BriefingPayload {
  const seen = input.seen instanceof Set ? input.seen : new Set(input.seen);
  const live = fromStories(input.stories, seen, input.previous);
  const liveCount = live.arenas.reduce((s, a) => s + a.items.length, 0);
  if (liveCount === 0) {
    return ensureItemIds({
      desk: DESK_STYLE,
      arenas: [],
      spares: [],
    });
  }
  let capped = capBriefing(live, 6);
  capped = padSpares(capped, input.stories, input.previous, false);
  return decorateArenas(capped);
}

export function itemInterest(item: { speaker: string; body: string; publishedAt?: string | null }) {
  return interestScore(itemText(item), item.publishedAt);
}

/**
 * After «השתמשתי»: new briefing from strongest *current spares only*.
 * Consumed briefing items are DROPPED (not demoted to spares).
 * Leftover unused spares stay in the spare list (6 go up, the rest remain).
 * Used briefing items are never demoted into spares.
 */
export function briefingFromSpares(payload: BriefingPayload, max = 6): BriefingPayload {
  const sparePool = [...(payload.spares ?? [])].sort(
    (a, b) => itemInterest(b) - itemInterest(a),
  );

  const picked: SpareItem[] = [];
  const covered: string[] = [];
  const take = (row: SpareItem) => {
    if (picked.length >= max) return;
    const t = itemText(row);
    if (covered.some((p) => sameEvent(p, t))) return;
    picked.push(row);
    covered.push(t);
  };
  for (const row of sparePool) take(row);

  const arenas = new Map<ArenaId, BriefingItem[]>();
  for (const row of picked) {
    let arenaId = resolveArena(itemText(row), row.arena);
    if (!ARENA_META[arenaId]) arenaId = "intl";
    const list = arenas.get(arenaId) ?? [];
    list.push({
      id: makeId("i", row.url || row.id),
      speaker: row.speaker,
      body: row.body,
      url: row.url,
      shortUrl: row.shortUrl,
      publishedAt: row.publishedAt,
    });
    arenas.set(arenaId, list);
  }

  const pickedIds = new Set(picked.map((r) => r.id));
  const leftover = sparePool.filter((r) => !pickedIds.has(r.id));

  const ordered = ARENA_ORDER.filter((id) => arenas.get(id)?.length).map((id) => {
    const items = (arenas.get(id) ?? []).sort(
      (a, b) => itemInterest(b) - itemInterest(a),
    );
    return {
      id,
      title: ARENA_META[id].title,
      flags: ARENA_META[id].flags,
      items,
    };
  });

  return decorateArenas(
    ensureItemIds({
      desk: DESK_STYLE,
      arenas: ordered,
      spares: leftover.slice(0, 10),
    }),
  );
}

const SCORE_MARGIN = 0.35;

function flatBriefingItems(payload: BriefingPayload) {
  const rows: { arenaId: ArenaId; item: BriefingItem; score: number }[] = [];
  for (const arena of payload.arenas) {
    for (const item of arena.items) {
      rows.push({
        arenaId: arena.id as ArenaId,
        item,
        score: itemInterest(item),
      });
    }
  }
  return rows;
}

/** Live scan: stronger find replaces weakest briefing item, else weakest spare. */
export function absorbFindsIntoPayload(
  payload: BriefingPayload,
  stories: RawStory[],
): BriefingPayload {
  let next: BriefingPayload = {
    desk: payload.desk,
    arenas: payload.arenas.map((a) => ({ ...a, items: [...a.items] })),
    spares: [...(payload.spares ?? [])],
  };

  const knownUrls = new Set([
    ...next.arenas.flatMap((a) => a.items.map((i) => i.url)),
    ...next.spares.map((i) => i.url),
  ]);
  const covered = [
    ...next.arenas.flatMap((a) => a.items.map(itemText)),
    ...next.spares.map(itemText),
  ];

  const candidates: { item: BriefingItem; arenaId: ArenaId; score: number }[] = [];
  for (const story of stories) {
    const row = storyToItem(story);
    if (!row) continue;
    if (knownUrls.has(row.url)) continue;
    const t = itemText(row);
    if (covered.some((p) => sameEvent(p, t))) continue;
    let arenaId = resolveArena(t, story.arena);
    if (!ARENA_META[arenaId]) arenaId = "intl";
    candidates.push({ item: row, arenaId, score: itemInterest(row) });
  }
  candidates.sort((a, b) => b.score - a.score);

  for (const cand of candidates) {
    const flat = flatBriefingItems(next);
    if (flat.length > 0) {
      flat.sort((a, b) => a.score - b.score);
      const weakest = flat[0]!;
      if (cand.score > weakest.score + SCORE_MARGIN) {
        // demote weakest to spares, insert cand into its arena
        next.arenas = next.arenas
          .map((arena) =>
            arena.id === weakest.arenaId
              ? { ...arena, items: arena.items.filter((i) => i.id !== weakest.item.id) }
              : arena,
          )
          .filter((arena) => arena.items.length > 0);

        let target = next.arenas.find((a) => a.id === cand.arenaId);
        if (!target) {
          target = {
            id: cand.arenaId,
            title: ARENA_META[cand.arenaId].title,
            flags: ARENA_META[cand.arenaId].flags,
            items: [],
          };
          next.arenas.push(target);
        }
        target.items = [...target.items, cand.item];

        const demoted: SpareItem = {
          ...weakest.item,
          id: makeId("s", weakest.item.url || weakest.item.id),
          arena: weakest.arenaId,
        };
        next.spares = [demoted, ...next.spares.filter((s) => s.url !== demoted.url)];
        if (next.spares.length > 10) {
          next.spares = [...next.spares]
            .sort((a, b) => itemInterest(b) - itemInterest(a))
            .slice(0, 10);
        }
        knownUrls.add(cand.item.url);
        covered.push(itemText(cand.item));
        continue;
      }
    }

    if (next.spares.length > 0) {
      const rankedSpares = [...next.spares]
        .map((s) => ({ s, score: itemInterest(s) }))
        .sort((a, b) => a.score - b.score);
      const weak = rankedSpares[0]!;
      if (cand.score > weak.score + SCORE_MARGIN) {
        next.spares = next.spares.filter((s) => s.id !== weak.s.id);
        next.spares.push({
          ...cand.item,
          id: makeId("s", cand.item.url || cand.item.id),
          arena: cand.arenaId,
        });
        next.spares = [...next.spares]
          .sort((a, b) => itemInterest(b) - itemInterest(a))
          .slice(0, 10);
        knownUrls.add(cand.item.url);
        covered.push(itemText(cand.item));
        continue;
      }
    } else if (next.spares.length < 10) {
      next.spares.push({
        ...cand.item,
        id: makeId("s", cand.item.url || cand.item.id),
        arena: cand.arenaId,
      });
      knownUrls.add(cand.item.url);
      covered.push(itemText(cand.item));
    }
  }

  return decorateArenas(ensureItemIds(next));
}

export function localizeHeadline(title: string, source: string) {
  const he = deskHeadline(title);
  return he.slice(0, 160);
}

export async function localizeHeadlineAsync(title: string, _source: string) {
  const he = await translateToHebrew(title);
  return he.slice(0, 160);
}

export async function composeTickerItem(story: RawStory): Promise<TickerItem | null> {
  const he = await localizeHeadlineAsync(story.title, story.source);
  const item = storyToItem({ ...story, title: he });
  if (!item) return null;
  const body = item.body.replace(/\*\*/g, "").replace(/^דחוף\s*[|｜]\s*/, "");
  if (!hasHebrew(body) || tooMuchLatin(body) || body.length < 20) return null;
  if (failsTickerQuality(body)) return null;
  return {
    id: story.url.slice(-24) || story.url,
    title: story.title,
    titleHe: body,
    source: formatOutlet(story.source),
    url: story.url,
    publishedAt: story.publishedAt,
    arena: resolveArena(`${item.speaker} ${body}`, story.arena),
  };
}

export function tickerToSpare(item: TickerItem): SpareItem | null {
  const body = toDeskHebrew(item.titleHe || item.title || "").replace(/\*\*/g, "");
  if (!body || body.length < 8) return null;
  const speaker = attributionLead(item.source);
  let arenaId = resolveArena(`${speaker} ${body}`, item.arena);
  if (!ARENA_META[arenaId]) arenaId = "intl";
  return {
    id: makeId("s", item.url),
    speaker,
    body,
    url: item.url,
    publishedAt: item.publishedAt || new Date().toISOString(),
    arena: arenaId,
  };
}

/** Manual pack: briefing from current spares, leftover spares stay. Does not burn. */
export function packSparesNow(payload: BriefingPayload, max = 6): BriefingPayload {
  const sparePool = [...(payload.spares ?? [])].sort(
    (a, b) => itemInterest(b) - itemInterest(a),
  );
  if (sparePool.length === 0) return payload;

  const picked: SpareItem[] = [];
  const covered: string[] = [];
  for (const row of sparePool) {
    if (picked.length >= max) break;
    const t = itemText(row);
    if (covered.some((p) => sameEvent(p, t))) continue;
    picked.push(row);
    covered.push(t);
  }
  const pickedIds = new Set(picked.map((r) => r.id));
  const leftover = sparePool.filter((r) => !pickedIds.has(r.id));

  const arenas = new Map<ArenaId, BriefingItem[]>();
  for (const row of picked) {
    let arenaId = resolveArena(itemText(row), row.arena);
    if (!ARENA_META[arenaId]) arenaId = "intl";
    const list = arenas.get(arenaId) ?? [];
    list.push({
      id: makeId("i", row.url || row.id),
      speaker: row.speaker,
      body: row.body,
      url: row.url,
      shortUrl: row.shortUrl,
      publishedAt: row.publishedAt,
    });
    arenas.set(arenaId, list);
  }

  const ordered = ARENA_ORDER.filter((id) => arenas.get(id)?.length).map((id) => {
    const items = (arenas.get(id) ?? []).sort(
      (a, b) => itemInterest(b) - itemInterest(a),
    );
    return {
      id,
      title: ARENA_META[id].title,
      flags: ARENA_META[id].flags,
      items,
    };
  });

  return decorateArenas(
    ensureItemIds({
      desk: DESK_STYLE,
      arenas: ordered,
      spares: leftover.slice(0, 10),
    }),
  );
}

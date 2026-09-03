import { o as __toESM } from "../_runtime.mjs";
import { A as saveQueueAt, C as loadQueueAt, D as persistPayloadLocal, O as remainingOriginal, S as loadOriginalIds, T as markUsedLocal, a as FLAG_EMOJI, b as isScanning, c as applyAdd, d as briefingHasContent, f as briefingItemCount, g as formatDue, i as CURRENT_BRIEFING, j as scanDueAt, k as replaceNextOriginal, l as applySwap, o as SWAP_EVERY_MS, r as BRIEFING_HEADER, s as TICKER, u as arenaPresentation, w as loadUsedAt } from "./desk-Baj3HEuk.mjs";
import { R as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Check, i as Copy, n as RefreshCw, o as ArrowLeftRight, r as Plus } from "../_libs/lucide-react.mjs";
import { a as markUsed, c as swapSpare, i as getDashboard, n as Route, o as persistPayload, r as addSpare, s as refreshTicker } from "./router-CU8Lv1sK.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-5RGHKSWU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ArenaFlags({ codes }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-flex items-center gap-1 text-[1.15rem] leading-none",
		"aria-hidden": true,
		children: codes.map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: FLAG_EMOJI[code] ?? "🌍" }, code))
	});
}
function displayShort(url, fallback) {
	const candidates = [url, fallback].filter(Boolean);
	for (const row of candidates) if (/https:\/\/katzr\.net\/[a-z0-9]+/i.test(row) && !/tinyurl/i.test(row)) return row;
	return "";
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function renderBody(text) {
	return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
		if (part.startsWith("**") && part.endsWith("**")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
			className: "font-semibold text-fg",
			children: part.slice(2, -2)
		}, i);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: part }, i);
	});
}
function Lead({ item }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		item.speaker ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
			className: "font-semibold",
			children: [item.speaker, ":"]
		}) : null,
		item.speaker ? " " : null,
		renderBody(item.body)
	] });
}
function linkHref(item) {
	return displayShort(item.shortUrl, item.url);
}
function ItemBlock({ n, item }) {
	const href = linkHref(item);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "mb-7 text-right",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-pretty text-[1.05rem] leading-relaxed text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "ms-1 tabular-nums text-muted",
				children: [n, ". "]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lead, { item })]
		}), href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1.5 text-sm",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href,
				target: "_blank",
				rel: "noreferrer",
				className: "text-gold-deep underline decoration-line-strong underline-offset-4 hover:text-fg",
				dir: "ltr",
				children: href
			})
		}) : null]
	});
}
function preview(item) {
	const raw = `${item.speaker ? `${item.speaker}: ` : ""}${item.body}`.replace(/\*\*/g, "");
	return raw.length > 72 ? `${raw.slice(0, 72)}…` : raw;
}
function toWhatsAppBold(text) {
	return text.replace(/\*\*([^*]+)\*\*/g, "*$1*");
}
function whatsAppText(header, payload) {
	const lines = [header, ""];
	let n = 0;
	for (const arena of payload.arenas) {
		const shown = arenaPresentation(arena.id, arena.items);
		const flags = shown.flags.map((c) => FLAG_EMOJI[c] ?? "🌐").join("");
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
function BriefingDoc({ header, payload, onChange, onUsed, onSwap, onAdd, used, scanDueLabel, replaced = 0, total = 0 }) {
	const [armed, setArmed] = (0, import_react.useState)(null);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const arenas = payload.arenas;
	const spares = payload.spares;
	const canAdd = briefingItemCount(payload) < 8;
	const numbered = (0, import_react.useMemo)(() => {
		let n = 0;
		return arenas.map((arena) => {
			const shown = arenaPresentation(arena.id, arena.items);
			const items = arena.items.map((item) => {
				n += 1;
				return {
					n,
					item
				};
			});
			return {
				arena: {
					...arena,
					...shown
				},
				items
			};
		});
	}, [arenas]);
	function swap(spareId, itemId) {
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
	function add(spareId) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-5 flex items-start justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "min-w-0 flex-1 text-right text-2xl font-semibold tracking-tight text-fg-on-dark sm:text-3xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block",
					children: header
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-2 inline-block h-[3px] w-16 bg-gold" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onUsed,
				disabled: used,
				className: cn("inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-[0_6px_0_0_var(--color-gold-deep),0_10px_18px_rgba(0,0,0,0.35)] transition active:translate-y-0.5 active:shadow-[0_3px_0_0_var(--color-gold-deep)]", used ? "bg-navy-2 text-fg-on-dark/80" : "bg-gold text-bg hover:bg-gold-deep"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
					className: "size-4",
					strokeWidth: 2.4
				}), used ? "סומן כמשומש" : "השתמשתי בעדכון"]
			})]
		}),
		used ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mb-4 rounded-lg bg-gold/15 px-4 py-3 text-sm text-fg-on-dark shadow-[0_8px_24px_rgba(0,0,0,0.28)]",
			children: [
				"סריקה פעילה — הוחלפו ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
					replaced,
					"/",
					total || "—"
				] }),
				" ידיעות לבד",
				replaced >= (total || 99) ? " (העדכון חודש במלואו)" : "",
				". יעד: ",
				scanDueLabel ?? "כ־40 דק׳",
				"."
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative rounded-lg bg-surface px-5 py-6 text-fg shadow-[0_14px_0_0_rgba(12,28,55,0.55),0_22px_40px_rgba(0,0,0,0.45)] sm:px-8 sm:py-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => void copyBriefing(),
				className: "absolute start-3 top-3 inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 text-xs font-semibold text-navy shadow-[0_4px_0_0_rgba(12,28,55,0.18)] hover:bg-gold/20",
				"aria-label": copied ? "הועתק" : "העתק את העדכון",
				title: copied ? "הועתק" : "העתק לוואטסאפ",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }), copied ? "הועתק" : "העתק"]
			}), numbered.map(({ arena, items }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "mb-4 flex items-center gap-2 text-lg font-semibold text-navy",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: arena.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArenaFlags, { codes: arena.flags })]
				}), items.map(({ n, item }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemBlock, {
					n,
					item
				}, item.id))]
			}, arena.id))]
		}),
		spares.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8 rounded-lg border border-gold/25 bg-navy-2/50 px-4 py-5 shadow-[0_12px_0_0_rgba(7,20,40,0.7),0_20px_36px_rgba(0,0,0,0.4)] sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-1 text-right text-base font-semibold text-fg-on-dark",
					children: "ספיירים"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-4 text-right text-xs text-fg-on-dark/70",
					children: "«הוסף» מכניס לזירה הנכונה. «החלף» ואז בחרו ידיעה בעדכון — הספייר נכנס לזירה שלו."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "space-y-3",
					children: spares.map((row, i) => {
						const selected = armed === row.id;
						const arenaTitle = arenaPresentation(row.arena, [row]).title;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: cn("rounded-lg border px-3 py-3 shadow-[0_8px_0_0_rgba(12,28,55,0.18),0_10px_18px_rgba(0,0,0,0.12)] sm:px-4", selected ? "border-gold bg-surface" : "border-line/40 bg-surface"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1 text-fg",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-pretty text-base leading-relaxed",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "tabular-nums text-muted",
													children: [i + 1, ". "]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs font-medium text-muted",
													children: arenaTitle
												}),
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lead, { item: row })
											]
										}),
										linkHref(row) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1.5 text-sm",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
												href: linkHref(row),
												target: "_blank",
												rel: "noreferrer",
												className: "text-gold-deep underline underline-offset-4",
												dir: "ltr",
												children: linkHref(row)
											})
										}) : null,
										selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 space-y-1.5 rounded-md border border-gold/40 bg-gold/10 p-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-semibold text-navy",
												children: "בחרו ידיעה להחלפה:"
											}), targetsOf(arenas).map((target) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => swap(row.id, target.id),
												className: "block w-full rounded-md bg-surface-2 px-2 py-2 text-right text-sm text-fg shadow-[0_3px_0_0_rgba(12,28,55,0.15)] hover:bg-gold/25",
												children: [
													target.n,
													". ",
													target.label
												]
											}, target.id))]
										}) : null
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex shrink-0 flex-col gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										disabled: !canAdd,
										onClick: () => add(row.id),
										className: "inline-flex min-h-10 items-center justify-center gap-1 rounded-md border border-line bg-surface-2 px-2.5 text-xs font-semibold text-navy shadow-[0_4px_0_0_rgba(12,28,55,0.18)] disabled:opacity-40",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), "הוסף"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setArmed(selected ? null : row.id),
										className: "inline-flex min-h-10 items-center justify-center gap-1 rounded-md border border-line bg-surface-2 px-2.5 text-xs font-semibold text-navy shadow-[0_4px_0_0_rgba(12,28,55,0.18)]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeftRight, { className: "size-3.5" }), selected ? "ביטול" : "החלף"]
									})]
								})]
							})
						}, row.id);
					})
				})
			]
		}) : null
	] });
}
function targetsOf(arenas) {
	const targets = [];
	let n = 0;
	for (const arena of arenas) for (const item of arena.items) {
		n += 1;
		targets.push({
			n,
			id: item.id,
			label: preview(item)
		});
	}
	return targets;
}
function seedDash() {
	return {
		briefing: {
			id: "seed",
			hourLabel: "21:00",
			dateLabel: "3 בספטמבר",
			generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
			status: "ready",
			payload: structuredClone(CURRENT_BRIEFING)
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
			arena: null
		})),
		scanQueue: CURRENT_BRIEFING.spares.slice(0, 6),
		currentHourKey: "seed",
		currentClock: "21:00",
		currentDateLabel: "3 בספטמבר",
		generatingHour: null,
		scanningNext: false,
		scanDueAt: null,
		scanDueLabel: null
	};
}
function pickPayload(dash) {
	const fallback = structuredClone(CURRENT_BRIEFING);
	if (!dash) return {
		hourKey: "seed",
		header: BRIEFING_HEADER,
		payload: fallback
	};
	const view = briefingHasContent(dash.briefing) && dash.briefing || briefingHasContent(dash.latestBriefing) && dash.latestBriefing || null;
	if (!view) return {
		hourKey: dash.currentHourKey,
		header: `עדכון | ${dash.currentDateLabel}, ${dash.currentClock}`,
		payload: fallback
	};
	return {
		hourKey: view.id,
		header: `עדכון | ${view.dateLabel}, ${view.hourLabel}`,
		payload: view.payload
	};
}
function Home() {
	const initial = Route.useLoaderData();
	const [dash, setDash] = (0, import_react.useState)(() => initial ?? seedDash());
	const picked = pickPayload(dash);
	const [usedAt, setUsedAt] = (0, import_react.useState)(null);
	const [payload, setPayload] = (0, import_react.useState)(picked.payload);
	const [header, setHeader] = (0, import_react.useState)(picked.header);
	const [hourKey, setHourKey] = (0, import_react.useState)(picked.hourKey);
	const [originalIds, setOriginalIds] = (0, import_react.useState)([]);
	const [tickKey, setTickKey] = (0, import_react.useState)(0);
	const [scanningTicker, setScanningTicker] = (0, import_react.useState)(false);
	const queueAt = (0, import_react.useRef)(0);
	const originalsRef = (0, import_react.useRef)([]);
	const scanQueueRef = (0, import_react.useRef)([]);
	(0, import_react.useEffect)(() => {
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
	(0, import_react.useEffect)(() => {
		scanQueueRef.current = (dash.scanQueue ?? []).slice(0, 10);
	}, [dash.scanQueue]);
	(0, import_react.useEffect)(() => {
		if (!usedAt) return;
		const tick = () => {
			setPayload((curr) => {
				const still = remainingOriginal(curr, originalsRef.current);
				if (still.length === 0) return curr;
				const queue = scanQueueRef.current;
				if (queueAt.current >= queue.length) return curr;
				const nextIn = queue[queueAt.current];
				const result = replaceNextOriginal(curr, still, nextIn);
				if (!result) return curr;
				queueAt.current += 1;
				saveQueueAt(queueAt.current);
				persistPayloadLocal(result.payload);
				if (hourKey && hourKey !== "seed") persistPayload({ data: {
					hourKey,
					payload: result.payload
				} }).catch(() => void 0);
				return result.payload;
			});
		};
		const first = window.setTimeout(tick, 8e3);
		const loop = window.setInterval(tick, SWAP_EVERY_MS);
		return () => {
			window.clearTimeout(first);
			window.clearInterval(loop);
		};
	}, [usedAt, hourKey]);
	(0, import_react.useEffect)(() => {
		const poll = window.setInterval(() => {
			getDashboard({ data: {} }).then((next) => {
				setDash(next);
				if (!isScanning(usedAt)) {
					const p = pickPayload(next);
					if (briefingHasContent(next.briefing) || briefingHasContent(next.latestBriefing)) {
						setPayload(p.payload);
						setHeader(p.header);
						setHourKey(p.hourKey);
					}
				}
			}).catch(() => void 0);
		}, 2e4);
		const tick = window.setInterval(() => {
			onRefreshTicker();
		}, 6e4);
		return () => {
			window.clearInterval(poll);
			window.clearInterval(tick);
		};
	}, [usedAt]);
	const scanning = Boolean(usedAt) && (isScanning(usedAt) || dash.scanningNext || remainingOriginal(payload, originalIds).length > 0);
	const due = (dash.scanDueLabel && dash.scanningNext ? dash.scanDueLabel : null) || (usedAt ? formatDue(scanDueAt(usedAt)) : null);
	const left = remainingOriginal(payload, originalIds).length;
	const total = Math.max(originalIds.length, 1);
	const replaced = Math.max(0, originalIds.length - left);
	const tickerRows = (0, import_react.useMemo)(() => {
		const live = dash.ticker.map((row) => {
			const text = (row.titleHe || row.title || "").replace(/\*\*/g, "");
			return {
				source: row.source || "מבזק",
				text,
				url: displayShort(void 0, row.url) || row.url
			};
		}).filter((row) => row.text.length > 8);
		const base = live.length ? live : TICKER;
		return [...base, ...base];
	}, [dash.ticker]);
	async function onRefreshTicker() {
		setScanningTicker(true);
		setTickKey((k) => k + 1);
		try {
			const next = await refreshTicker();
			setDash(next);
		} catch {} finally {
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
			const next = await markUsed({ data: { hourKey: hourKey === "seed" ? dash.currentHourKey : hourKey } });
			setDash(next);
			scanQueueRef.current = (next.scanQueue ?? []).slice(0, 10);
		} catch {
			scanQueueRef.current = (dash.scanQueue ?? CURRENT_BRIEFING.spares).slice(0, 10);
		}
	}
	async function onChange(next) {
		setPayload(next);
		persistPayloadLocal(next);
		if (hourKey && hourKey !== "seed") try {
			const dashNext = await persistPayload({ data: {
				hourKey,
				payload: next
			} });
			setDash(dashNext);
		} catch {}
	}
	async function onSwap(spareId, itemId) {
		if (hourKey && hourKey !== "seed") try {
			const next = await swapSpare({ data: {
				hourKey,
				spareId,
				itemId
			} });
			setDash(next);
			const p = pickPayload(next);
			setPayload(p.payload);
			persistPayloadLocal(p.payload);
			return;
		} catch {}
		const { applySwap } = await import("./desk-Baj3HEuk.mjs").then((n) => n.m).then((n) => n.N);
		const next = applySwap(payload, spareId, itemId);
		if (next) onChange(next);
	}
	async function onAdd(spareId) {
		if (hourKey && hourKey !== "seed") try {
			const next = await addSpare({ data: {
				hourKey,
				spareId
			} });
			setDash(next);
			const p = pickPayload(next);
			setPayload(p.payload);
			persistPayloadLocal(p.payload);
			return;
		} catch {}
		const { applyAdd } = await import("./desk-Baj3HEuk.mjs").then((n) => n.m).then((n) => n.N);
		const next = applyAdd(payload, spareId);
		if (next) onChange(next);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-[linear-gradient(180deg,var(--color-bg)_0%,var(--color-bg-mid)_42%,var(--color-navy)_100%)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "sticky top-0 z-20 border-b border-gold/30 bg-bg/95 backdrop-blur",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-12 items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => void onRefreshTicker(),
					className: "inline-flex h-full shrink-0 items-center gap-2 border-e border-gold/30 bg-navy px-3 text-xs font-semibold text-fg-on-dark hover:bg-navy-2 sm:px-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-3.5 ${scanningTicker ? "animate-spin" : ""}` }), "רענון מבזקים"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-full min-w-0 flex-1 items-center overflow-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "ticker-track flex h-full w-max items-center gap-10 whitespace-nowrap px-4 text-sm text-fg-on-dark",
						children: tickerRows.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: row.url,
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex items-center gap-2 leading-none hover:text-gold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-gold",
								children: row.source
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg-on-dark/90",
								children: row.text
							})]
						}, row.url + i))
					}, tickKey)
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BriefingDoc, {
				header,
				payload,
				onChange,
				onUsed: () => void onUsed(),
				onSwap: (spareId, itemId) => void onSwap(spareId, itemId),
				onAdd: (spareId) => void onAdd(spareId),
				used: scanning,
				scanDueLabel: due,
				replaced,
				total
			})
		})]
	});
}
//#endregion
export { Home as component };

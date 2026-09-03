import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as ArrowLeftRight, i as Check, n as RefreshCw, r as Plus } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-cgLT9_AR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ARENA_ORDER = [
	"iran",
	"lebanon",
	"north",
	"axis",
	"gulf",
	"turkey",
	"region",
	"intl"
];
var ARENA_META = {
	iran: {
		title: "איראן",
		flags: ["ir"]
	},
	lebanon: {
		title: "לבנון",
		flags: ["lb"]
	},
	north: {
		title: "סוריה",
		flags: ["sy"]
	},
	axis: {
		title: "הציר",
		flags: ["ye", "iq"]
	},
	gulf: {
		title: "המפרציות",
		flags: ["sa", "ae"]
	},
	turkey: {
		title: "תורכיה",
		flags: ["tr"]
	},
	region: {
		title: "באזור",
		flags: ["eg"]
	},
	intl: {
		title: "בינ״ל",
		flags: ["globe"]
	}
};
var FLAG_EMOJI = {
	ir: "🇮🇷",
	lb: "🇱🇧",
	sy: "🇸🇾",
	ye: "🇾🇪",
	iq: "🇮🇶",
	sa: "🇸🇦",
	ae: "🇦🇪",
	qa: "🇶🇦",
	kw: "🇰🇼",
	bh: "🇧🇭",
	om: "🇴🇲",
	tr: "🇹🇷",
	eg: "🇪🇬",
	jo: "🇯🇴",
	globe: "🌍"
};
var FLAG_MARKS = [
	{
		code: "ir",
		re: /איראן|טהראן|פזשכיאן|קאליבאף|משה["״]מ|הורמוז/
	},
	{
		code: "lb",
		re: /לבנון|ביירות|חיזבאללה|עלי אלטאהר/
	},
	{
		code: "sy",
		re: /סוריה|דמשק|אלשרע/
	},
	{
		code: "ye",
		re: /תימן|חות['׳]ים|צנעא/
	},
	{
		code: "iq",
		re: /עיראק|בגדאד|אלגיוס העממי|עצאא['׳]ב/
	},
	{
		code: "sa",
		re: /סעודיה|ריאד/
	},
	{
		code: "ae",
		re: /אמירויות|מאע["״]מ|אבו דאבי/
	},
	{
		code: "qa",
		re: /קטר|דוחא/
	},
	{
		code: "kw",
		re: /כווית/
	},
	{
		code: "bh",
		re: /בחריין/
	},
	{
		code: "eg",
		re: /מצרים|קהיר|א-סיסי|אלסיסי/
	},
	{
		code: "tr",
		re: /תורכיה|אנקרה|ארדואן/
	}
];
function flagsForItems(items) {
	const ordered = [];
	for (const item of items) {
		const text = `${item.speaker} ${item.body}`;
		for (const mark of FLAG_MARKS) if (mark.re.test(text) && !ordered.includes(mark.code)) ordered.push(mark.code);
	}
	return ordered;
}
function arenaPresentation(id, items) {
	if (id === "intl") return {
		title: "בינ״ל",
		flags: ["globe"]
	};
	const flags = flagsForItems(items);
	const names = {
		ir: "איראן",
		lb: "לבנון",
		sy: "סוריה",
		ye: "תימן",
		iq: "עיראק",
		sa: "סעודיה",
		ae: "מאע״מ",
		qa: "קטר",
		kw: "כווית",
		bh: "בחריין",
		eg: "מצרים",
		tr: "תורכיה"
	};
	if (flags.length === 1 && names[flags[0]]) return {
		title: names[flags[0]],
		flags
	};
	if (flags.length > 1) return {
		title: ARENA_META[id].title,
		flags
	};
	return {
		title: ARENA_META[id].title,
		flags: ARENA_META[id].flags
	};
}
function clonePayload(payload) {
	return {
		arenas: payload.arenas.map((arena) => ({
			...arena,
			items: arena.items.map((item) => ({ ...item }))
		})),
		spares: payload.spares.map((row) => ({ ...row }))
	};
}
function briefingItemCount(payload) {
	return payload.arenas.reduce((sum, arena) => sum + arena.items.length, 0);
}
function findSpareIndex(spares, id) {
	return spares.findIndex((row) => row.id === id);
}
function findItemLoc(arenas, id) {
	for (let ai = 0; ai < arenas.length; ai += 1) {
		const ii = arenas[ai].items.findIndex((row) => row.id === id);
		if (ii >= 0) return {
			ai,
			ii
		};
	}
	return null;
}
function getOrCreateArena(arenas, id) {
	let arena = arenas.find((row) => row.id === id);
	if (!arena) {
		const meta = ARENA_META[id];
		arena = {
			id,
			title: meta.title,
			flags: meta.flags,
			items: []
		};
		arenas.push(arena);
	}
	return arena;
}
function sortArenas(arenas) {
	const byId = new Map(arenas.filter((arena) => arena.items.length > 0).map((arena) => [arena.id, arena]));
	return ARENA_ORDER.filter((id) => byId.has(id)).map((id) => {
		const arena = byId.get(id);
		const shown = arenaPresentation(id, arena.items);
		return {
			...arena,
			title: shown.title,
			flags: shown.flags
		};
	});
}
function applySwap(payload, spareId, itemId) {
	const next = clonePayload(payload);
	const spareIndex = findSpareIndex(next.spares, spareId);
	const loc = findItemLoc(next.arenas, itemId);
	if (spareIndex < 0 || !loc) return null;
	const spare = next.spares[spareIndex];
	const from = next.arenas[loc.ai];
	const item = from.items[loc.ii];
	from.items.splice(loc.ii, 1);
	const targetId = ARENA_META[spare.arena] ? spare.arena : from.id;
	getOrCreateArena(next.arenas, targetId).items.push({
		id: spare.id,
		speaker: spare.speaker,
		body: spare.body,
		url: spare.url,
		shortUrl: spare.shortUrl,
		publishedAt: spare.publishedAt
	});
	next.spares[spareIndex] = {
		...item,
		arena: from.id
	};
	next.arenas = sortArenas(next.arenas);
	return next;
}
function applyAdd(payload, spareId) {
	if (briefingItemCount(payload) >= 8) return null;
	const next = clonePayload(payload);
	const spareIndex = findSpareIndex(next.spares, spareId);
	if (spareIndex < 0) return null;
	const spare = next.spares[spareIndex];
	next.spares.splice(spareIndex, 1);
	const targetId = ARENA_META[spare.arena] ? spare.arena : "intl";
	getOrCreateArena(next.arenas, targetId).items.push({
		id: spare.id,
		speaker: spare.speaker,
		body: spare.body,
		url: spare.url,
		shortUrl: spare.shortUrl,
		publishedAt: spare.publishedAt
	});
	next.arenas = sortArenas(next.arenas);
	return next;
}
function ArenaFlags({ codes }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-flex items-center gap-1 text-[1.15rem] leading-none",
		"aria-hidden": true,
		children: codes.map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: FLAG_EMOJI[code] ?? "🌍" }, code))
	});
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
	return item.shortUrl || item.url;
}
function ItemBlock({ n, item }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "mb-7 text-right",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-pretty text-[1.05rem] leading-relaxed text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "ms-1 tabular-nums text-muted",
				children: [n, ". "]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lead, { item })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1.5 text-sm",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: linkHref(item),
				target: "_blank",
				rel: "noreferrer",
				className: "text-gold-deep underline decoration-line-strong underline-offset-4 hover:text-fg",
				dir: "ltr",
				children: linkHref(item)
			})
		})]
	});
}
function preview(item) {
	const raw = `${item.speaker ? `${item.speaker}: ` : ""}${item.body}`.replace(/\*\*/g, "");
	return raw.length > 72 ? `${raw.slice(0, 72)}…` : raw;
}
function BriefingDoc({ header, payload, onChange, onUsed, used, scanDueLabel }) {
	const [armed, setArmed] = (0, import_react.useState)(null);
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
		const next = applySwap(payload, spareId, itemId);
		if (!next) return;
		setArmed(null);
		onChange(next);
	}
	function add(spareId) {
		const next = applyAdd(payload, spareId);
		if (!next) return;
		onChange(next);
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
				"העדכון סומן. סריקה לעדכון הבא עד ",
				scanDueLabel ?? "בעוד כ־40 דק׳",
				" — הידיעות הנוכחיות נשארות על המסך; אפשר להחליף ולהוסיף מהספיירים."
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "rounded-lg bg-surface px-5 py-6 text-fg shadow-[0_14px_0_0_rgba(12,28,55,0.55),0_22px_40px_rgba(0,0,0,0.45)] sm:px-8 sm:py-8",
			children: numbered.map(({ arena, items }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "mb-4 flex items-center gap-2 text-lg font-semibold text-navy",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: arena.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArenaFlags, { codes: arena.flags })]
				}), items.map(({ n, item }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemBlock, {
					n,
					item
				}, item.id))]
			}, arena.id))
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
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1.5 text-sm",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
												href: linkHref(row),
												target: "_blank",
												rel: "noreferrer",
												className: "text-gold-deep underline underline-offset-4",
												dir: "ltr",
												children: linkHref(row)
											})
										}),
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
function item(id, speaker, body, url, shortUrl) {
	return {
		id,
		speaker,
		body,
		url,
		shortUrl,
		publishedAt: "2026-09-03T20:00:00+03:00"
	};
}
function spare(id, arena, speaker, body, url, shortUrl) {
	return {
		arena,
		...item(id, speaker, body, url, shortUrl)
	};
}
function arena(id, items) {
	return {
		id,
		title: ARENA_META[id].title,
		flags: ARENA_META[id].flags,
		items
	};
}
function sortArenasPayload(payload) {
	return {
		arenas: sortArenas(payload.arenas),
		spares: payload.spares
	};
}
var CURRENT_BRIEFING = sortArenasPayload({
	arenas: [
		arena("iran", [item("m1", "סגן הנשיא", "חודשים חשוכים לכלכלת ארה\"ב; ממליץ לאמריקנים **לאגור דלק**; מעבר ל**תגובה אסימטרית ורב־שכבתית**.", "https://en.irna.ir/news/86254222/", "https://tinyurl.com/2yzwn47m"), item("m2", "קאליבאף", "אם האויב רוצה שלא נייצא נפט מהמפרץ, **אף אחד לא יוכל לייצא**.", "https://www.reuters.com/world/middle-east/iran-urges-us-comply-with-interim-deal-after-trump-threatens-further-strikes-2026-09-01/", "https://tinyurl.com/2csg6u69")]),
		arena("gulf", [item("m3", "דווח ב-AP", "איראן שיגרה לעבר **כווית ובחריין**; כטב\"ם הצית **שריפה בכווית סיטי**.", "https://www.dallasnews.com/news/world/article/iran-fires-on-gulf-neighbors-despite-trump-s-22413839.php", "https://tinyurl.com/2ar7bsrt")]),
		arena("intl", [
			item("m4", "טראמפ", "מוכנים לגל תקיפות נוסף **בכל רגע**; השמדנו את **הציוד החדש בהורמוז**.", "https://www.the-independent.com/news/world/middle-east/iran-us-war-live-trump-strikes-oil-tankers-jordan-news-b3043187.html", "https://tinyurl.com/25czekw6"),
			item("m5", "דווח ב-Reuters", "ארה\"ב ואיראן החליפו את **המטח הגדול ביותר מאז יולי**.", "https://www.reuters.com/world/middle-east/us-iran-exchange-attacks-lull-war-appears-over-2026-09-02/", "https://tinyurl.com/25f4sq7m"),
			item("m6", "מזכיר האנרגיה", "**יותר מ-17 מיליון חביות** עברו בהורמוז ביום שני (1/9) — שיא מאז פרוץ המלחמה.", "https://www.cnbc.com/2026/09/02/energy-secretary-chris-wright-tells-cnbc-that-more-than-17-million-barrels-of-oil-transited-hormuz-on-monday.html", "https://tinyurl.com/223n2z8j")
		])
	],
	spares: [
		spare("s1", "intl", "", "מועצת הביטחון תצביע ב-**17 בספטמבר** על חידוש **פאנל הסנקציות** על איראן.", "https://www.reuters.com/world/china/un-faces-contentious-iran-nuclear-vote-ahead-general-assembly-2026-09-01/", "https://katzr.net/962280"),
		spare("s2", "region", "שי", "תושבי המזרח התיכון **אדוני עניינם**; מתנגדים ל**התערבות חיצונית**.", "https://www.aljazeera.com/news/2026/9/2/chinas-xi-urges-new-middle-east-security-framework-during-rare-egypt-visit", "https://katzr.net/7c7330"),
		spare("s3", "iran", "פזשכיאן", "אם ארה\"ב תחזור למזכר ההבנות, **נשיב מיד**.", "https://www.aljazeera.com/news/2026/9/1/iran-urges-us-to-honour-commitments-under-mou", "https://katzr.net/5eaa0f"),
		spare("s4", "intl", "טראמפ", "ה**מבצע** המחודש נגד איראן **לא יימשך יותר מדי**.", "https://www.reuters.com/world/us/trump-says-renewed-us-campaign-against-iran-wont-last-long-2026-09-02/", "https://katzr.net/a70ced"),
		spare("s5", "intl", "דווח ב-Reuters", "רק **שש אוניות** עברו בהורמוז אתמול, מתחת לממוצע.", "https://www.reuters.com/business/energy/oil-edges-down-investors-weigh-uncertainty-over-us-iran-strikes-2026-09-03/", "https://tinyurl.com/2d47k9sq"),
		spare("s6", "intl", "ה-CENTCOM", "השלמנו גל תקיפות על **יעדי משה\"מ** באיראן.", "https://www.centcom.mil/MEDIA/PUBLIC-RELEASES/Article/4588389/centcom-completes-strikes-on-irgc-targets-in-iran/", "https://tinyurl.com/23vsom2t"),
		spare("s7", "region", "דובר הנשיאות המצרית", "שי וא-סיסי קוראים ל**הסכם כולל לסיום המלחמה**.", "https://www.aljazeera.com/news/2026/9/2/chinas-xi-urges-new-middle-east-security-framework-during-rare-egypt-visit", "https://katzr.net/7c7330"),
		spare("s8", "intl", "דווח ב-Axios", "תוכנית CENTCOM: תקיפות מוגבלות בהורמוז כדי **למנוע שיקום מכ\"מים וטילים**.", "https://www.axios.com/2026/09/01/hormuz-centcom-strikes-trump-iran", "https://tinyurl.com/24cjetgd"),
		spare("s9", "intl", "", "איראן ממשיכה בחנק **מצר הורמוז** מול הסגר האמריקני על נמליה.", "https://english.aawsat.com/node/5314209", "https://tinyurl.com/2bsh3usm"),
		spare("s10", "intl", "דווח ב-Reuters", "שתי מכליות נפגעו מ**מוקשים בהורמוז** בליווי אמריקני.", "https://www.reuters.com/world/middle-east/us-iran-exchange-attacks-lull-war-appears-over-2026-09-02/", "https://tinyurl.com/25f4sq7m")
	]
});
var NEXT_BRIEFING = sortArenasPayload({
	arenas: [
		arena("iran", [item("n1", "פזשכיאן", "אם ארה\"ב תחזור למזכר ההבנות, **נשיב מיד**.", "https://www.aljazeera.com/news/2026/9/1/iran-urges-us-to-honour-commitments-under-mou", "https://katzr.net/5eaa0f")]),
		arena("region", [item("n2", "שי", "תושבי המזרח התיכון **אדוני עניינם**; מתנגדים ל**התערבות חיצונית**.", "https://www.aljazeera.com/news/2026/9/2/chinas-xi-urges-new-middle-east-security-framework-during-rare-egypt-visit", "https://katzr.net/7c7330")]),
		arena("intl", [
			item("n3", "ה-CENTCOM", "השלמנו גל תקיפות על **יעדי משה\"מ** באיראן.", "https://www.centcom.mil/MEDIA/PUBLIC-RELEASES/Article/4588389/centcom-completes-strikes-on-irgc-targets-in-iran/", "https://tinyurl.com/23vsom2t"),
			item("n4", "דווח ב-Axios", "תוכנית CENTCOM: תקיפות מוגבלות בהורמוז כדי **למנוע שיקום מכ\"מים וטילים**.", "https://www.axios.com/2026/09/01/hormuz-centcom-strikes-trump-iran", "https://tinyurl.com/24cjetgd"),
			item("n5", "", "מועצת הביטחון תצביע ב-**17 בספטמבר** על חידוש **פאנל הסנקציות** על איראן.", "https://www.reuters.com/world/china/un-faces-contentious-iran-nuclear-vote-ahead-general-assembly-2026-09-01/", "https://katzr.net/962280"),
			item("n6", "טראמפ", "ה**מבצע** המחודש נגד איראן **לא יימשך יותר מדי**.", "https://www.reuters.com/world/us/trump-says-renewed-us-campaign-against-iran-wont-last-long-2026-09-02/", "https://katzr.net/a70ced")
		])
	],
	spares: CURRENT_BRIEFING.spares.filter((row) => [
		"s5",
		"s7",
		"s9",
		"s10"
	].includes(row.id)).concat(CURRENT_BRIEFING.arenas.flatMap((a) => a.items.map((it) => ({
		...it,
		arena: a.id
	})))).slice(0, 10)
});
var TICKER = [
	{
		source: "סגן הנשיא",
		text: "חודשים חשוכים לכלכלת ארה\"ב; ממליץ לאגור דלק",
		url: "https://tinyurl.com/2yzwn47m"
	},
	{
		source: "טראמפ",
		text: "מוכנים לגל תקיפות נוסף בכל רגע; השמדנו ציוד בהורמוז",
		url: "https://tinyurl.com/25czekw6"
	},
	{
		source: "דווח ב-AP",
		text: "איראן שיגרה לעבר כווית ובחריין; שריפה בכווית סיטי",
		url: "https://tinyurl.com/2ar7bsrt"
	},
	{
		source: "דווח ב-Reuters",
		text: "המטח הגדול ביותר בין ארה\"ב לאיראן מאז יולי",
		url: "https://tinyurl.com/25f4sq7m"
	},
	{
		source: "מזכיר האנרגיה",
		text: "יותר מ-17 מיליון חביות עברו בהורמוז ביום שני",
		url: "https://tinyurl.com/223n2z8j"
	},
	{
		source: "קאליבאף",
		text: "אם לא נייצא נפט מהמפרץ — אף אחד לא יוכל לייצא",
		url: "https://tinyurl.com/2csg6u69"
	},
	{
		source: "שי",
		text: "תושבי המזרח התיכון אדוני עניינם",
		url: "https://katzr.net/7c7330"
	},
	{
		source: "ה-CENTCOM",
		text: "השלמנו גל תקיפות על יעדי משה\"מ",
		url: "https://tinyurl.com/23vsom2t"
	}
];
var BRIEFING_HEADER = "עדכון | 3 בספטמבר, 20:30";
var USED_KEY = "idkun-used-at-v3";
var PAYLOAD_KEY = "idkun-payload-v3";
var SCAN_MS = 24e5;
function lsGet(key) {
	try {
		if (typeof localStorage === "undefined") return null;
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}
function lsSet(key, value) {
	try {
		if (typeof localStorage === "undefined") return;
		localStorage.setItem(key, value);
	} catch {}
}
function lsDel(key) {
	try {
		if (typeof localStorage === "undefined") return;
		localStorage.removeItem(key);
	} catch {}
}
function loadUsedAt() {
	const raw = lsGet(USED_KEY);
	const n = raw ? Number(raw) : NaN;
	return Number.isFinite(n) ? n : null;
}
function markUsed() {
	lsSet(USED_KEY, String(Date.now()));
	lsDel(PAYLOAD_KEY);
}
function scanDueAt(usedAt) {
	return usedAt + SCAN_MS;
}
function isScanning(usedAt) {
	if (!usedAt) return false;
	return Date.now() < scanDueAt(usedAt);
}
function activePayload(usedAt) {
	if (usedAt && Date.now() >= scanDueAt(usedAt)) return structuredClone(NEXT_BRIEFING);
	const raw = lsGet(PAYLOAD_KEY);
	if (raw) try {
		return JSON.parse(raw);
	} catch {}
	return structuredClone(CURRENT_BRIEFING);
}
function persistPayload(payload) {
	lsSet(PAYLOAD_KEY, JSON.stringify(payload));
}
function formatDue(ts) {
	return new Intl.DateTimeFormat("he-IL", {
		timeZone: "Asia/Jerusalem",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false
	}).format(new Date(ts));
}
function Home() {
	const [usedAt, setUsedAt] = (0, import_react.useState)(null);
	const [payload, setPayload] = (0, import_react.useState)(null);
	const [tickKey, setTickKey] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const used = loadUsedAt();
		setUsedAt(used);
		setPayload(activePayload(used));
		const t = window.setInterval(() => {
			const nextUsed = loadUsedAt();
			setUsedAt(nextUsed);
			if (nextUsed && !isScanning(nextUsed)) setPayload(activePayload(nextUsed));
		}, 15e3);
		return () => window.clearInterval(t);
	}, []);
	const scanning = isScanning(usedAt);
	const due = usedAt ? formatDue(scanDueAt(usedAt)) : null;
	const live = payload;
	const ticker = (0, import_react.useMemo)(() => [...TICKER, ...TICKER], []);
	function onUsed() {
		markUsed();
		setUsedAt(Date.now());
	}
	function onChange(next) {
		setPayload(next);
		persistPayload(next);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-[linear-gradient(180deg,var(--color-bg)_0%,var(--color-bg-mid)_42%,var(--color-navy)_100%)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "sticky top-0 z-20 border-b border-gold/30 bg-bg/95 backdrop-blur",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-12 items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setTickKey((k) => k + 1),
					className: "inline-flex h-full shrink-0 items-center gap-2 border-e border-gold/30 bg-navy px-3 text-xs font-semibold text-fg-on-dark hover:bg-navy-2 sm:px-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" }), "רענון מבזקים"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-full min-w-0 flex-1 items-center overflow-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "ticker-track flex h-full w-max items-center gap-10 whitespace-nowrap px-4 text-sm text-fg-on-dark",
						children: ticker.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
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
			children: live ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BriefingDoc, {
				header: BRIEFING_HEADER,
				payload: live,
				onChange,
				onUsed,
				used: scanning,
				scanDueLabel: due
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center text-fg-on-dark",
				children: "טוען עדכון…"
			})
		})]
	});
}
//#endregion
export { Home as component };

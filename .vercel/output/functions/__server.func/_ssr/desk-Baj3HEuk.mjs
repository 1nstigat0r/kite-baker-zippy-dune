import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/desk-Baj3HEuk.js
var desk_Baj3HEuk_exports = /* @__PURE__ */ __exportAll({
	A: () => ensureItemIds,
	C: () => ARENA_ORDER,
	D: () => arenaPresentation,
	E: () => applySwap,
	M: () => sortArenas,
	N: () => types_exports,
	O: () => briefingHasContent,
	S: () => ARENA_META,
	T: () => applyAdd,
	_: () => hourKey,
	a: () => formatDue,
	b: () => parsePossiblyUtc,
	c: () => loadQueueAt,
	d: () => persistPayloadLocal,
	f: () => remainingOriginal,
	g: () => formatHeClock,
	h: () => dateLabelFromKey,
	i: () => TICKER,
	j: () => replaceNextOriginal,
	k: () => briefingItemCount,
	l: () => loadUsedAt,
	m: () => scanDueAt,
	n: () => CURRENT_BRIEFING,
	o: () => isScanning,
	p: () => saveQueueAt,
	r: () => SWAP_EVERY_MS,
	s: () => loadOriginalIds,
	t: () => BRIEFING_HEADER,
	u: () => markUsedLocal,
	v: () => hourLabelFromKey,
	w: () => FLAG_EMOJI,
	x: () => todayDateLabel,
	y: () => israelParts
});
var types_exports = /* @__PURE__ */ __exportAll$1({
	ARENA_META: () => ARENA_META,
	ARENA_ORDER: () => ARENA_ORDER,
	DESK_STYLE: () => 1,
	FLAG_EMOJI: () => FLAG_EMOJI,
	applyAdd: () => applyAdd,
	applySwap: () => applySwap,
	arenaPresentation: () => arenaPresentation,
	briefingHasContent: () => briefingHasContent,
	briefingItemCount: () => briefingItemCount,
	ensureItemIds: () => ensureItemIds,
	flagsForItems: () => flagsForItems,
	listItemIds: () => listItemIds,
	replaceNextOriginal: () => replaceNextOriginal,
	sortArenas: () => sortArenas
});
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
	us: "🇺🇸",
	globe: "🌐"
};
var FLAG_MARKS = [
	{
		code: "ir",
		re: /איראן|טהראן|פזשכיאן|קאליבאף|משה["״]מ|הורמוז/
	},
	{
		code: "lb",
		re: /לבנון|ביירות|חיזבאללה|עלי אלטאהר|דאחיה|בעלבק|הרמל/
	},
	{
		code: "sy",
		re: /סוריה|דמשק|אלשרע/
	},
	{
		code: "ye",
		re: /תימן|חות['׳]ים|צנעא|מצור תמורת מצור/
	},
	{
		code: "iq",
		re: /עיראק|בגדאד|אלגיוס העממי|עצאא['׳]ב|פלוגות|אלנוג['׳]בא|בדר/
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
		code: "jo",
		re: /ירדן/
	},
	{
		code: "tr",
		re: /תורכיה|אנקרה|ארדואן/
	},
	{
		code: "eg",
		re: /מצרים|קהיר|סיסי/
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
		desk: payload.desk,
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
function briefingHasContent(rec) {
	if (!rec) return false;
	return briefingItemCount(rec.payload) > 0;
}
function findSpareIndex(spares, id) {
	return spares.findIndex((row) => row.id === id || row.url === id);
}
function findItemLoc(arenas, id) {
	for (let ai = 0; ai < arenas.length; ai += 1) {
		const ii = arenas[ai].items.findIndex((row) => row.id === id || row.url === id);
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
function listItemIds(payload) {
	return payload.arenas.flatMap((arena) => arena.items.map((item) => item.id));
}
function replaceNextOriginal(payload, originalIds, incoming) {
	const next = clonePayload(payload);
	let loc = null;
	let replacedId = "";
	for (const id of originalIds) {
		loc = findItemLoc(next.arenas, id);
		if (loc) {
			replacedId = id;
			break;
		}
	}
	if (!loc) return null;
	const from = next.arenas[loc.ai];
	const old = from.items[loc.ii];
	from.items.splice(loc.ii, 1);
	const targetId = ARENA_META[incoming.arena] ? incoming.arena : from.id;
	getOrCreateArena(next.arenas, targetId).items.push({
		id: incoming.id,
		speaker: incoming.speaker,
		body: incoming.body,
		url: incoming.url,
		shortUrl: incoming.shortUrl,
		publishedAt: incoming.publishedAt
	});
	next.spares = [{
		...old,
		arena: from.id
	}, ...next.spares.filter((row) => row.id !== incoming.id)].slice(0, 10);
	next.arenas = sortArenas(next.arenas);
	return {
		payload: next,
		replacedId
	};
}
function ensureItemIds(payload) {
	let n = 0;
	const stamp = Date.now().toString(36);
	return {
		desk: payload.desk,
		arenas: payload.arenas.map((arena) => ({
			...arena,
			items: arena.items.map((item) => ({
				...item,
				id: item.id || `i-${stamp}-${n += 1}`
			}))
		})),
		spares: payload.spares.map((row) => ({
			...row,
			id: row.id || `s-${stamp}-${n += 1}`
		}))
	};
}
var TZ = "Asia/Jerusalem";
var MONTHS_HE = [
	"ינואר",
	"פברואר",
	"מרץ",
	"אפריל",
	"מאי",
	"יוני",
	"יולי",
	"אוגוסט",
	"ספטמבר",
	"אוקטובר",
	"נובמבר",
	"דצמבר"
];
function partsFor(date) {
	const parts = new Intl.DateTimeFormat("en-GB", {
		timeZone: TZ,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23"
	}).formatToParts(date);
	const get = (type) => parts.find((p) => p.type === type)?.value ?? "";
	return {
		year: get("year"),
		month: get("month"),
		day: get("day"),
		hour: get("hour"),
		minute: get("minute")
	};
}
function israelParts(date = /* @__PURE__ */ new Date()) {
	return partsFor(date);
}
function hourKey(date = /* @__PURE__ */ new Date()) {
	const p = partsFor(date);
	let hour = Number(p.hour);
	let min = Number(p.minute);
	if (min >= 45) {
		hour = (hour + 1) % 24;
		min = 0;
	} else if (min >= 15) min = 30;
	else min = 0;
	return `${p.year}-${p.month}-${p.day}T${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}
function hourLabelFromKey(key) {
	const m = key.match(/T(\d{2})(?::(\d{2}))?$/);
	if (!m) return key;
	return `${m[1]}:${m[2] ?? "00"}`;
}
function dateLabelFromKey(key) {
	return `${Number(key.slice(8, 10))} ב${MONTHS_HE[Number(key.slice(5, 7)) - 1]}`;
}
function formatHeClock(date) {
	const p = partsFor(date);
	return `${p.hour}:${p.minute}`;
}
function todayDateLabel(date = /* @__PURE__ */ new Date()) {
	const p = partsFor(date);
	return `${Number(p.day)} ב${MONTHS_HE[Number(p.month) - 1]}`;
}
function parsePossiblyUtc(value) {
	if (!value) return null;
	if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? null : d;
}
function item(id, speaker, body, url, shortUrl) {
	return {
		id,
		speaker,
		body,
		url,
		shortUrl,
		publishedAt: "2026-09-03T20:40:00+03:00"
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
/** Cold-start seed when ingest is empty — never invent URLs beyond this curated set. */
var CURRENT_BRIEFING = sortArenasPayload({
	arenas: [
		arena("lebanon", [item("m1", "גורמים ל-MTV", "חיזבאללה בלמו ניסיון התקדמות ישראלי לעבר **גבעות עלי אלטאהר** אחרי חצות.", "https://www.mtv.com.lb/en/News/Local/1732953/hezbollah-says-it-stopped-israeli-advance-at-ali-al-taher", "https://katzr.net/94b123")]),
		arena("gulf", [item("m2", "דווח ב-אלערבי אלגדיד", "**שלושה מבצעים נדירים** להוצאת גז מקטר ומאע\"מ מחוץ להורמוז, אחרי פגיעה בשתי אוניות.", "https://www.alaraby.co.uk/economy/%D9%86%D8%A7%D9%82%D9%84%D8%A7%D8%AA-%D8%AC%D8%B1%D9%8A%D8%AD%D8%A9-3-%D8%B9%D9%85%D9%84%D9%8A%D8%A7%D8%AA-%D9%86%D8%A7%D8%AF%D8%B1%D8%A9-%D9%84%D8%A5%D8%AE%D8%B1%D8%A7%D8%AC-%D8%BA%D8%A7%D8%B2-%D9%82%D8%B7%D8%B1-%D9%88%D8%A7%D9%84%D8%A5%D9%85%D8%A7%D8%B1%D8%A7%D8%AA-%D8%B9%D8%A8%D8%B1-%D9%87%D8%B1%D9%85%D8%B2", "https://katzr.net/c3ac4b"), item("m3", "דווח ב-FT", "ריאד מקדמת ביטוח ממשלתי לאוניות עד **186 מיליון דולר** לאירוע, כולל השתלטות או תקיפה.", "https://www.ft.com/content/fce79e4a-3979-4af9-b8e5-27aeb890e53b", "https://katzr.net/863429")]),
		arena("axis", [item("m4", "דווח ב-Arab News", "עיראק בוחנת **צינור דרך סוריה** כדי לעקוף את הורמוז.", "https://www.arabnews.com/middle-east/web-only-spotlight-can-iraq-bypass-hormuz-with-syria-oil-route-3000110", "https://katzr.net/a061b2")]),
		arena("iran", [item("m5", "האלחורה", "יותר מ-**30 העברות אונייה-לאונייה** של נפט איראני לעקיפת הסגר.", "https://alhurra.com/en/37210", "https://katzr.net/c5a738")]),
		arena("intl", [item("m6", "גורם צבאי אמריקני ל-Erem", "שלושה תרחישים אחרי המכה: תגובה מוגבלת; פגיעה באוניות או הנחת מוקשים; פגיעה בכוחות ארה\"ב או סגירת הורמוז — אז **מכה רחבה יותר**.", "https://www.eremnews.com/news/world/2yxhb1i", "https://katzr.net/863ab4")])
	],
	spares: []
});
CURRENT_BRIEFING.spares = [
	spare("s1", "gulf", "האלשרק", "קואליציה ימית רב-לאומית החלה לפעול ממפקדה בסעודיה; **39 מדינות** בישיבת התכנון.", "https://english.aawsat.com/gulf/5314000-multinational-maritime-defense-coalition-begins-operations-saudi-headquarters", "https://katzr.net/3ee24d"),
	spare("s2", "intl", "דווח ב-Erem", "טראמפ בוחן הכרזה על **סיום המלחמה**; במקביל משהח ניתק סניפי **בנק מצרים במאע\"מ** מהמערכת האמריקנית.", "https://www.eremnews.com/news/world/0fln8gi", "https://katzr.net/245318"),
	spare("s3", "gulf", "גורמים צבאיים אמריקניים ל-Erem", "וושינגטון עוברת ל**לחץ צבאי מתגלגל** אחרי תקיפת פלטפורמות מוקשים ב**לארק**.", "https://www.eremnews.com/news/world/97ioome", "https://katzr.net/e72bb0"),
	spare("s4", "gulf", "האלשרק", "ריאד גינתה פגיעה איראנית ב**מכלית סעודית** בהורמוז.", "https://english.aawsat.com/gulf/5313848-riyadh-condemns-iran-attack-saudi-vessel-hormuz", "https://katzr.net/2329da"),
	spare("s5", "intl", "גורם אמריקני ל-אלערביה", "תקיפות 1/9 נועדו **לסכל כוונה איראנית לפגוע בכבלים תת-ימיים** בהורמוז.", "https://www.iranintl.com/en/202609028802", "https://katzr.net/41ffd6"),
	spare("s6", "lebanon", "הסוכנות הלאומית", "**שלושה פיצוצים** בבני חיאן במרג' עיון.", "https://www.aljadeed.tv/news/%D9%85%D8%AD%D9%84%D9%8A%D8%A7%D8%AA/587669/%D8%A7%D9%84%D9%88%D9%83%D8%A7%D9%84%D8%A9-%D8%A7%D9%84%D9%88%D8%B7%D9%86%D9%8A%D8%A9-%D8%A7%D9%84%D8%AC%D9%8A%D8%B4-%D8%A7%D9%84%D8%A5%D8%B3%D8%B1%D8%A7%D8%A6%D9%8A%D9%84%D9%8A%D9%91-%D9%86%D9%81%D9%91%D8%B0-3-%D8%AA%D9%81%D8%AC%D9%8A%D8%B1%D8%A7%D8%AA-%D9%81%D9%8A-%D8%A8%D9%84%D8%AF%D8%A9-%D8%A8%D9%86%D9%8A-%D8%AD%D9%8A%D8%A7%D9%86-%D9%82%D8%B6%D8%A7%D8%A1", "https://katzr.net/0bcd15"),
	spare("s7", "lebanon", "מקור מדיני ל-האלשרק", "פינוי חיזבאללה מ**עלי אלטאהר** בראש סדר היום של **רומא-3**.", "https://aawsat.com/%D8%A7%D9%84%D8%B9%D8%A7%D9%84%D9%85-%D8%A7%D9%84%D8%B9%D8%B1%D8%A8%D9%8A/%D8%A7%D9%84%D9%85%D8%B4%D8%B1%D9%82-%D8%A7%D9%84%D8%B9%D8%B1%D8%A8%D9%8A/5306603", "https://katzr.net/268467"),
	spare("s8", "axis", "האלח'באר", "צנעא מעניקה ל**ווסת העומאני הזדמנות אחרונה** לפני סבב הסלמה; אחרי יותר מחודש של **«מצור תמורת מצור»**.", "https://www.al-akhbar.com/NewspaperArticles/arab/903195/", "https://katzr.net/841312"),
	spare("s9", "intl", "שני גורמים ל-Axios", "שליח הבית הלבן נועד בסרדיניה עם יועץ הביטחון של מאע\"מ על **הצעד הבא מול איראן**; הפגישה **לא פורסמה**.", "https://www.axios.com/2026/09/02/witkoff-uae-iran-war-trump-bessent", "https://katzr.net/573a02"),
	spare("s10", "iran", "שלושה גורמים איראניים ל-האלשרק", "הלחץ האמריקני נושך; טעינות נפט ירדו ל-**260 אלף חביות ליום**; הריאל מעל **2.2 מיליון** לדולר.", "https://english.aawsat.com/world/5314377-us-pressure-iran-starting-tell-sanctions-and-blockade-bite", "https://katzr.net/8f609b")
];
var TICKER = [
	{
		source: "גורמים ל-MTV",
		text: "חיזבאללה בלמו ניסיון התקדמות לעבר עלי אלטאהר",
		url: "https://katzr.net/94b123"
	},
	{
		source: "דווח ב-אלערבי אלגדיד",
		text: "שלושה מבצעים נדירים להוצאת גז מקטר ומאע\"מ מחוץ להורמוז",
		url: "https://katzr.net/c3ac4b"
	},
	{
		source: "דווח ב-Arab News",
		text: "עיראק בוחנת צינור דרך סוריה לעקיפת הורמוז",
		url: "https://katzr.net/a061b2"
	},
	{
		source: "גורם צבאי אמריקני ל-Erem",
		text: "שלושה תרחישים — עד מכה רחבה יותר",
		url: "https://katzr.net/863ab4"
	},
	{
		source: "האלחורה",
		text: "יותר מ-30 העברות אונייה-לאונייה של נפט איראני",
		url: "https://katzr.net/c5a738"
	},
	{
		source: "דווח ב-FT",
		text: "ריאד מקדמת ביטוח אוניות עד 186 מיליון דולר",
		url: "https://katzr.net/863429"
	}
];
function briefingHeaderNow() {
	return `עדכון | ${todayDateLabel()}, ${hourLabelFromKey(hourKey())}`;
}
var BRIEFING_HEADER = briefingHeaderNow();
var SWAP_EVERY_MS = 12e3;
var SCAN_MS = 24e5;
var USED_KEY = "idkun-used-at-v7";
var PAYLOAD_KEY = "idkun-payload-v7";
var ORIG_KEY = "idkun-orig-ids-v7";
var QUEUE_KEY = "idkun-queue-at-v7";
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
function loadUsedAt() {
	const raw = lsGet(USED_KEY);
	const n = raw ? Number(raw) : NaN;
	return Number.isFinite(n) ? n : null;
}
function loadOriginalIds() {
	try {
		const raw = lsGet(ORIG_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
function loadQueueAt() {
	const n = Number(lsGet(QUEUE_KEY) ?? "0");
	return Number.isFinite(n) && n >= 0 ? n : 0;
}
function saveQueueAt(n) {
	lsSet(QUEUE_KEY, String(n));
}
function markUsedLocal(payload) {
	lsSet(USED_KEY, String(Date.now()));
	lsSet(ORIG_KEY, JSON.stringify(listItemIds(payload)));
	lsSet(QUEUE_KEY, "0");
}
function scanDueAt(usedAt) {
	return usedAt + SCAN_MS;
}
function isScanning(usedAt) {
	if (!usedAt) return false;
	return Date.now() < scanDueAt(usedAt);
}
function persistPayloadLocal(payload) {
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
function remainingOriginal(payload, originalIds) {
	const live = new Set(listItemIds(payload));
	return originalIds.filter((id) => live.has(id));
}
//#endregion
export { saveQueueAt as A, loadQueueAt as C, persistPayloadLocal as D, parsePossiblyUtc as E, sortArenas as M, todayDateLabel as N, remainingOriginal as O, loadOriginalIds as S, markUsedLocal as T, formatHeClock as _, FLAG_EMOJI as a, isScanning as b, applyAdd as c, briefingHasContent as d, briefingItemCount as f, formatDue as g, ensureItemIds as h, CURRENT_BRIEFING as i, scanDueAt as j, replaceNextOriginal as k, applySwap as l, desk_Baj3HEuk_exports as m, ARENA_ORDER as n, SWAP_EVERY_MS as o, dateLabelFromKey as p, BRIEFING_HEADER as r, TICKER as s, ARENA_META as t, arenaPresentation as u, hourKey as v, loadUsedAt as w, israelParts as x, hourLabelFromKey as y };

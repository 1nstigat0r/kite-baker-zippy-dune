import { E as parsePossiblyUtc, M as sortArenas, N as todayDateLabel, _ as formatHeClock, c as applyAdd, d as briefingHasContent, h as ensureItemIds, i as CURRENT_BRIEFING, l as applySwap, n as ARENA_ORDER, p as dateLabelFromKey, t as ARENA_META, v as hourKey, x as israelParts, y as hourLabelFromKey } from "./desk-Baj3HEuk.mjs";
import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { createHash } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/server-CQOUJt33.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var HEBREW_RE = /[\u0590-\u05FF]/;
var MEDIA_IL_RE = /אבו עלי|כאן 11|דסק ערבים|ynet|עמית סגל|יחזקאלי|jpost|jerusalempost|timesofisrael|israelhayom|mako\.|walla\.|n12|kan11|inn\.co/i;
var JUNK_RE = /הורוסקופ|מזג אוויר|שידור חי|הגרל[הת]|כדורגל|premier league|la liga|nba\b|netflix|follow us|subscribe|click here|לחצו כאן|לערוץ הטלגרם|מה מזג|תוצאות הגרלה|reality tv/i;
var DESK_RE = /איראן|טהראן|משה["״]מ|חסד["״]ם|חיזבאללה|חות['׳]?ים|הורמוז|תקיפ|טיל|מלחמ|סנקצי|גרעין|חימוש|צה["״]ל|כטב["״]מ|כטמ["״]ם|פיצוץ|הפצצ|רקט|drone|missile|strike|nuclear|sanctions|hormuz|hezbollah|houthi|irgc|centcom|\biran\b|lebanon|syria|yemen|gaza|hamas|netanyahu|khamenei|trump|rubio|israel|עזה|חמאס|סוריה|לבנון|תימן|עיראק|נתניהו|טראמפ|רוביו|קאליבאף|פזשכיאן|חמאנאי|חמינאי|נסראללה|ארדואן|סיסי|בן סלמאן|משמרות המהפכה|פיקוד המרכז|שביתת נשק|הפסקת אש|דיפלומט/i;
var REGION_RE = /איראן|לבנון|סוריה|תימן|עיראק|סעודי|אמירויות|קטר|כווית|בחריין|עומאן|תורכיה|טורקיה|מצרים|ירדן|עזה|חמאס|ישראל|הורמוז|מפרץ|מזרח התיכון|\biran\b|lebanon|syria|yemen|iraq|saudi|uae|qatar|kuwait|bahrain|oman|turkey|egypt|jordan|gaza|israel|hormuz|middle east|palestine|palestinian|إيران|لبنان|سوريا|اليمن|العراق|السعود|تركيا|مصر|الأردن|غزة/i;
var GULF_GEO_RE = /סעודי|ריאד|אמירויות|אבו דאבי|דובאי|קטר|דוחה|כווית|בחריין|עומאן|מפרצי|\bgcc\b|saudi|riyadh|uae|abu dhabi|dubai|qatar|doha|kuwait|bahrain|oman|mbs|mbz|السعود|الإمارات|قطر|الكويت|البحرين|عُمان|عمان/i;
var GULF_POL_RE = /מלך|יורש|נסיך|אמיר|שר |נשיא|שגריר|דיפלומט|הסכם|ברית|פסגה|מועצה|חימוש|תקיפה|צבא|חיל|נורמליזציה|חמאס|איראן|חות|תימן|ישראל|minister|king|prince|emir|mbs|mbz|diplomatic|\bgcc\b|defense|defence|foreign|bin salman|bin zayed|tamim|נורמליז|חיזבאללה/i;
var IRAN_RE = /איראן|טהראן|ח['׳]?אמנאי|חמינאי|חמאנאי|פזשכיאן|קאליבאף|חסד["״]ם|משמרות המהפכה|משה["״]מ|הורמוז|נתנז|פורדו|אספהאן|\biran\b|tehran|khamenei|pezeshkian|qalibaf|ghalibaf|irgc|hormuz|natanz|fordow|islamic republic|إيران|طهران/i;
var LEBANON_RE = /לבנון|ביירות|חיזבאללה|דאחי[יה]|נסראללה|נעים קאסם|\blebanon\b|beirut|hezbollah|nasrallah|dahieh|لبنان|حزب الله|بيروت/i;
var SYRIA_RE = /סוריה|דמשק|גולן|קוניטרה|סוידא|חלב|א-שאם|\bsyria\b|damascus|golan|aleppo|sweida|سوريا|دمشق/i;
var AXIS_RE = /תימן|חות['׳]?ים|אנצאר אללה|צנעא|אלמסירה|עיראק|בגדאד|חשד|כתאיב|עצאיב|המסגרת|\byemen\b|houthi|ansarollah|sana['’]?a|\biraq\b|baghdad|\bpmf\b|hashd|kataib|asaib|الحوث|اليمن|العراق|الحشد/i;
var TURKEY_RE = /תורכיה|טורקיה|אנקרה|ארדואן|איסטנבול|\bturkey\b|turkish|ankara|erdogan|istanbul|تركيا|أردوغان/i;
var REGION_ARENA_RE = /מצרים|קהיר|סיסי|ירדן|עמאן|עבאס|רמאללה|עזה|חמאס|ג['׳]נין|יהודה ושומרון|יו["״]ש|נתניהו|צה["״]ל|ישראל|\begypt\b|cairo|sisi|jordan|amman|gaza|hamas|israel|netanyahu|\bidf\b|مصر|الأردن|غزة|حماس|إسرائيل/i;
var FLAG_HINTS = [
	{
		re: /איראן|טהראן|איראני|\biran\b|tehran|irgc|חסד["״]ם/i,
		code: "ir"
	},
	{
		re: /לבנון|ביירות|חיזבאללה|\blebanon\b|beirut|hezbollah/i,
		code: "lb"
	},
	{
		re: /סוריה|דמשק|\bsyria\b|damascus/i,
		code: "sy"
	},
	{
		re: /תימן|חות['׳]?ים|אנצאר אללה|\byemen\b|houthi/i,
		code: "ye"
	},
	{
		re: /עיראק|בגדאד|חשד|\biraq\b|baghdad/i,
		code: "iq"
	},
	{
		re: /סעודי|ריאד|saudi|mbs|bin salman/i,
		code: "sa"
	},
	{
		re: /אמירויות|אבו דאבי|דובאי|\buae\b|abu dhabi/i,
		code: "ae"
	},
	{
		re: /תורכיה|טורקיה|אנקרה|ארדואן|\bturkey\b|erdogan|ankara/i,
		code: "tr"
	},
	{
		re: /ירדן|עמאן|\bjordan\b|amman/i,
		code: "jo"
	},
	{
		re: /מצרים|קהיר|סיסי|\begypt\b|cairo|sisi/i,
		code: "eg"
	},
	{
		re: /ארה["״]ב|אמריק|וושינגטון|טראמפ|רוביו|united states|\bus\b|trump|rubio|washington/i,
		code: "us"
	},
	{
		re: /פקיסטן|pakistan/i,
		code: "pk"
	},
	{
		re: /הודו|\bindia\b/i,
		code: "in"
	},
	{
		re: /יוון|\bgreece\b/i,
		code: "gr"
	},
	{
		re: /כווית|kuwait/i,
		code: "kw"
	},
	{
		re: /קטר|qatar/i,
		code: "qa"
	},
	{
		re: /בחריין|bahrain/i,
		code: "bh"
	},
	{
		re: /עומאן|\boman\b/i,
		code: "om"
	},
	{
		re: /סין|בייג['׳]ין|\bchina\b|beijing|xi jinping|שי ג['׳]ינפינג/i,
		code: "cn"
	},
	{
		re: /רוסיה|מוסקבה|פוטין|\brussia\b|moscow|putin/i,
		code: "ru"
	},
	{
		re: /צרפת|פריז|macron|\bfrance\b/i,
		code: "fr"
	},
	{
		re: /בריטניה|לונדון|\bbritain\b|\buk\b|london/i,
		code: "gb"
	},
	{
		re: /ישראל|ירושלים|צה["״]ל|נתניהו|\bisrael\b|\bidf\b|netanyahu/i,
		code: "il"
	},
	{
		re: /פלסטין|עזה|חמאס|רמאללה|\bgaza\b|hamas|palestinian/i,
		code: "ps"
	}
];
var OUTLET_ALIASES = {
	reuters: "רויטרס",
	"the new york times": "ה-NYT",
	nyt: "ה-NYT",
	"new york times": "ה-NYT",
	guardian: "ה-Guardian",
	"the guardian": "ה-Guardian",
	axios: "ה-Axios",
	"financial times": "ה-FT",
	ft: "ה-FT",
	economist: "אקונומיסט",
	"the economist": "אקונומיסט",
	"al jazeera": "אלג'זירה",
	aljazeera: "אלג'זירה",
	"france 24": "פראנס 24",
	france24: "פראנס 24",
	"sky news": "סקיי ניוז",
	"fox news": "פוקס",
	fox: "פוקס",
	bbc: "BBC",
	ap: "AP",
	afp: "AFP",
	"associated press": "AP",
	"middle east eye": "MEE",
	mee: "MEE",
	"the cradle": "The Cradle",
	"iran international": "איראן אינטרנשיונל",
	presstv: "פרס TV",
	"press tv": "פרס TV",
	tasnim: "תסנים",
	irna: "אירנא",
	fars: "פארס",
	mehr: "מהר",
	"tehran times": "טהראן טיימס",
	"daily sabah": "Daily Sabah",
	"the national": "The National"
};
var SPEAKER_ALIASES = [
	[/donald trump|president trump|^trump$/i, "טראמפ"],
	[/טראמפ/i, "טראמפ"],
	[/marco rubio|secretary rubio|^rubio$/i, "רוביו"],
	[/רוביו/i, "רוביו"],
	[/benjamin netanyahu|bibi netanyahu|^netanyahu$/i, "נתניהו"],
	[/xi jinping|^xi$/i, "שי"],
	[/masoud pezeshkian|pezeshkian/i, "פזשכיאן"],
	[/mohammad bagher qalibaf|qalibaf|ghalibaf/i, "קאליבאף"],
	[/ali khamenei|ayatollah khamenei|khamenei/i, "חמינאי"],
	[/hassan nasrallah|nasrallah/i, "נסראללה"],
	[/recep tayyip erdogan|erdogan|erdoğan/i, "ארדואן"],
	[/abdel fattah el-sisi|el-sisi|^sisi$/i, "סיסי"],
	[/defense minister|שר הביטחון/i, "שר הביטחון"],
	[/secretary of the treasury|מזכיר האוצר/i, "מזכיר האוצר"],
	[/secretary of state|מזכיר המדינה/i, "מזכיר המדינה"]
];
var STOP = /* @__PURE__ */ new Set([
	"the",
	"and",
	"for",
	"with",
	"from",
	"that",
	"this",
	"are",
	"was",
	"were",
	"after",
	"into",
	"over",
	"more",
	"than",
	"been",
	"have",
	"has",
	"will",
	"not",
	"its",
	"his",
	"her",
	"על",
	"את",
	"של",
	"עם",
	"אל",
	"לא",
	"אם",
	"או",
	"כי",
	"גם",
	"רק",
	"כל",
	"בין",
	"אין",
	"יש",
	"זה",
	"זו",
	"הוא",
	"היא",
	"הם",
	"after"
]);
function collapse(s) {
	return (s ?? "").replace(/\s+/g, " ").trim();
}
function decodeEntities(s) {
	return s.replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, "\"").replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&#x([0-9a-f]+);/gi, (_, n) => {
		const code = Number.parseInt(n, 16);
		return Number.isFinite(code) ? String.fromCharCode(code) : "";
	}).replace(/&#(\d+);/g, (_, n) => {
		const code = Number(n);
		return Number.isFinite(code) ? String.fromCharCode(code) : "";
	});
}
function blobOf(item) {
	return `${item.speaker ?? ""} ${item.body ?? ""} ${item.title ?? ""} ${item.url ?? ""}`;
}
function clip(text, max) {
	const s = collapse(text);
	if (s.length <= max) return s;
	return `${s.slice(0, Math.max(1, max - 1)).trimEnd()}…`;
}
function isIsraeliVoice(speaker, body, url = "") {
	const t = `${speaker} ${body} ${url}`;
	if (/אבו עלי|כאן 11|דסק ערבים|ynet|עמית סגל|יחזקאלי|jpost|jerusalempost|timesofisrael|israelhayom|mako\.|walla\.|n12|kan11|inn\.co/i.test(t)) return true;
	if (/^(נתניהו|שר הביטחון|משהב["״]ט|צה["״]ל|הלוי|זמיר|קץ|כץ|לשכת רמ["״]מ)$/.test(speaker.trim())) return true;
	if (/נתניהו|שר הביטחון|לשכת רמ["״]מ|צה["״]ל הנחה|גורמים ישראליים/.test(body) && !/עלי אלטאהר|תקיפ(?:ה|ות) ישראלית/.test(body)) return true;
	return false;
}
function hasHebrew(text) {
	return HEBREW_RE.test(text ?? "");
}
function stripHtml(html) {
	return decodeEntities((html ?? "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/(?:p|div|h\d|li|tr|blockquote)>/gi, "\n").replace(/<[^>]+>/g, "")).replace(/\u00a0/g, " ").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
function firstLine(text, max = 220) {
	const cleaned = stripHtml(text ?? "");
	return clip(cleaned.split(/\n+/).map((row) => collapse(row)).find((row) => row.length > 0) ?? collapse(cleaned), max);
}
function toDeskHebrew(text) {
	let s = stripHtml(text ?? "");
	for (const [re, to] of [
		[/\bIslamic Republic of Iran\b/gi, "משה\"מ"],
		[/\bthe Iranian regime\b/gi, "משה\"מ"],
		[/\bIranian regime\b/gi, "משה\"מ"],
		[/המשטר האיראני/g, "משה\"מ"],
		[/\bUnited States(?: of America)?\b/g, "ארה\"ב"],
		[/\bU\.S\.A\.?\b/g, "ארה\"ב"],
		[/\bU\.S\.\b/g, "ארה\"ב"],
		[/\bUSA\b/g, "ארה\"ב"],
		[/ארצות הברית/g, "ארה\"ב"],
		[/\bIsraeli Air Force\b/gi, "חה\"א"],
		[/\bU\.?S\.? Air Force\b/gi, "חה\"א"],
		[/\bthe IAF\b/gi, "חה\"א"],
		[/\bIAF\b/g, "חה\"א"],
		[/חיל האוויר האמריק(?:ני|אי)/g, "חה\"א"],
		[/חיל האוויר הישראלי/g, "חה\"א"],
		[/\bZionist (?:entity|regime)\b/gi, "ישראל"],
		[/הישות הציונית/g, "ישראל"],
		[/\boccupied (?:Palestinian )?territories\b/gi, "יו\"ש"],
		[/\bWest Bank\b/gi, "יו\"ש"],
		[/\bRevolutionary Guards?\b/gi, "חסד\"ם"],
		[/\bIRGC\b/g, "חסד\"ם"],
		[/\bHezbollah\b/gi, "חיזבאללה"],
		[/\bHouthis?\b/gi, "החות'ים"],
		[/\bStrait of Hormuz\b/gi, "הורמוז"],
		[/\bHormuz\b/gi, "הורמוז"],
		[/\bmartyrs?\b/gi, "הרוגים"],
		[/\bNetanyahu\b/gi, "נתניהו"],
		[/\bKhamenei\b/gi, "חמינאי"],
		[/\bTrump\b/g, "טראמפ"],
		[/\bRubio\b/g, "רוביו"],
		[/\bPezeshkian\b/gi, "פזשכיאן"],
		[/\bQalibaf\b/gi, "קאליבאף"],
		[/\bGhalibaf\b/gi, "קאליבאף"],
		[/\bNasrallah\b/gi, "נסראללה"],
		[/\bErdogan\b/gi, "ארדואן"],
		[/\bErdoğan\b/gi, "ארדואן"],
		[/\bGaza Strip\b/gi, "עזה"],
		[/\bGaza\b/g, "עזה"],
		[/\bHamas\b/g, "חמאס"],
		[/\bIsrael\b/g, "ישראל"],
		[/\bIDF\b/g, "צה\"ל"],
		[/\bLebanon\b/g, "לבנון"],
		[/\bSyria\b/g, "סוריה"],
		[/\bYemen\b/g, "תימן"],
		[/\bIraq\b/g, "עיראק"],
		[/\bIran\b/g, "איראן"],
		[/\bTurkey\b/g, "תורכיה"],
		[/\bEgypt\b/g, "מצרים"],
		[/\bJordan\b/g, "ירדן"],
		[/\bSaudi Arabia\b/gi, "סעודיה"],
		[/\bthe UAE\b/gi, "איחוד האמירויות"],
		[/\bUAE\b/g, "איחוד האמירויות"]
	]) s = s.replace(re, to);
	return collapse(s);
}
function deskHeadline(text) {
	return collapse(toDeskHebrew(text ?? "").replace(/\*\*/g, "").replace(/^\s*\d+[\.\)\-]\s*/, "").replace(/^["«»״]+|["«»״]+$/g, ""));
}
function formatOutlet(source) {
	let name = collapse(source ?? "").replace(/\/\s*טלגרם/g, "").replace(/\/\s*telegram/gi, "");
	const key = name.toLowerCase().replace(/^the\s+/, "");
	if (OUTLET_ALIASES[key]) return OUTLET_ALIASES[key];
	if (OUTLET_ALIASES[name.toLowerCase()]) return OUTLET_ALIASES[name.toLowerCase()];
	return name;
}
function shortenSpeaker(name) {
	let s = collapse(toDeskHebrew(name ?? "")).replace(/\/\s*טלגרם/g, "");
	if (!s) return "";
	for (const [re, alias] of SPEAKER_ALIASES) if (re.test(s)) return alias;
	s = s.replace(/^(?:נשיא|ראש הממשלה|רה["״]מ|איתוללה|ד״ר|ד"ר|פרופ['׳])\s+/u, "").replace(/^(?:president|pm|prime minister|ayatollah|dr\.?|secretary)\s+/i, "");
	s = collapse(s);
	if (s.length > 28) s = clip(s, 28).replace(/…$/, "");
	return s;
}
function fingerprint(url, text) {
	const s = `${url ?? ""}|${collapse(text ?? "")}`;
	let h1 = 2166136261;
	let h2 = 5381;
	for (let i = 0; i < s.length; i += 1) {
		const c = s.charCodeAt(i);
		h1 ^= c;
		h1 = Math.imul(h1, 16777619);
		h2 = h2 * 33 ^ c;
	}
	const a = (h1 >>> 0).toString(16).padStart(8, "0");
	const b = (h2 >>> 0).toString(16).padStart(8, "0");
	let h3 = 0;
	for (let i = s.length - 1; i >= 0; i -= 1) h3 = h3 * 31 + s.charCodeAt(i) >>> 0;
	return `${a}${b}${h3.toString(16).padStart(8, "0")}`.slice(0, 24);
}
function classifyArena(text) {
	const t = text ?? "";
	if (IRAN_RE.test(t)) return "iran";
	const leb = LEBANON_RE.test(t);
	const syr = SYRIA_RE.test(t);
	if (leb && !syr) return "lebanon";
	if (syr) return "north";
	if (leb) return "lebanon";
	if (AXIS_RE.test(t)) return "axis";
	if (GULF_GEO_RE.test(t)) return "gulf";
	if (TURKEY_RE.test(t)) return "turkey";
	if (REGION_ARENA_RE.test(t)) return "region";
	return null;
}
function isRegional(text) {
	return REGION_RE.test(text ?? "");
}
function isDeskStory(text) {
	const t = text ?? "";
	if (JUNK_RE.test(t)) return false;
	if (DESK_RE.test(t)) return true;
	const arena = classifyArena(t);
	return arena === "iran" || arena === "lebanon" || arena === "north" || arena === "axis";
}
function isGulfPolitics(text) {
	const t = text ?? "";
	if (!GULF_GEO_RE.test(t)) return false;
	if (JUNK_RE.test(t)) return false;
	if (/(oil price|brent|wti|תעריף הנפט|מחיר הנפט)/i.test(t) && !GULF_POL_RE.test(t)) return false;
	return GULF_POL_RE.test(t) || /(בן סלמאן|בן זאיד|תמים|אל־סעוד|آل سعود)/.test(t);
}
function isJunkItem(speaker, body, url = "") {
	const bd = collapse(body ?? "");
	if (bd.length < 8) return true;
	const t = `${speaker ?? ""} ${bd} ${url ?? ""}`;
	if (JUNK_RE.test(t)) return true;
	if (MEDIA_IL_RE.test(t) && !/נתניהו|שר הביטחון|צה["״]ל|לשכת רמ["״]מ/.test(bd)) return true;
	if (/^\s*https?:\/\//i.test(bd)) return true;
	if (/2026-\d{2}-\d{2}T/.test(bd) && bd.length < 48) return true;
	if (!hasHebrew(bd) && bd.length < 24) return true;
	return false;
}
function eventTokens(s) {
	const key = s.replace(/\*\*/g, "").replace(/איראן|לבנון|זירה צפונית|הציר|המפרציות|תורכיה|באזור|בינ["״]ל/g, " ").replace(/[|:：,.;!?()[\]{}"«»״]/g, " ").toLowerCase();
	const out = /* @__PURE__ */ new Set();
	for (const w of key.split(/\s+/)) {
		if (w.length < 3 || STOP.has(w)) continue;
		out.add(w);
	}
	return out;
}
function sameEvent(a, b) {
	const na = collapse(a ?? "");
	const nb = collapse(b ?? "");
	if (!na || !nb) return false;
	if (na === nb) return true;
	const la = na.toLowerCase();
	const lb = nb.toLowerCase();
	if (la.length > 24 && lb.length > 24 && (la.includes(lb) || lb.includes(la))) return true;
	const ta = eventTokens(na);
	const tb = eventTokens(nb);
	if (ta.size === 0 || tb.size === 0) return false;
	let inter = 0;
	for (const tok of ta) if (tb.has(tok)) inter += 1;
	const union = ta.size + tb.size - inter;
	const jaccard = inter / union;
	const overlap = inter / Math.min(ta.size, tb.size);
	return jaccard >= .42 || overlap >= .72 && inter >= 3;
}
function shapeCopy(speaker, body, url = "") {
	let sp = shortenSpeaker(speaker ?? "");
	let bd = toDeskHebrew(body ?? "");
	bd = bd.replace(/\s*20\d{2}-\d{2}-\d{2}T[\d:.Z+-]+/g, "").trim();
	bd = bd.replace(/^\s*(?:BREAKING|عاجل|דחוף|عاجل جدا|מבזק)\s*[:\-–]\s*/i, "");
	if (sp) {
		const escaped = sp.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		bd = bd.replace(new RegExp(`^${escaped}\\s*[:：]\\s*`), "");
	}
	bd = collapse(bd).replace(/^["«»״]+|["«»״]+$/g, "").trim();
	if (sp && MEDIA_IL_RE.test(sp)) sp = "";
	if (isIsraeliVoice(sp, bd, url) && MEDIA_IL_RE.test(`${sp} ${url}`)) {
		if (!/^(נתניהו|שר הביטחון|משהב["״]ט|צה["״]ל|הלוי|זמיר|קץ|כץ|לשכת רמ["״]מ)$/.test(sp)) sp = "";
	}
	return {
		speaker: sp,
		body: bd
	};
}
function flagsForItems(items = []) {
	const blob = items.map(blobOf).join(" ");
	const found = [];
	for (const { re, code } of FLAG_HINTS) if (re.test(blob) && !found.includes(code)) found.push(code);
	return found;
}
function arenaPresentation(id, items = []) {
	const meta = ARENA_META[id] ?? ARENA_META.intl;
	if (id === "intl") return {
		title: meta.title,
		flags: ["globe"]
	};
	const found = flagsForItems(items);
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
	if (found.length === 1 && names[found[0]]) return {
		title: names[found[0]],
		flags: found
	};
	if (found.length) return {
		title: meta.title,
		flags: found.slice(0, 4)
	};
	return {
		title: meta.title,
		flags: [...meta.flags]
	};
}
function decorateArenas$1(payload) {
	return {
		desk: payload.desk,
		arenas: sortArenas(payload.arenas.filter((arena) => ARENA_META[arena.id] && arena.items.length > 0).map((arena) => {
			const pres = arenaPresentation(arena.id, arena.items);
			return {
				...arena,
				id: arena.id,
				title: pres.title,
				flags: pres.flags,
				items: arena.items
			};
		})),
		spares: (payload.spares ?? []).slice(0, 10)
	};
}
function itemText(row) {
	return `${row.speaker} ${row.body}`;
}
function makeId(prefix, url) {
	return `${prefix}-${fingerprint(url, url).slice(0, 12)}`;
}
function mkItem(speaker, body, url, publishedAt) {
	const shaped = shapeCopy(speaker, body, url);
	return {
		id: makeId("i", url),
		speaker: shaped.speaker,
		body: shaped.body,
		url,
		publishedAt: publishedAt || (/* @__PURE__ */ new Date()).toISOString()
	};
}
function prunePayload(payload, previous) {
	const covered = [...previous];
	const arenas = [];
	for (const arena of payload.arenas) {
		const items = [];
		for (const row of arena.items) {
			const t = itemText(row);
			if (covered.some((p) => sameEvent(p, t))) continue;
			items.push(row);
			covered.push(t);
		}
		if (items.length) arenas.push({
			...arena,
			items
		});
	}
	const spares = [];
	for (const spare of payload.spares ?? []) {
		if (spares.length >= 10) break;
		const t = itemText(spare);
		if (covered.some((p) => sameEvent(p, t))) continue;
		spares.push(spare);
		covered.push(t);
	}
	return ensureItemIds({
		...payload,
		arenas,
		spares,
		desk: 1
	});
}
function seedPayload() {
	return ensureItemIds(structuredClone(CURRENT_BRIEFING));
}
function interestScore(text, publishedAt) {
	let s = 0;
	if (/גורמים ל-|בלעדי|מסר(?:ו)? ל|דווח ב-/.test(text)) s += 6;
	if (/משה["״]מ|הורמוז|חיזבאללה|חות|קאליבאף|טראמפ|עלי אלטאהר|תקיפ|טיל/.test(text)) s += 4;
	if (/איראן|לבנון|תימן|עיראק|כווית|סעודי|סוריה/.test(text)) s += 2;
	if (publishedAt) {
		const tms = Date.parse(publishedAt);
		if (Number.isFinite(tms)) s += Math.max(0, 5 - (Date.now() - tms) / 36e5);
	}
	return s;
}
function storyToItem(story) {
	const outlet = formatOutlet(story.source);
	const heTitle = toDeskHebrew(story.title);
	const bodyBase = hasHebrew(heTitle) ? heTitle : deskHeadline(story.title);
	if (!bodyBase || bodyBase.length < 12) return null;
	const cleaned = shapeCopy(shortenSpeaker(hasHebrew(bodyBase) ? `דווח ב-${outlet || story.source}` : `דווח ב-${outlet || story.source}`), bodyBase.replace(/\s*20\d{2}-\d{2}-\d{2}T[\d:.Z+-]+/g, "").trim(), story.url);
	if (!cleaned.body || isJunkItem(cleaned.speaker, cleaned.body, story.url)) return null;
	if (!hasHebrew(cleaned.body) && cleaned.body.length < 40) return null;
	if (!hasHebrew(cleaned.body)) cleaned.speaker = cleaned.speaker || `דווח ב-${outlet || story.source}`;
	if (/אבו עלי|כאן 11|דסק ערבים|ynet|עמית סגל|יחזקאלי/i.test(story.source)) return null;
	return mkItem(cleaned.speaker || `דווח ב-${outlet || story.source}`, cleaned.body, story.url, story.publishedAt);
}
function fromStories(stories, seen, previous) {
	const ranked = [...stories].sort((a, b) => interestScore(`${b.title} ${b.source}`, b.publishedAt) - interestScore(`${a.title} ${a.source}`, a.publishedAt));
	const arenas = /* @__PURE__ */ new Map();
	const spares = [];
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
		let arenaId = story.arena ?? classifyArena(`${row.speaker} ${row.body}`) ?? "intl";
		if (!ARENA_META[arenaId]) arenaId = "intl";
		if (arenaId === "gulf" && !isGulfPolitics(text)) arenaId = "intl";
		if ([...arenas.values()].reduce((s, a) => s + a.length, 0) < 6) {
			const list = arenas.get(arenaId) ?? [];
			list.push(row);
			arenas.set(arenaId, list);
		} else if (spares.length < 10) spares.push({
			...row,
			id: makeId("s", row.url),
			arena: arenaId
		});
	}
	const orderedArenas = ARENA_ORDER.filter((id) => arenas.get(id)?.length).map((id) => {
		const items = (arenas.get(id) ?? []).sort((a, b) => interestScore(itemText(b), b.publishedAt) - interestScore(itemText(a), a.publishedAt));
		return {
			id,
			title: ARENA_META[id].title,
			flags: ARENA_META[id].flags,
			items
		};
	});
	return ensureItemIds({
		desk: 1,
		arenas: orderedArenas,
		spares
	});
}
function mergeUnique(primary, extra, previous) {
	const base = prunePayload(primary, previous);
	const more = prunePayload(extra, [
		...previous,
		...base.arenas.flatMap((a) => a.items.map(itemText)),
		...base.spares.map(itemText)
	]);
	const byId = new Map(base.arenas.map((a) => [a.id, {
		...a,
		items: [...a.items]
	}]));
	for (const arena of more.arenas) {
		const existing = byId.get(arena.id);
		if (existing) existing.items.push(...arena.items);
		else byId.set(arena.id, {
			...arena,
			items: [...arena.items]
		});
	}
	return ensureItemIds({
		desk: 1,
		arenas: [...byId.values()],
		spares: [...base.spares, ...more.spares].slice(0, 10)
	});
}
function capBriefing(payload, max = 6) {
	const scored = payload.arenas.map((arena) => ({
		arena,
		score: arena.items.reduce((s, it) => s + interestScore(itemText(it), it.publishedAt), 0)
	})).sort((a, b) => b.score - a.score);
	const extras = [];
	let n = 0;
	const arenas = [];
	for (const { arena } of scored) {
		const keep = [];
		for (const row of arena.items) if (n < max) {
			keep.push(row);
			n += 1;
		} else extras.push({
			...row,
			arena: arena.id
		});
		if (keep.length) arenas.push({
			...arena,
			items: keep
		});
	}
	const byId = new Map(arenas.map((a) => [a.id, a]));
	return ensureItemIds({
		desk: 1,
		arenas: ARENA_ORDER.filter((id) => byId.has(id)).map((id) => byId.get(id)),
		spares: [...extras, ...payload.spares].slice(0, 10)
	});
}
function padSpares(payload, stories, previous) {
	if (payload.spares.length >= 10) return payload;
	const covered = [
		...previous,
		...payload.arenas.flatMap((a) => a.items.map(itemText)),
		...payload.spares.map(itemText)
	];
	const seenUrls = /* @__PURE__ */ new Set([...payload.arenas.flatMap((a) => a.items.map((i) => i.url)), ...payload.spares.map((i) => i.url)]);
	const spares = [...payload.spares];
	for (const story of stories) {
		if (spares.length >= 10) break;
		if (seenUrls.has(story.url)) continue;
		const row = storyToItem(story);
		if (!row) continue;
		if (covered.some((p) => sameEvent(p, itemText(row)))) continue;
		let arenaId = story.arena ?? classifyArena(itemText(row)) ?? "intl";
		if (!ARENA_META[arenaId]) arenaId = "intl";
		spares.push({
			...row,
			id: makeId("s", row.url),
			arena: arenaId
		});
		covered.push(itemText(row));
		seenUrls.add(row.url);
	}
	if (spares.length < 10) for (const spare of seedPayload().spares) {
		if (spares.length >= 10) break;
		if (seenUrls.has(spare.url)) continue;
		if (covered.some((p) => sameEvent(p, itemText(spare)))) continue;
		spares.push(spare);
		covered.push(itemText(spare));
		seenUrls.add(spare.url);
	}
	return ensureItemIds({
		...payload,
		spares: spares.slice(0, 10)
	});
}
/** Rule-based desk composer — no XAI / no api.x.ai. */
async function composeBriefing(input) {
	const seen = input.seen instanceof Set ? input.seen : new Set(input.seen);
	const seed = prunePayload(seedPayload(), input.previous);
	const live = fromStories(input.stories, seen, input.previous);
	let capped = capBriefing(live.arenas.reduce((s, a) => s + a.items.length, 0) >= 4 ? mergeUnique(live, seed, input.previous) : mergeUnique(seed, live, input.previous), 6);
	if (capped.arenas.reduce((s, a) => s + a.items.length, 0) < 4) capped = capBriefing(mergeUnique(seedPayload(), capped, []), 6);
	capped = padSpares(capped, input.stories, input.previous);
	const payload = decorateArenas$1(capped);
	return {
		payload,
		tickerHe: [...payload.arenas.flatMap((arena) => arena.items.map((it) => ({
			url: it.url,
			titleHe: `${it.speaker ? `${it.speaker}: ` : ""}${it.body}`.replace(/\*\*/g, ""),
			source: it.speaker || "עדכון",
			arena: arena.id
		}))), ...payload.spares.map((it) => ({
			url: it.url,
			titleHe: `${it.speaker ? `${it.speaker}: ` : ""}${it.body}`.replace(/\*\*/g, ""),
			source: it.speaker || "עדכון",
			arena: it.arena
		}))]
	};
}
function localizeHeadline(title, source) {
	const he = toDeskHebrew(title);
	if (hasHebrew(he)) return deskHeadline(he);
	return `דווח ב-${formatOutlet(source)}: ${deskHeadline(title)}`.slice(0, 140);
}
var RSS_SOURCES = [
	{
		name: "אלג'זירה",
		url: "https://www.aljazeera.com/xml/rss/all.xml"
	},
	{
		name: "אלג'זירה",
		url: "https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db769f779/73d0e1b4-532f-45ef-b680-839ca1d9cb0b"
	},
	{
		name: "BBC",
		url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml"
	},
	{
		name: "BBC ערבית",
		url: "https://feeds.bbci.co.uk/arabic/rss.xml"
	},
	{
		name: "ה-NYT",
		url: "https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml"
	},
	{
		name: "ה-Guardian",
		url: "https://www.theguardian.com/world/middleeast/rss"
	},
	{
		name: "אלמוניטור",
		url: "https://www.al-monitor.com/rss.xml"
	},
	{
		name: "The Cradle",
		url: "https://thecradle.co/feed"
	},
	{
		name: "MEE",
		url: "https://www.middleeasteye.net/rss.xml"
	},
	{
		name: "איראן אינטרנשיונל",
		url: "https://www.iranintl.com/feed"
	},
	{
		name: "פראנס 24",
		url: "https://www.france24.com/en/middle-east/rss"
	},
	{
		name: "פראנס 24 ערבית",
		url: "https://www.france24.com/ar/middle-east/rss"
	},
	{
		name: "אנאדולו",
		url: "https://www.aa.com.tr/en/rss/default?cat=middle-east"
	},
	{
		name: "סאנא",
		url: "https://sana.sy/en/?feed=rss2"
	},
	{
		name: "ה-Axios",
		url: "https://api.axios.com/feed/"
	},
	{
		name: "ה-FT",
		url: "https://www.ft.com/world/mideast?format=rss"
	},
	{
		name: "אקונומיסט",
		url: "https://www.economist.com/middle-east-and-africa/rss.xml"
	},
	{
		name: "סקיי ניוז",
		url: "https://feeds.skynews.com/feeds/rss/world.xml"
	},
	{
		name: "פוקס",
		url: "https://moxie.foxnews.com/google-publisher/world.xml"
	},
	{
		name: "אלשרק אלאוסט",
		url: "https://aawsat.com/feed"
	},
	{
		name: "אלשרק אלאוסט",
		url: "https://aawsat.com/feed/arab-world"
	},
	{
		name: "אלערבי אלג'דיד",
		url: "https://www.alaraby.co.uk/rss.xml"
	},
	{
		name: "אלאח'באר",
		url: "https://www.al-akhbar.com/rss"
	},
	{
		name: "Amwaj",
		url: "https://amwaj.media/feed"
	},
	{
		name: "רודאו",
		url: "https://www.rudaw.net/english/rss"
	},
	{
		name: "כורדיסטן 24",
		url: "https://www.kurdistan24.net/en/rss"
	},
	{
		name: "אנב בלדי",
		url: "https://www.enabbaladi.net/feed"
	},
	{
		name: "אלמסדר",
		url: "https://almasdaronline.com/rss"
	},
	{
		name: "שפק",
		url: "https://shafaq.com/ar/rss"
	},
	{
		name: "Daily Sabah",
		url: "https://www.dailysabah.com/rss"
	},
	{
		name: "טהראן טיימס",
		url: "https://www.tehrantimes.com/rss"
	},
	{
		name: "פארס",
		url: "https://www.farsnews.ir/rss"
	},
	{
		name: "תסנים",
		url: "https://www.tasnimnews.com/en/rss/feed/0/8/0"
	},
	{
		name: "אירנא",
		url: "https://www.irna.ir/rss"
	},
	{
		name: "מהר",
		url: "https://www.mehrnews.com/rss"
	},
	{
		name: "יסנא",
		url: "https://www.isna.ir/rss"
	},
	{
		name: "פרס TV",
		url: "https://www.presstv.ir/rss"
	},
	{
		name: "נור ניוז",
		url: "https://nournews.ir/en/rss"
	},
	{
		name: "אלמיאדין",
		url: "https://www.almayadeen.net/rss"
	},
	{
		name: "אלמנאר",
		url: "https://www.almanar.com.lb/rss"
	},
	{
		name: "The National",
		url: "https://www.thenationalnews.com/arc/outboundfeeds/rss/?outputType=xml"
	},
	{
		name: "אלע'ד",
		url: "https://alghad.com/rss"
	},
	{
		name: "יום7",
		url: "https://www.youm7.com/rss/rssfeeds"
	},
	{
		name: "אהראם",
		url: "https://english.ahram.org.eg/rss.aspx"
	},
	{
		name: "וואפא",
		url: "https://english.wafa.ps/rss.aspx"
	},
	{
		name: "Reuters",
		url: "https://feeds.reuters.com/reuters/worldNews"
	},
	{
		name: "SPA",
		url: "https://www.spa.gov.sa/rss.xml"
	},
	{
		name: "KUNA",
		url: "https://www.kuna.net.kw/rssenglish.xml"
	},
	{
		name: "WAM",
		url: "https://www.wam.ae/en/rss/latest-news.xml"
	},
	{
		name: "אלמסירה",
		url: "https://www.almasirah.net.ye/rss"
	},
	{
		name: "תסנים ערבית",
		url: "https://www.tasnimnews.com/ar/rss/feed/0/8/0"
	},
	{
		name: "מהר ערבית",
		url: "https://ar.mehrnews.com/rss"
	},
	{
		name: "אלאח'באר",
		url: "https://al-akhbar.com/rss.xml"
	}
];
var TELEGRAM_SOURCES = [
	{
		name: "פארס",
		channel: "farsna"
	},
	{
		name: "תסנים",
		channel: "tasnimnews"
	},
	{
		name: "אירנא",
		channel: "IRNAofficial"
	},
	{
		name: "מהר",
		channel: "mehrnews"
	},
	{
		name: "פרס TV",
		channel: "PressTV"
	},
	{
		name: "נור ניוז",
		channel: "NourNews_IR"
	},
	{
		name: "יסנא",
		channel: "ISNAnews"
	},
	{
		name: "דפא פרס",
		channel: "defapress"
	},
	{
		name: "משרע",
		channel: "mashreghnews"
	},
	{
		name: "חבר אונליין",
		channel: "khabaronline"
	},
	{
		name: "IRIB",
		channel: "IRIBNEWS"
	},
	{
		name: "אלמיאדין",
		channel: "almayadeen"
	},
	{
		name: "אלאח'באר",
		channel: "AlakhbarNews"
	},
	{
		name: "אלמנאר",
		channel: "almanarnews"
	},
	{
		name: "אנאדולו",
		channel: "anadoluagency"
	},
	{
		name: "סאנא",
		channel: "SyrianArabNews"
	},
	{
		name: "אלמסירה",
		channel: "almasirah"
	},
	{
		name: "אנצאר אללה",
		channel: "Ansarollah_Media"
	},
	{
		name: "עדן אלע'ד",
		channel: "adenalghad_news"
	},
	{
		name: "אלמסדר",
		channel: "almasdaronline"
	},
	{
		name: "סבא",
		channel: "sabanewnet"
	},
	{
		name: "שפק",
		channel: "shafaqnews"
	},
	{
		name: "רודאו",
		channel: "RudawEnglish"
	},
	{
		name: "INA",
		channel: "IraqiNewsAgency"
	},
	{
		name: "SPA",
		channel: "SPAagency"
	},
	{
		name: "WAM",
		channel: "wamnews"
	},
	{
		name: "QNA",
		channel: "QatarNewsQNA"
	},
	{
		name: "אלערביה",
		channel: "AlArabiya"
	},
	{
		name: "אלחדת'",
		channel: "AlHadath"
	},
	{
		name: "אלג'זירה",
		channel: "AJANews"
	},
	{
		name: "אלשרק אלאוסט",
		channel: "aawsat"
	},
	{
		name: "אלקודס אלערבי",
		channel: "alqudsalarabi"
	},
	{
		name: "אלערבי אלג'דיד",
		channel: "alaraby_ar"
	},
	{
		name: "סקיי ניוז ערבית",
		channel: "skynewsarabia"
	},
	{
		name: "The Cradle",
		channel: "TheCradleMedia"
	},
	{
		name: "Amwaj",
		channel: "amwajmedia"
	},
	{
		name: "איראן אינטרנשיונל",
		channel: "IranIntl"
	},
	{
		name: "רויטרס",
		channel: "Reuters"
	},
	{
		name: "AFP",
		channel: "AFPnews"
	},
	{
		name: "אנב בלדי",
		channel: "EnabBaladiNews"
	},
	{
		name: "סוריה TV",
		channel: "SyriaTV"
	},
	{
		name: "קדס",
		channel: "QudsN"
	},
	{
		name: "שהאב",
		channel: "ShehabAgency"
	},
	{
		name: "פלע'א",
		channel: "palinfo"
	},
	{
		name: "חמאס",
		channel: "HamasInfoAr"
	},
	{
		name: "נהארנט",
		channel: "Naharnet"
	},
	{
		name: "LBCI",
		channel: "LBCILebanon"
	},
	{
		name: "צאבין",
		channel: "SabreenNews"
	},
	{
		name: "אלמחואר",
		channel: "almahwar"
	},
	{
		name: "האעלאם אלחרבי",
		channel: "C_Military14"
	},
	{
		name: "אלע'ד",
		channel: "alghadnews"
	},
	{
		name: "וואפא",
		channel: "WAFANewsPS"
	},
	{
		name: "Daily Sabah",
		channel: "dailysabah"
	},
	{
		name: "RT ערבית",
		channel: "rtarabic"
	},
	{
		name: "ספוטניק ערבית",
		channel: "Sputnik_Ar"
	},
	{
		name: "אלג'זירה ישיר",
		channel: "ajmubasher"
	},
	{
		name: "אלחדת' דחוף",
		channel: "Alhadathajel"
	},
	{
		name: "אלערביה דחוף",
		channel: "AlArabiya_Brk"
	},
	{
		name: "אלעאלם",
		channel: "alalam"
	},
	{
		name: "יחיא סריע",
		channel: "MMY1444"
	},
	{
		name: "האעלאם אלחרבי תימן",
		channel: "militarymedia1"
	},
	{
		name: "בגדאד היום",
		channel: "baghdadtodaynews"
	},
	{
		name: "חשד שעיבי",
		channel: "alhashed"
	},
	{
		name: "אלעחד",
		channel: "alahednews"
	},
	{
		name: "NBN",
		channel: "NBNLive"
	},
	{
		name: "MTV לבנון",
		channel: "mtvlebanon"
	},
	{
		name: "אלג'דיד",
		channel: "aljadeednews"
	},
	{
		name: "ג'מראן",
		channel: "JamaranNews"
	},
	{
		name: "אילנא",
		channel: "ilna_ir"
	},
	{
		name: "SNN",
		channel: "snn_ir"
	},
	{
		name: "חבר פורי",
		channel: "khabar_fori"
	},
	{
		name: "טהראן פורי",
		channel: "TehranFori"
	},
	{
		name: "הממלכה",
		channel: "AlMamlakaTV"
	},
	{
		name: "אלשרק ניוז",
		channel: "AsharqNews"
	},
	{
		name: "נשיאות סוריה",
		channel: "SyrianPresidency"
	},
	{
		name: "משהפ סוריה",
		channel: "SyrianMOI"
	},
	{
		name: "חדשות חזבאללה",
		channel: "Hezbollah_News"
	},
	{
		name: "אלח'ליג' אונליין",
		channel: "alkhaleejonline"
	},
	{
		name: "משהח עיראק",
		channel: "IraqiMFA"
	},
	{
		name: "משהח תימן",
		channel: "YemeniMofa"
	},
	{
		name: "סאות אלע'ד",
		channel: "SawtAlGhad"
	},
	{
		name: "רשת אלפרקאן",
		channel: "AlforqanMedia"
	},
	{
		name: "צאפא",
		channel: "SafaPs"
	},
	{
		name: "סנד",
		channel: "SANDnews"
	},
	{
		name: "אלאח'באריה אלסוריה",
		channel: "SyriaNewsAgency"
	},
	{
		name: "רויא ניוז",
		channel: "RoyaNews"
	},
	{
		name: "וואע",
		channel: "INAnew"
	},
	{
		name: "אבו עלי אקספרס",
		channel: "AbuAliExpress",
		indicator: true
	},
	{
		name: "דסק ערבים",
		channel: "kan11arabic",
		indicator: true
	}
];
var _0002_news_default = "create table if not exists briefings (\n  id text primary key,\n  hour_label text not null,\n  date_label text not null,\n  generated_at timestamptz not null default now(),\n  payload text not null,\n  status text not null default 'ready',\n  error text\n);\n\ncreate table if not exists ticker_items (\n  id text primary key,\n  title text not null,\n  title_he text,\n  source text not null,\n  url text not null,\n  published_at timestamptz,\n  fetched_at timestamptz not null default now(),\n  arena text\n);\n\ncreate index if not exists ticker_items_published_idx\n  on ticker_items (published_at desc nulls last);\n\ncreate table if not exists seen_stories (\n  fingerprint text primary key,\n  first_seen timestamptz not null default now(),\n  briefing_id text\n);\n\ncreate table if not exists gen_meta (\n  key text primary key,\n  value text not null,\n  updated_at timestamptz not null default now()\n);\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({ "/migrations/0002_news.sql": _0002_news_default });
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
function asIso(value) {
	const d = parsePossiblyUtc(value ?? null);
	return d ? d.toISOString() : null;
}
function emptyPayload() {
	return {
		arenas: [],
		spares: [],
		desk: 0
	};
}
function parsePayload(raw) {
	try {
		const parsed = JSON.parse(raw);
		if (!parsed || !Array.isArray(parsed.arenas)) return emptyPayload();
		return {
			arenas: parsed.arenas,
			spares: Array.isArray(parsed.spares) ? parsed.spares : [],
			desk: parsed.desk ?? 0
		};
	} catch {
		return emptyPayload();
	}
}
function mapBriefing(row) {
	const status = row.status === "generating" || row.status === "error" ? row.status : "ready";
	return {
		id: row.id,
		hourLabel: row.hour_label,
		dateLabel: row.date_label,
		generatedAt: asIso(row.generated_at) ?? (/* @__PURE__ */ new Date()).toISOString(),
		status,
		error: row.error,
		payload: parsePayload(row.payload)
	};
}
async function getBriefing(id) {
	const rows = await (await getSql())`
    select id, hour_label, date_label, generated_at, payload, status, error
    from briefings where id = ${id} limit 1
  `;
	return rows[0] ? mapBriefing(rows[0]) : null;
}
async function getLatestReady(dayPrefix) {
	const rows = await (await getSql())`
    select id, hour_label, date_label, generated_at, payload, status, error
    from briefings
    where id like ${`${dayPrefix}T%`}
    order by id desc
    limit 24
  `;
	let fallback = null;
	for (const row of rows) {
		const rec = mapBriefing(row);
		if (!briefingHasContent(rec)) continue;
		if (rec.status === "ready") return rec;
		if (!fallback) fallback = rec;
	}
	return fallback;
}
async function listHours(dayPrefix) {
	return (await (await getSql())`
    select id, hour_label, status from briefings
    where id like ${`${dayPrefix}T%`}
    order by id desc
  `).map((row) => ({
		id: row.id,
		hourLabel: row.hour_label,
		status: row.status === "generating" || row.status === "error" ? row.status : "ready"
	}));
}
function mapTicker(row) {
	return {
		id: row.id,
		title: row.title,
		titleHe: row.title_he,
		source: row.source,
		url: row.url,
		publishedAt: asIso(row.published_at),
		arena: row.arena
	};
}
async function listTicker(limit = 40) {
	return (await (await getSql())`
    select id, title, title_he, source, url, published_at, arena
    from ticker_items
    order by published_at desc nulls last, fetched_at desc
    limit ${limit}
  `).map(mapTicker).filter((item) => {
		const text = `${item.titleHe ?? ""} ${item.title}`;
		if (!(hasHebrew(item.titleHe ?? "") || hasHebrew(item.title))) return false;
		return isDeskStory(text) || isDeskStory(item.titleHe ?? item.title);
	}).sort((a, b) => tickerScore(b) - tickerScore(a));
}
function tickerScore(item) {
	const t = `${item.titleHe ?? ""} ${item.title}`;
	let s = 0;
	if (/גורמים ל-|בלעדי|מסר(?:ו)? ל/.test(t)) s += 6;
	if (/משה["״]מ|הורמוז|חיזבאללה|חות|קאליבאף|טראמפ|עלי אלטאהר/.test(t)) s += 3;
	if (/איראן|לבנון|תימן|עיראק|כווית|סעודי/.test(t)) s += 2;
	const tms = item.publishedAt ? Date.parse(item.publishedAt) : 0;
	if (tms) s += Math.max(0, 5 - (Date.now() - tms) / 36e5);
	return s;
}
async function listTickerNeedingHe(limit = 18) {
	return (await (await getSql())`
    select id, title, title_he, source, url, published_at, arena
    from ticker_items
    where title_he is null or title_he = ${""}
    order by published_at desc nulls last, fetched_at desc
    limit ${limit}
  `).map(mapTicker);
}
async function insertTicker(items) {
	if (items.length === 0) return;
	const sql = await getSql();
	for (const item of items) await sql`
      insert into ticker_items (id, title, title_he, source, url, published_at, arena)
      values (
        ${item.id},
        ${item.title},
        ${item.titleHe ?? null},
        ${item.source},
        ${item.url},
        ${item.publishedAt},
        ${item.arena}
      )
      on conflict (id) do update set
        title = excluded.title,
        title_he = coalesce(ticker_items.title_he, excluded.title_he),
        source = excluded.source,
        published_at = coalesce(excluded.published_at, ticker_items.published_at),
        arena = coalesce(excluded.arena, ticker_items.arena)
    `;
}
async function pruneTicker(keep = 16) {
	const sql = await getSql();
	const ranked = (await sql`
    select id, title, title_he, source, url, published_at, arena
    from ticker_items
    order by published_at desc nulls last, fetched_at desc
    limit 80
  `).map(mapTicker).filter((item) => hasHebrew(item.titleHe ?? "") || hasHebrew(item.title)).sort((a, b) => tickerScore(b) - tickerScore(a));
	if (ranked.length <= keep) return;
	const drop = ranked.slice(keep);
	for (const item of drop) await sql`delete from ticker_items where id = ${item.id}`;
}
async function seedTicker(rows) {
	await insertTicker(rows.filter((row) => row.url && hasHebrew(row.titleHe)).map((row) => ({
		id: createHash("sha256").update(row.url).digest("hex").slice(0, 24),
		title: row.titleHe,
		titleHe: row.titleHe,
		source: row.source ?? "",
		url: row.url,
		publishedAt: (/* @__PURE__ */ new Date()).toISOString(),
		arena: row.arena ?? null
	})));
	await pruneTicker(16);
}
async function applyTickerHe(updates) {
	if (updates.length === 0) return;
	const sql = await getSql();
	for (const row of updates) {
		await sql`
      update ticker_items set title_he = ${row.titleHe} where url = ${row.url}
    `;
		if (!row.url.endsWith("/")) await sql`
        update ticker_items set title_he = ${row.titleHe} where url = ${`${row.url}/`}
      `;
	}
}
async function claimBriefing(id, force = false) {
	const existing = await getBriefing(id);
	if (!force && existing?.status === "ready" && existing.payload.arenas.length > 0) return "ready";
	if (existing?.status === "generating") {
		const started = parsePossiblyUtc(existing.generatedAt)?.getTime() ?? 0;
		if (Date.now() - started < 12e4) return "busy";
	}
	const sql = await getSql();
	const hourLabel = hourLabelFromKey(id);
	const dateLabel = dateLabelFromKey(id);
	if (!existing) {
		await sql`
      insert into briefings (id, hour_label, date_label, payload, status)
      values (${id}, ${hourLabel}, ${dateLabel}, ${"{}"}, ${"generating"})
    `;
		return "owned";
	}
	await sql`
    update briefings
    set status = ${"generating"}, error = null, generated_at = now()
    where id = ${id}
  `;
	return "owned";
}
async function saveBriefing(id, payload) {
	await (await getSql())`
    update briefings
    set payload = ${JSON.stringify(payload)},
        status = ${"ready"},
        error = null,
        generated_at = now()
    where id = ${id}
  `;
}
async function failBriefing(id, error) {
	await (await getSql())`
    update briefings
    set status = ${"error"}, error = ${error}, generated_at = now()
    where id = ${id}
  `;
}
async function listSeen(dayPrefix) {
	return (await (await getSql())`
    select fingerprint from seen_stories
    where briefing_id like ${`${dayPrefix}%`}
  `).map((row) => row.fingerprint);
}
async function addSeen(briefingId, prints) {
	if (prints.length === 0) return;
	const sql = await getSql();
	for (const fp of prints) await sql`
      insert into seen_stories (fingerprint, briefing_id)
      values (${fp}, ${briefingId})
      on conflict (fingerprint) do nothing
    `;
}
async function previousBodies(dayPrefix, excludeId) {
	const rows = await (await getSql())`
    select payload from briefings
    where id like ${`${dayPrefix}T%`} and id <> ${excludeId} and status = ${"ready"}
    order by id desc
    limit 12
  `;
	const lines = [];
	for (const row of rows) {
		const payload = parsePayload(row.payload);
		for (const arena of payload.arenas) for (const item of arena.items) lines.push(`${arena.title} | ${item.speaker}: ${item.body}`.slice(0, 220));
	}
	return lines;
}
async function getMeta(key) {
	return (await (await getSql())`
    select value from gen_meta where key = ${key} limit 1
  `)[0]?.value ?? null;
}
async function setMeta(key, value) {
	await (await getSql())`
    insert into gen_meta (key, value, updated_at)
    values (${key}, ${value}, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()
  `;
}
var SCAN_LEAD_MS = 24e5;
async function getScanState() {
	const [status, due, consumed] = await Promise.all([
		getMeta("scan_status"),
		getMeta("next_due_at"),
		getMeta("consumed_id")
	]);
	return {
		scanning: status === "scanning",
		dueAt: due && due.length > 0 ? due : null,
		consumedId: consumed && consumed.length > 0 ? consumed : null
	};
}
async function markBriefingUsed(id) {
	const due = new Date(Date.now() + SCAN_LEAD_MS);
	await setMeta("consumed_id", id);
	await setMeta("consumed_at", (/* @__PURE__ */ new Date()).toISOString());
	await setMeta("next_due_at", due.toISOString());
	await setMeta("scan_status", "scanning");
	return due;
}
async function clearScan() {
	await setMeta("scan_status", "");
	await setMeta("next_due_at", "");
}
async function buildDashboard(selectedHour) {
	const now = /* @__PURE__ */ new Date();
	const current = hourKey(now);
	const hour = selectedHour && selectedHour.length >= 13 ? selectedHour : current;
	const parts = israelParts(now);
	const dayPrefix = `${parts.year}-${parts.month}-${parts.day}`;
	const [briefing, hours, ticker, latest, scan] = await Promise.all([
		getBriefing(hour),
		listHours(dayPrefix),
		listTicker(48),
		getLatestReady(dayPrefix),
		getScanState()
	]);
	const hourSet = new Map(hours.map((h) => [h.id, h]));
	if (!hourSet.has(current)) hourSet.set(current, {
		id: current,
		hourLabel: hourLabelFromKey(current),
		status: briefing && briefing.id === current ? briefing.status : "ready"
	});
	if (latest && !hourSet.has(latest.id)) hourSet.set(latest.id, {
		id: latest.id,
		hourLabel: latest.hourLabel,
		status: latest.status
	});
	const generating = [...hourSet.values()].find((h) => h.status === "generating")?.id ?? (briefing?.status === "generating" ? briefing.id : null);
	const scanQueue = ((briefingHasContent(briefing) ? briefing : briefingHasContent(latest) ? latest : briefing)?.payload.spares ?? []).slice(0, 10);
	return {
		briefing: briefing ?? null,
		latestBriefing: latest,
		hours: [...hourSet.values()].sort((a, b) => a.id < b.id ? 1 : -1),
		ticker,
		scanQueue,
		currentHourKey: current,
		currentClock: formatHeClock(now),
		currentDateLabel: todayDateLabel(now),
		generatingHour: generating,
		scanningNext: Boolean(scan.scanning && scan.dueAt && Date.now() < Date.parse(scan.dueAt)),
		scanDueAt: scan.dueAt,
		scanDueLabel: scan.dueAt ? formatHeClock(new Date(scan.dueAt)) : null
	};
}
function decorateArenas(payload) {
	return {
		desk: payload.desk,
		arenas: sortArenas(payload.arenas.filter((arena) => ARENA_META[arena.id] && arena.items.length > 0).map((arena) => {
			const pres = arenaPresentation(arena.id, arena.items);
			return {
				...arena,
				id: arena.id,
				title: pres.title,
				flags: pres.flags,
				items: arena.items
			};
		})),
		spares: (payload.spares ?? []).slice(0, 10)
	};
}
async function swapSpareItem(id, spareUrl, itemUrl) {
	const current = await getBriefing(id);
	if (!current || !briefingHasContent(current)) return current;
	const next = applySwap(current.payload, spareUrl, itemUrl);
	if (!next) return current;
	await saveBriefing(id, decorateArenas(next));
	return await getBriefing(id) ?? current;
}
async function addSpareItem(id, spareUrl) {
	const current = await getBriefing(id);
	if (!current || !briefingHasContent(current)) return current;
	const next = applyAdd(current.payload, spareUrl);
	if (!next) return current;
	await saveBriefing(id, decorateArenas(next));
	return await getBriefing(id) ?? current;
}
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
function storyId(url) {
	return createHash("sha256").update(url).digest("hex").slice(0, 24);
}
async function fetchText(url, ms = 5e3) {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), ms);
	try {
		const res = await fetch(url, {
			signal: ctrl.signal,
			redirect: "follow",
			headers: {
				"user-agent": UA,
				accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.9, */*;q=0.8"
			}
		});
		if (!res.ok) return null;
		return await res.text();
	} catch {
		return null;
	} finally {
		clearTimeout(timer);
	}
}
function tag(block, name) {
	const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i");
	const match = block.match(re);
	if (match?.[1]) return stripHtml(match[1]);
	const alt = block.match(new RegExp(`<${name}[^>]+href=["']([^"']+)["']`, "i"));
	return alt?.[1] ? stripHtml(alt[1]) : "";
}
function parseRss(xml, source) {
	const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];
	const items = [];
	for (const block of blocks) {
		const title = tag(block, "title");
		const url = tag(block, "link") || block.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] || "";
		if (!title || !url) continue;
		const published = tag(block, "pubDate") || tag(block, "published") || tag(block, "updated") || null;
		const text = `${title} ${tag(block, "description")}`;
		if (!isDeskStory(text) && !isRegional(text)) continue;
		items.push({
			title: firstLine(title, 220),
			url: url.trim(),
			source,
			publishedAt: parsePossiblyUtc(published)?.toISOString() ?? null,
			arena: classifyArena(text),
			via: "rss"
		});
	}
	return items;
}
function parseTelegram(html, channel, source) {
	const chunks = html.split(/class="tgme_widget_message /);
	const items = [];
	for (const chunk of chunks.slice(1)) {
		const post = chunk.match(/data-post="([^"]+)"/)?.[1];
		const time = chunk.match(/datetime="([^"]+)"/)?.[1] ?? null;
		const textHtml = chunk.match(/class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/)?.[1];
		if (!textHtml) continue;
		const body = stripHtml(textHtml);
		if (body.length < 24) continue;
		const url = post ? `https://t.me/${post}` : `https://t.me/s/${channel}`;
		const title = firstLine(body, 220);
		if (!isDeskStory(`${title} ${body}`)) continue;
		items.push({
			title,
			url,
			source,
			publishedAt: parsePossiblyUtc(time)?.toISOString() ?? null,
			arena: classifyArena(`${title} ${body}`),
			via: "telegram"
		});
	}
	return items;
}
function isTodayIsrael(iso) {
	if (!iso) return false;
	const d = parsePossiblyUtc(iso);
	if (!d) return false;
	const p = israelParts(d);
	const now = israelParts(/* @__PURE__ */ new Date());
	return p.year === now.year && p.month === now.month && p.day === now.day;
}
async function poolMap(items, size, fn) {
	const out = [];
	for (let i = 0; i < items.length; i += size) {
		const chunk = items.slice(i, i + size);
		const settled = await Promise.allSettled(chunk.map(fn));
		for (const result of settled) if (result.status === "fulfilled") out.push(result.value);
	}
	return out;
}
async function ingestStories(force = false) {
	const last = await getMeta("ticker_at");
	if (!force && last) {
		const then = Number(last);
		if (Number.isFinite(then) && Date.now() - then < 75e3) return [];
	}
	await setMeta("ticker_at", String(Date.now()));
	const batches = await poolMap([...RSS_SOURCES.map((src) => ({
		kind: "rss",
		src
	})), ...TELEGRAM_SOURCES.map((src) => ({
		kind: "tg",
		src
	}))], 10, async (job) => {
		if (job.kind === "rss") {
			const xml = await fetchText(job.src.url, 5e3);
			if (!xml || !/[<](rss|feed|item|entry)/i.test(xml)) return [];
			return parseRss(xml, job.src.name);
		}
		const html = await fetchText(`https://t.me/s/${job.src.channel}`, 5e3);
		if (!html) return [];
		return parseTelegram(html, job.src.channel, job.src.name);
	});
	const merged = [];
	const seen = /* @__PURE__ */ new Set();
	for (const group of batches) for (const story of group) {
		const key = story.url.replace(/\/$/, "");
		if (seen.has(key)) continue;
		seen.add(key);
		merged.push(story);
	}
	merged.sort((a, b) => {
		const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
		return (b.publishedAt ? Date.parse(b.publishedAt) : 0) - ta;
	});
	const recent = merged.filter((story) => {
		if (!story.publishedAt) return true;
		const d = parsePossiblyUtc(story.publishedAt);
		if (!d) return true;
		return Date.now() - d.getTime() < 1296e5;
	});
	await insertTicker(recent.slice(0, 140).map((story) => ({
		id: storyId(story.url),
		title: story.title,
		titleHe: hasHebrew(story.title) ? story.title : null,
		source: story.source,
		url: story.url,
		publishedAt: story.publishedAt,
		arena: story.arena
	})));
	return recent.filter((story) => !story.publishedAt || isTodayIsrael(story.publishedAt));
}
var mem = /* @__PURE__ */ new Map();
function extractShort(msg) {
	return msg.match(/https:\/\/katzr\.net\/[a-zA-Z0-9]+/)?.[0] ?? null;
}
async function katzrShort(url) {
	const raw = (url ?? "").trim();
	if (!raw) return raw;
	if (/^https:\/\/katzr\.net\/[a-zA-Z0-9]+$/.test(raw)) return raw;
	if (mem.has(raw)) return mem.get(raw);
	const cached = await getMeta(`katzr:${raw}`);
	if (cached && /^https:\/\/katzr\.net\/[a-zA-Z0-9]+$/.test(cached)) {
		mem.set(raw, cached);
		return cached;
	}
	try {
		const ctrl = new AbortController();
		const timer = setTimeout(() => ctrl.abort(), 8e3);
		const res = await fetch("https://katzr.net/ajax.php", {
			method: "POST",
			signal: ctrl.signal,
			headers: {
				"content-type": "application/json",
				origin: "https://katzr.net",
				referer: "https://katzr.net/",
				accept: "application/json, text/plain, */*"
			},
			body: JSON.stringify({
				action: "shortUrl",
				url: raw
			})
		});
		clearTimeout(timer);
		const data = await res.json();
		const short = extractShort(String(data?.msg ?? ""));
		if (short) {
			mem.set(raw, short);
			await setMeta(`katzr:${raw}`, short);
			return short;
		}
	} catch {}
	return raw;
}
async function shortenPayload(payload) {
	const items = [...payload.arenas.flatMap((arena) => arena.items), ...payload.spares];
	const unique = [...new Set(items.map((item) => item.url).filter(Boolean))];
	const map = /* @__PURE__ */ new Map();
	for (let i = 0; i < unique.length; i += 4) {
		const chunk = unique.slice(i, i + 4);
		const shorts = await Promise.all(chunk.map((url) => katzrShort(url)));
		chunk.forEach((url, idx) => map.set(url, shorts[idx]));
	}
	for (const item of items) item.shortUrl = map.get(item.url) ?? item.url;
	return payload;
}
var inflight = /* @__PURE__ */ new Map();
async function localizeTicker() {
	const pending = await listTickerNeedingHe(32);
	if (pending.length === 0) return;
	const he = pending.map((item) => ({
		url: item.url,
		titleHe: hasHebrew(item.title) ? item.title : localizeHeadline(item.title, item.source)
	})).filter((row) => row.url && hasHebrew(row.titleHe));
	if (he.length) await applyTickerHe(he);
}
async function generateForHour(id) {
	const parts = israelParts();
	const dayPrefix = `${parts.year}-${parts.month}-${parts.day}`;
	try {
		const stories = await Promise.race([ingestStories(true), new Promise((resolve) => {
			setTimeout(() => resolve([]), 22e3);
		})]);
		const [seen, previous, ticker] = await Promise.all([
			listSeen(dayPrefix),
			previousBodies(dayPrefix, id),
			listTicker(40)
		]);
		localizeTicker();
		const fromTicker = stories.length > 0 ? [] : ticker.slice(0, 40).map((item) => ({
			title: item.titleHe ?? item.title,
			url: item.url,
			source: item.source,
			publishedAt: item.publishedAt,
			arena: null,
			via: "rss"
		}));
		const result = await composeBriefing({
			hourLabel: hourLabelFromKey(id),
			stories: stories.length ? stories : fromTicker,
			previous,
			seen
		});
		await saveBriefing(id, await shortenPayload(result.payload));
		const prints = [];
		for (const arena of result.payload.arenas) for (const item of arena.items) prints.push(fingerprint(item.url, `${item.speaker} ${item.body}`));
		for (const item of result.payload.spares) prints.push(fingerprint(item.url, `${item.speaker} ${item.body}`));
		await addSeen(id, prints);
		if (result.tickerHe.length) {
			await applyTickerHe(result.tickerHe);
			await seedTicker(result.tickerHe);
		}
		await localizeTicker();
		await pruneTicker(16);
	} catch (err) {
		const message = err instanceof Error ? err.message : "generation failed";
		console.error("[briefing]", id, message);
		await failBriefing(id, message);
	}
}
var ingestKick = null;
function kickIngest() {
	if (ingestKick) return;
	ingestKick = (async () => {
		await setMeta("last_ingest_at", (/* @__PURE__ */ new Date()).toISOString());
		await ingestStories(false);
		await localizeTicker();
		await pruneTicker(16);
	})().catch((err) => {
		console.error("[scan-ingest]", err instanceof Error ? err.message : err);
	}).finally(() => {
		ingestKick = null;
	});
}
async function tickScan() {
	const parts = israelParts();
	const dayPrefix = `${parts.year}-${parts.month}-${parts.day}`;
	const [latest, scan] = await Promise.all([getLatestReady(dayPrefix), getScanState()]);
	if (scan.scanning && scan.dueAt) {
		const due = Date.parse(scan.dueAt);
		if (Date.now() >= due) {
			const id = hourKey();
			if (!inflight.has(id)) {
				const task = (async () => {
					await claimBriefing(id, true);
					await generateForHour(id);
					await clearScan();
				})().finally(() => inflight.delete(id));
				inflight.set(id, task);
			}
		} else {
			const last = await getMeta("last_ingest_at");
			if (!last || Date.now() - Date.parse(last) > 36e4) kickIngest();
		}
		return;
	}
	if (!latest || latest.id !== hourKey()) {
		const id = hourKey();
		if (inflight.has(id)) return;
		await claimBriefing(id, true);
		const task = generateForHour(id).finally(() => inflight.delete(id));
		inflight.set(id, task);
	}
}
var getDashboard_createServerFn_handler = createServerRpc({
	id: "a2cf23b9aabf6ccb2a24ceca4ea6f9c98c02d65008af47bfd56a58e0a373f6af",
	name: "getDashboard",
	filename: "src/lib/news/server.ts"
}, (opts) => getDashboard.__executeServer(opts));
var getDashboard = createServerFn({ method: "POST" }).validator((input) => input ?? {}).handler(getDashboard_createServerFn_handler, async ({ data }) => {
	await tickScan();
	return buildDashboard(data.hourKey);
});
var refreshTicker_createServerFn_handler = createServerRpc({
	id: "d269074186cbf601e57c51ce43542d0d01822db2c614041cbd0fc905f8ca328c",
	name: "refreshTicker",
	filename: "src/lib/news/server.ts"
}, (opts) => refreshTicker.__executeServer(opts));
var refreshTicker = createServerFn({ method: "POST" }).handler(refreshTicker_createServerFn_handler, async () => {
	await ingestStories(false);
	await localizeTicker();
	await pruneTicker(16);
	await tickScan();
	return buildDashboard();
});
var ensureBriefing_createServerFn_handler = createServerRpc({
	id: "a7cd39d6671e03c7538ba75dcab24cf403917c42b70e5dc50a3dcfcd8f69b70f",
	name: "ensureBriefing",
	filename: "src/lib/news/server.ts"
}, (opts) => ensureBriefing.__executeServer(opts));
var ensureBriefing = createServerFn({ method: "POST" }).validator((input) => input ?? {}).handler(ensureBriefing_createServerFn_handler, async ({ data }) => {
	await tickScan();
	if (data.force) {
		const id = data.hourKey ?? hourKey();
		inflight.delete(id);
		await claimBriefing(id, true);
		const task = generateForHour(id).finally(() => inflight.delete(id));
		inflight.set(id, task);
		await Promise.race([task, new Promise((r) => setTimeout(r, 12e3))]);
		return buildDashboard(id);
	}
	const id = data.hourKey ?? hourKey();
	if (inflight.has(id)) await Promise.race([inflight.get(id), new Promise((r) => setTimeout(r, 1e4))]);
	return buildDashboard(data.hourKey);
});
var markUsed_createServerFn_handler = createServerRpc({
	id: "94430d18bbc6d35d31ac2a420fd4fa01ca2b6218496dcade152a647a580697fa",
	name: "markUsed",
	filename: "src/lib/news/server.ts"
}, (opts) => markUsed.__executeServer(opts));
var markUsed = createServerFn({ method: "POST" }).validator((input) => input).handler(markUsed_createServerFn_handler, async ({ data }) => {
	await markBriefingUsed(data.hourKey);
	kickIngest();
	return buildDashboard();
});
var swapSpare_createServerFn_handler = createServerRpc({
	id: "24966016c33554192dcdfa12ab2c81ae69c70541ba92e46c3b52ae875d2eab7e",
	name: "swapSpare",
	filename: "src/lib/news/server.ts"
}, (opts) => swapSpare.__executeServer(opts));
var swapSpare = createServerFn({ method: "POST" }).validator((input) => input).handler(swapSpare_createServerFn_handler, async ({ data }) => {
	await swapSpareItem(data.hourKey, data.spareId, data.itemId);
	return buildDashboard(data.hourKey);
});
var addSpare_createServerFn_handler = createServerRpc({
	id: "71ed602902a0a9f16ba89cfdc76fd7c4986e54e87f8c768867226ceadee6d5ab",
	name: "addSpare",
	filename: "src/lib/news/server.ts"
}, (opts) => addSpare.__executeServer(opts));
var addSpare = createServerFn({ method: "POST" }).validator((input) => input).handler(addSpare_createServerFn_handler, async ({ data }) => {
	await addSpareItem(data.hourKey, data.spareId);
	return buildDashboard(data.hourKey);
});
var persistPayload_createServerFn_handler = createServerRpc({
	id: "d6037f94a4a83674860af48fa923199d169ff1dc4eb6a78bf2bbbefc506e4325",
	name: "persistPayload",
	filename: "src/lib/news/server.ts"
}, (opts) => persistPayload.__executeServer(opts));
var persistPayload = createServerFn({ method: "POST" }).validator((input) => input).handler(persistPayload_createServerFn_handler, async ({ data }) => {
	await saveBriefing(data.hourKey, data.payload);
	return buildDashboard(data.hourKey);
});
//#endregion
export { addSpare_createServerFn_handler, ensureBriefing_createServerFn_handler, getDashboard_createServerFn_handler, markUsed_createServerFn_handler, persistPayload_createServerFn_handler, refreshTicker_createServerFn_handler, swapSpare_createServerFn_handler };

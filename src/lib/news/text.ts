import type { ArenaId, BriefingItem } from "./types";
import { ARENA_META } from "./types";

type CopyBits = {
  speaker?: string;
  body?: string;
  url?: string;
  title?: string;
};

const HEBREW_RE = /[\u0590-\u05FF]/;

const MEDIA_IL_RE =
  /אבו עלי|כאן 11|דסק ערבים|ynet|עמית סגל|יחזקאלי|jpost|jerusalempost|timesofisrael|israelhayom|mako\.|walla\.|n12|kan11|inn\.co/i;

const JUNK_RE =
  /הורוסקופ|מזג אוויר|שידור חי|הגרל[הת]|כדורגל|ליגה|מאמן|קבוצה|משחק|גול |שיחקנו|דירייה|diriyah|premier league|la liga|nba\b|fifa|soccer|football|sport|netflix|follow us|subscribe|click here|לחצו כאן|לערוץ הטלגרם|מה מזג|תוצאות הגרלה|reality tv/i;

const DESK_RE =
  /איראן|טהראן|משה["״]מ|חסד["״]ם|חיזבאללה|חות['׳]?ים|הורמוז|תקיפ|טיל|מלחמ|סנקצי|גרעין|חימוש|צה["״]ל|כטב["״]מ|כטמ["״]ם|פיצוץ|הפצצ|רקט|drone|missile|strike|nuclear|sanctions|hormuz|hezbollah|houthi|irgc|centcom|\biran\b|lebanon|syria|yemen|gaza|hamas|netanyahu|khamenei|trump|rubio|israel|עזה|חמאס|סוריה|לבנון|תימן|עיראק|נתניהו|טראמפ|רוביו|קאליבאף|פזשכיאן|חמאנאי|חמינאי|נסראללה|ארדואן|סיסי|בן סלמאן|משמרות המהפכה|פיקוד המרכז|שביתת נשק|הפסקת אש|דיפלומט/i;

const REGION_RE =
  /איראן|לבנון|סוריה|תימן|עיראק|סעודי|אמירויות|קטר|כווית|בחריין|עומאן|תורכיה|טורקיה|מצרים|ירדן|עזה|חמאס|ישראל|הורמוז|מפרץ|מזרח התיכון|\biran\b|lebanon|syria|yemen|iraq|saudi|uae|qatar|kuwait|bahrain|oman|turkey|egypt|jordan|gaza|israel|hormuz|middle east|palestine|palestinian|إيران|لبنان|سوريا|اليمن|العراق|السعود|تركيا|مصر|الأردن|غزة/i;

const GULF_GEO_RE =
  /סעודי|ריאד|אמירויות|אבו דאבי|דובאי|קטר|דוחה|כווית|בחריין|עומאן|מפרצי|\bgcc\b|saudi|riyadh|uae|abu dhabi|dubai|qatar|doha|kuwait|bahrain|oman|mbs|mbz|السعود|الإمارات|قطر|الكويت|البحرين|عُمان|عمان/i;

const GULF_POL_RE =
  /מלך|יורש|נסיך|אמיר|שר |נשיא|שגריר|דיפלומט|הסכם|ברית|פסגה|מועצה|חימוש|תקיפה|צבא|חיל|נורמליזציה|חמאס|תימן|ישראל|minister|king|prince|emir|mbs|mbz|diplomatic|\bgcc\b|defense|defence|foreign|bin salman|bin zayed|tamim|נורמליז/i;

const IRAN_RE =
  /איראן|איראני|טהראן|ח['׳]?אמנאי|חמינאי|חמאנאי|פזשכיאן|קאליבאף|חסד["״]ם|משמרות המהפכה|משה["״]מ|חה["״]י|הורמוז|נתנז|פורדו|אספהאן|סרדיניה|\biran\b|tehran|khamenei|pezeshkian|qalibaf|ghalibaf|irgc|hormuz|natanz|fordow|islamic republic|إيران|طهران|witkoff.*(?:uae|iran)|(?:uae|iran).*witkoff/i;

const LEBANON_RE =
  /לבנון|ביירות|חיזבאללה|דאחי[יה]|נסראללה|נעים קאסם|\blebanon\b|beirut|hezbollah|nasrallah|dahieh|لبنان|حزب الله|بيروت/i;

const SYRIA_RE =
  /סוריה|דמשק|גולן|קוניטרה|סוידא|חלב|א-שאם|\bsyria\b|damascus|golan|aleppo|sweida|سوريا|دمشق/i;

const AXIS_RE =
  /תימן|חות['׳]?ים|אנצאר אללה|צנעא|אלמסירה|עיראק|בגדאד|חשד|כתאיב|עצאיב|המסגרת|\byemen\b|houthi|ansarollah|sana['’]?a|\biraq\b|baghdad|\bpmf\b|hashd|kataib|asaib|الحوث|اليمن|العراق|الحشد/i;

const TURKEY_RE =
  /תורכיה|טורקיה|אנקרה|ארדואן|איסטנבול|\bturkey\b|turkish|ankara|erdogan|istanbul|تركيا|أردوغان/i;

const REGION_ARENA_RE =
  /מצרים|קהיר|סיסי|ירדן|עמאן|עבאס|רמאללה|עזה|חמאס|ג['׳]נין|יהודה ושומרון|יו["״]ש|נתניהו|צה["״]ל|ישראל|\begypt\b|cairo|sisi|jordan|amman|gaza|hamas|israel|netanyahu|\bidf\b|مصر|الأردن|غزة|حماس|إسرائيل/i;

const FLAG_HINTS: { re: RegExp; code: string }[] = [
  { re: /איראן|טהראן|איראני|\biran\b|tehran|irgc|חסד["״]ם/i, code: "ir" },
  { re: /לבנון|ביירות|חיזבאללה|\blebanon\b|beirut|hezbollah/i, code: "lb" },
  { re: /סוריה|דמשק|\bsyria\b|damascus/i, code: "sy" },
  { re: /תימן|חות['׳]?ים|אנצאר אללה|\byemen\b|houthi/i, code: "ye" },
  { re: /עיראק|בגדאד|חשד|\biraq\b|baghdad/i, code: "iq" },
  { re: /סעודי|ריאד|saudi|mbs|bin salman/i, code: "sa" },
  { re: /אמירויות|אבו דאבי|דובאי|\buae\b|abu dhabi/i, code: "ae" },
  { re: /תורכיה|טורקיה|אנקרה|ארדואן|\bturkey\b|erdogan|ankara/i, code: "tr" },
  { re: /ירדן|עמאן|\bjordan\b|amman/i, code: "jo" },
  { re: /מצרים|קהיר|סיסי|\begypt\b|cairo|sisi/i, code: "eg" },
  { re: /ארה["״]ב|אמריק|וושינגטון|טראמפ|רוביו|united states|\bus\b|trump|rubio|washington/i, code: "us" },
  { re: /פקיסטן|pakistan/i, code: "pk" },
  { re: /הודו|\bindia\b/i, code: "in" },
  { re: /יוון|\bgreece\b/i, code: "gr" },
  { re: /כווית|kuwait/i, code: "kw" },
  { re: /קטר|qatar/i, code: "qa" },
  { re: /בחריין|bahrain/i, code: "bh" },
  { re: /עומאן|\boman\b/i, code: "om" },
  { re: /סין|בייג['׳]ין|\bchina\b|beijing|xi jinping|שי ג['׳]ינפינג/i, code: "cn" },
  { re: /רוסיה|מוסקבה|פוטין|\brussia\b|moscow|putin/i, code: "ru" },
  { re: /צרפת|פריז|macron|\bfrance\b/i, code: "fr" },
  { re: /בריטניה|לונדון|\bbritain\b|\buk\b|london/i, code: "gb" },
  { re: /ישראל|ירושלים|צה["״]ל|נתניהו|\bisrael\b|\bidf\b|netanyahu/i, code: "il" },
  { re: /פלסטין|עזה|חמאס|רמאללה|\bgaza\b|hamas|palestinian/i, code: "ps" },
];

const OUTLET_ALIASES: Record<string, string> = {
  reuters: "Reuters",
  "רויטרס": "Reuters",
  "the new york times": "ה-NYT",
  nyt: "ה-NYT",
  "ה-nyt": "ה-NYT",
  "new york times": "ה-NYT",
  "wall street journal": "ה-WSJ",
  wsj: "ה-WSJ",
  "ה-wsj": "ה-WSJ",
  "washington post": "ה-Washington Post",
  "the washington post": "ה-Washington Post",
  "הוושינגטון פוסט": "ה-Washington Post",
  "washington journal": "ה-WSJ",
  "the washington journal": "ה-WSJ",
  cnn: "CNN",
  abc: "ABC",
  politico: "Politico",
  bloomberg: "ה-Bloomberg",
  "the telegraph": "ה-Telegraph",
  telegraph: "ה-Telegraph",
  "הטלגרף": "ה-Telegraph",
  guardian: "ה-Guardian",
  "the guardian": "ה-Guardian",
  axios: "ה-Axios",
  "financial times": "ה-FT",
  ft: "ה-FT",
  economist: "אקונומיסט",
  "the economist": "אקונומיסט",
  "al jazeera": "אלג'זירה",
  aljazeera: "אלג'זירה",
  "aja news": "אלג'זירה",
  ajanews: "אלג'זירה",
  "aj mubasher": "אלג'זירה",
  quds: "קדס",
  qudsn: "קדס",
  "קודס": "קדס",
  aawsat: "אלשרק אלאוסט",
  "alsharq alawsat": "אלשרק אלאוסט",
  "אלשרק אלאוסט": "אלשרק אלאוסט",
  alaraby: "אלערבי אלג'דיד",
  "alaraby aljadeed": "אלערבי אלג'דיד",
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
  "the national": "The National",
  irib: "רשות השידור האיראנית",
  iribnews: "רשות השידור האיראנית",
  snn: "SNN",
  snntv: "SNN",
  farsna: "פארס",
  tasnimnews: "תסנים",
  irna_1313: "אירנא",
  mehrnews: "מהר",
  nournews: "נור ניוז",
  nournews_ir: "נור ניוז",
  almanar: "אלמנאר",
  almayadeen: "אלמיאדין",
  aljadeed: "אלג'דיד",
  "al-akhbar": "אלאח'באר",
  akhbar: "אלאח'באר",
  addiyar: "אלדיאר",
  almasirah: "אלמסירה",
  alarabiya: "אלערביה",
  alhadath: "אלחדת'",
  mtv: "MTV",
  mtvlebanon: "MTV",
};

const SPEAKER_ALIASES: [RegExp, string][] = [
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
  [/secretary of state|מזכיר המדינה/i, "מזכיר המדינה"],
];

const STOP = new Set([
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
  "after",
]);

function collapse(s: string) {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

function decodeEntities(s: string) {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => {
      const code = Number.parseInt(n, 16);
      return Number.isFinite(code) ? String.fromCharCode(code) : "";
    })
    .replace(/&#(\d+);/g, (_, n) => {
      const code = Number(n);
      return Number.isFinite(code) ? String.fromCharCode(code) : "";
    });
}

function blobOf(item: CopyBits) {
  return `${item.speaker ?? ""} ${item.body ?? ""} ${item.title ?? ""} ${item.url ?? ""}`;
}

function clip(text: string, max: number) {
  const s = collapse(text);
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(1, max - 1)).trimEnd()}…`;
}

export function isIsraeliVoice(speaker: string, body: string, url = "") {
  const t = `${speaker} ${body} ${url}`;
  if (
    /אבו עלי|כאן 11|דסק ערבים|ynet|עמית סגל|יחזקאלי|jpost|jerusalempost|timesofisrael|israelhayom|mako\.|walla\.|n12|kan11|inn\.co/i.test(
      t,
    )
  ) {
    return true;
  }
  if (
    /^(נתניהו|שר הביטחון|משהב["״]ט|צה["״]ל|הלוי|זמיר|קץ|כץ|לשכת רמ["״]מ)$/.test(
      speaker.trim(),
    )
  ) {
    return true;
  }
  if (
    /נתניהו|שר הביטחון|לשכת רמ["״]מ|צה["״]ל הנחה|גורמים ישראליים|גורם ביטחוני|פקיד צבאי|דובר צה["״]ל|הרמטכ["״]ל|הלוי|זמיר/.test(body) &&
    !/עלי אלטאהר|תקיפ(?:ה|ות) ישראלית/.test(body)
  ) {
    return true;
  }
  if (/idf spokesman|israeli (?:army|military|official)|דובר צה["״]ל|פקיד צבאי ישראלי/i.test(t) && !isIsraeliStrike(body)) {
    return true;
  }
  return false;
}

export function isIsraeliStrike(text: string) {
  return /תקיפ(?:ה|ות) ישראלית|ישראל תקפ|כטב["״]מ ישראלי|תקיפה בלבנון|תקיפה בעזה|airstrike|israeli strike/i.test(text ?? "");
}

export function tooMuchLatin(text: string) {
  const s = text ?? "";
  const he = (s.match(/[\u0590-\u05FF]/g) || []).length;
  const la = (s.match(/[A-Za-z]/g) || []).length;
  if (he === 0) return la > 8;
  return la > 12 && la > he * 0.55;
}

export function hasHebrew(text: string) {
  return HEBREW_RE.test(text ?? "");
}

export function stripHtml(html: string) {
  const raw = html ?? "";
  const withBreaks = raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|h\d|li|tr|blockquote)>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  return decodeEntities(withBreaks)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function firstLine(text: string, max = 220) {
  const cleaned = stripHtml(text ?? "");
  const line =
    cleaned
      .split(/\n+/)
      .map((row) => collapse(row))
      .find((row) => row.length > 0) ?? collapse(cleaned);
  return clip(line, max);
}

export function hebrewLabel(text: string, fallback = "") {
  const a = collapse(text ?? "");
  if (hasHebrew(a)) return a;
  const b = collapse(fallback ?? "");
  if (hasHebrew(b)) return b;
  return a || b;
}

export function toDeskHebrew(text: string) {
  let s = stripHtml(text ?? "");
  const pairs: [RegExp, string][] = [
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
    [/\bUAE\b/g, "איחוד האמירויות"],
    [/המשטר הציוני/g, "ישראל"],
    [/הישות הציונית/g, "ישראל"],
    [/הכיבוש הציוני/g, "ישראל"],
    [/התוקפנות הציונית/g, "תקיפות ישראליות"],
    [/תוקפנות ציונית/g, "תקיפות ישראליות"],
    [/המשך התוקפנות של ישראל/g, "תקיפות ישראליות"],
    [/התוקפנות של ישראל/g, "תקיפות ישראליות"],
    [/התוקפנות הישראלית/g, "תקיפות ישראליות"],
    [/שהידים/g, "הרוגים"],
    [/שאהידים/g, "הרוגים"],
    [/שהיד(?:ים)?/g, "הרוג"],
    [/الكيان الصهيوني/g, "ישראל"],
    [/النظام الصهيوني/g, "ישראל"],
    [/العدوان الصهيوني/g, "תקיפות ישראליות"],
    [/رژیم صهیونیستی/g, "ישראל"],
    [/\bAl-?Jazeera\b/gi, "אלג'זירה"],
    [/\bAl-?Manar\b/gi, "אלמנאר"],
    [/\bAl-?Mayadeen\b/gi, "אלמיאדין"],
    [/\bAl-?Akhbar\b/gi, "אלאח'באר"],
    [/\bAl-?Hadath\b/gi, "אלחדת'"],
    [/\bAl-?Arabiya\b/gi, "אלערביה"],
    [/\bAl-?Jadeed\b/gi, "אלג'דיד"],
    [/\bAl-?Masirah\b/gi, "אלמסירה"],
    [/\bAl-?Quds\b/gi, "קדס"],
    [/צבא ישראלי הורג/g, "צה\"ל הרג"],
    [/פלסטין הכבושה/g, "עזה"],
    [/occupied palestine/gi, "עזה"],
    [/^כתב\s+[^:]+:\s*/g, ""],
  ];
  for (const [re, to] of pairs) s = s.replace(re, to);
  s = s
    .replace(/המשך התוקפנות של ישראל/g, "תקיפות ישראליות")
    .replace(/התוקפנות של ישראל/g, "תקיפות ישראליות");
  return collapse(stripAlHyphen(s));
}

/** Arabic article אל is glued: אלג'זירה, never אל-ג'זירה. */
export function stripAlHyphen(text: string) {
  return (text ?? "").replace(/אל[\-־–—]\s*/g, "אל");
}

/** Leftover enemy-desk phrasing that was not recast into an Israeli desk report. */
export function isPropagandaCopy(text: string) {
  return /משטר ציוני|ישות ציונית|כיבוש ציוני|תוקפנות ציונית|פלסטין הכבושה|שהיד|ציוניים|الكيان|الصهيون|صهیون|זרעי רוואנש|זרע רוואנש/i.test(
    text ?? "",
  );
}

function eventHome(text: string): OriginHome | null {
  const x = text ?? "";
  const hit = /תקיפ|הפצצ|כטב|strike|airstrike|aggression|תוקפנות|عدوان|قصف|انفجار|פיצוץ/i.test(x);
  if (LEBANON_RE.test(x) && (hit || /חיזבאללה|ביירות|דאחי/.test(x))) return "lebanon";
  if (SYRIA_RE.test(x) && hit) return "syria";
  if (AXIS_RE.test(x) && /תימן|חות|houthi|yemen/i.test(x) && hit) return "yemen";
  if (AXIS_RE.test(x) && /עיראק|iraq|baghdad/i.test(x) && hit) return "iraq";
  if (IRAN_RE.test(x) && !LEBANON_RE.test(x) && !SYRIA_RE.test(x)) return "iran";
  if (LEBANON_RE.test(x)) return "lebanon";
  if (SYRIA_RE.test(x)) return "syria";
  return null;
}

/**
 * Theater belongs to its home outlet.
 * IRNA covering Israeli strikes in Lebanon with no Iranian speaker = drop.
 * Wires (US/UK) may cover the region. Pan-Arab may cover Arab theaters.
 * An official from the outlet's country speaking = keep.
 */
export function isOffTheater(text: string, source: string) {
  if (isDirectToThisOutlet(text, source)) return false;
  const where = outletHome(source);
  const event = eventHome(text);
  const who = speakerHome(text);
  if (!where || !event) return false;
  if (where === event) return false;
  if (who === where) return false;
  if (where === "us" || where === "uk") return false;
  if ((where === "qatar" || where === "gulf") && event !== "us" && event !== "iran" && event !== "uk") return false;
  return true;
}

export function deskHeadline(text: string) {
  return collapse(
    toDeskHebrew(text ?? "")
      .replace(/\*\*/g, "")
      .replace(/^\s*\d+[\.\)\-]\s*/, "")
      .replace(/^["«»״]+|["«»״]+$/g, ""),
  );
}

export function clipHeadline(text: string, max = 88) {
  return clip(deskHeadline(text), max);
}

export function formatOutlet(source: string) {
  let name = collapse(source ?? "").replace(/\/\s*טלגרם/g, "").replace(/\/\s*telegram/gi, "");
  const key = name.toLowerCase().replace(/^the\s+/, "");
  if (OUTLET_ALIASES[key]) return OUTLET_ALIASES[key];
  if (OUTLET_ALIASES[name.toLowerCase()]) return OUTLET_ALIASES[name.toLowerCase()];
  if (OUTLET_ALIASES[name]) return OUTLET_ALIASES[name];
  // Arabic outlets: never "אל-ג'זירה" / "קודס"
  name = stripAlHyphen(name).replace(/קודס/g, "קדס");
  return name;
}

/** Latin brands: דווח ב-NYT (never דווח ב-ה-NYT). Hebrew: דווח בקדס. */
export function attributionLead(source: string) {
  let o = formatOutlet(source);
  o = o.replace(/^ה-/, "");
  if (/[A-Za-z]/.test(o)) return `דווח ב-${o}`;
  return `דווח ב${o}`;
}

/** Truncated, garbled, hashtaggy, or calqued copy that is not a desk report. */
export function isWeakDeskCopy(text: string) {
  const s = (text ?? "").replace(/\s+/g, " ").trim();
  if (s.length < 20) return true;
  if (/…\s*$|\.\.\.\s*$/.test(s)) return true;
  if (/#|📷|🎥|📹/.test(s)) return true;
  if (/The New York Times|Washington Post|^Al Jazeera|reported in/i.test(s)) return true;
  if (/אל-/.test(s)) return true;
  if (/אומרים תושבים|residents say/i.test(s)) return true;
  if (/([\u0590-\u05FF])\1{2,}/.test(s)) return true;
  if (/^(?:החלה|מתחילים|מתחילה)\s+(?:תקיפה|פינוי)/.test(s) && s.length < 48) return true;
  if (/^כתב\s/.test(s)) return true;
  return false;
}

/** Domestic filler that is not a Mid-East desk exclusive. */
export function isOffDeskFiller(text: string) {
  const s = text ?? "";
  if (/סבסוד|חשמל|כרי[יה]|מיינר|מפרים|תחנה מרכזית|תחבורה|ביצועים של שנתיים|#דו["״]ח/i.test(s)) {
    if (!/סנקצ|הורמוז|טיל|תקיפ|חיזבאללה|חסד["״]ם|גרעין/.test(s)) return true;
  }
  if (/צדק להרג|תקופת אסד|עינויים מתקופת/.test(s) && !/כתב אישום|בית דין|האשמ/.test(s)) return true;
  if (/צבא ישראלי הורג|צה["״]ל הרג|פשיטה בכפר/.test(s) && !/לבנון|עזה|סוריה|תימן|איראן/.test(s)) return true;
  if (JUNK_RE.test(s)) return true;
  return false;
}

export function failsTickerQuality(text: string) {
  return isWeakDeskCopy(text) || isOffDeskFiller(text) || isPropagandaCopy(text) || tooMuchLatin(text);
}

export function isUsDomesticOffDesk(text: string) {
  const x = text ?? "";
  if (REGION_RE.test(x)) return false;
  if (/hormuz|hezbollah|houthi|irgc|\biran\b|lebanon|syria|yemen|gaza|iraq|איראן|לבנון|סוריה|תימן|עזה|הורמוז|חיזבאללה|חות/i.test(x)) return false;
  return /\bvance\b|ואנס|גיי די|\btrump\b|טראמפ|uber\b|nigeria|congress|senate|white house|הבית הלבן|campaign|ohio|governor|midterm|burgum|groundbreaking|\barch\b/i.test(x);
}

type OriginHome = "us" | "iran" | "lebanon" | "syria" | "yemen" | "iraq" | "gulf" | "russia" | "uk" | "qatar";

function outletHome(source: string): OriginHome | null {
  const s = `${source ?? ""}`;
  if (/אלג'זירה|aljazeera|ajanews|aj mubasher|aja news|קדס|quds/i.test(s)) return "qatar";
  if (/אלערביה|אלחדת|alarabiya|alhadath|אלשרק|aawsat|אלערבי אלג|alaraby|ארם|erem/i.test(s)) return "gulf";
  if (/פארס|תסנים|אירנא|מהר|נור|irib|snn|fars|tasnim|irna|mehr|nour|presstv/i.test(s)) return "iran";
  if (/אלג'דיד|mtv|אלמיאדין|אלמנאר|אלאח'באר|אלדיאר|aljadeed|almayadeen|almanar|al-akhbar|addiyar|דיאר/i.test(s)) return "lebanon";
  if (/אלמסירה|חות|ansarollah|almasirah/i.test(s)) return "yemen";
  if (/נאיה|סברין|שפק|ina|naya|sabren|shafaq/i.test(s)) return "iraq";
  if (/רויטרס|reuters|ה-nyt|ה-wsj|washington post|washington journal|cnn|abc|politico|bloomberg|fox|axios|ap\b|וושינגטון|white house/i.test(s)) return "us";
  if (/ה-telegraph|bbc|guardian|the times/i.test(s)) return "uk";
  if (/ספוטניק|rt\b|תאס|tass/i.test(s)) return "russia";
  if (/spa|wam|קטר|qna|kuna|עארב ניוז|arab news/i.test(s)) return "gulf";
  return null;
}

function speakerHome(text: string): OriginHome | null {
  const x = text ?? "";
  if (/טראמפ|\btrump\b|ואנס|\bvance\b|רוביו|\brubio\b|הבית הלבן|white house|pentagon|state department|הפנטגון|מחלקת המדינה|הגסת'|\bhegseth\b|וויטקוף|\bwitkoff\b|ביידן|\bbiden\b|הארים|\bharris\b|congress|senate|cia\b|centcom|סגן נשיא|نائب الرئيس|فانس|ترامب|البيت الأبيض/i.test(x)) return "us";
  if (/חמינאי|חמאנאי|פזשכיאן|קאליבאף|חסד["״]ם|משה["״]מ|אראקצ'י|\bkhamenei\b|pezeshkian|qalibaf|irgc|ara[gq]chi/i.test(x)) return "iran";
  if (/נסראללה|חיזבאללה|נעים קאסם|עון|ברי|מיקאתי|nasrallah|hezbollah|berri|aoun|mikati/i.test(x)) return "lebanon";
  if (/חות['׳]?ים|אנצאר אללה|משרע|houthi|ansarollah/i.test(x)) return "yemen";
  if (/סודאני|חשד|כתאיב|עצאיב|sudani|hashd|kataib|pmu/i.test(x)) return "iraq";
  if (/פוטין|קרמלין|לברוב|\bputin\b|lavrov|kremlin/i.test(x)) return "russia";
  if (/סטארמר|דאונינג|\bstarmer\b|downing street/i.test(x)) return "uk";
  if (/בן סלמאן|בן זאיד|תמים|mbs|mbz|\btamim\b/i.test(x)) return "gulf";
  return null;
}

function isDirectToThisOutlet(text: string, source: string) {
  const x = text ?? "";
  if (/(?:גורמים ל-|מסר(?:ו)? ל-|בראיון (?:ל|עם)|בשיחה עם|told|interview(?:ed)? (?:with|to)|speaking (?:to|with)|exclusive (?:to|with))/i.test(x)) {
    const o = formatOutlet(source);
    const blob = `${source} ${o}`;
    const tokens = blob.split(/[\s,./-]+/).filter((w) => w.length >= 3);
    for (const tok of tokens) {
      if (new RegExp(tok.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(x)) return true;
    }
  }
  return false;
}

/**
 * Drop relays: a US official quoted on Al Jazeera, an Iranian statement on Reuters, etc.
 * Keep only when this outlet IS the speaker's home, or they spoke directly to it.
 */
export function isOffPrimarySource(text: string, source: string) {
  if (isDirectToThisOutlet(text, source)) return false;
  if (isOffTheater(text, source)) return true;
  const who = speakerHome(text);
  const where = outletHome(source);
  if (!who || !where) return false;
  if (who === where) return false;
  if (who === "us" && (where === "us" || where === "uk")) return false;
  if (who === "uk" && (where === "uk" || where === "us")) return false;
  return true;
}

export function shortenSpeaker(name: string) {
  let s = collapse(toDeskHebrew(name ?? "")).replace(/\/\s*טלגרם/g, "");
  if (!s) return "";
  for (const [re, alias] of SPEAKER_ALIASES) {
    if (re.test(s)) return alias;
  }
  s = s
    .replace(/^(?:נשיא|ראש הממשלה|רה["״]מ|איתוללה|ד״ר|ד"ר|פרופ['׳])\s+/u, "")
    .replace(/^(?:president|pm|prime minister|ayatollah|dr\.?|secretary)\s+/i, "");
  s = collapse(s);
  if (s.length > 28) s = clip(s, 28).replace(/…$/, "");
  return s;
}

export function fingerprint(url: string, text: string) {
  const s = `${url ?? ""}|${collapse(text ?? "")}`;
  let h1 = 2166136261;
  let h2 = 5381;
  for (let i = 0; i < s.length; i += 1) {
    const c = s.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 16777619);
    h2 = (h2 * 33) ^ c;
  }
  const a = (h1 >>> 0).toString(16).padStart(8, "0");
  const b = (h2 >>> 0).toString(16).padStart(8, "0");
  let h3 = 0;
  for (let i = s.length - 1; i >= 0; i -= 1) h3 = (h3 * 31 + s.charCodeAt(i)) >>> 0;
  const c = h3.toString(16).padStart(8, "0");
  return `${a}${b}${c}`.slice(0, 24);
}

export function classifyArena(text: string): ArenaId | null {
  const t = text ?? "";
  // Iran first — never park Iran under מפרציות / בינ״ל
  if (IRAN_RE.test(t)) return "iran";
  const leb = LEBANON_RE.test(t);
  const syr = SYRIA_RE.test(t);
  if (leb && !syr) return "lebanon";
  if (syr && !leb) return "north";
  if (leb && syr) return "north";
  if (leb) return "lebanon";
  if (AXIS_RE.test(t)) return "axis";
  if (GULF_GEO_RE.test(t) && isGulfPolitics(t) && !IRAN_RE.test(t)) return "gulf";
  if (GULF_GEO_RE.test(t) && !IRAN_RE.test(t)) return "gulf";
  if (TURKEY_RE.test(t)) return "turkey";
  if (REGION_ARENA_RE.test(t)) return "region";
  return null;
}

/** Content wins over RSS host hint. Iran subject → iran even if outlet is Gulf/US. */
export function resolveArena(text: string, hint?: string | null): ArenaId {
  const t = text ?? "";
  const byContent = classifyArena(t);
  if (byContent === "iran" || IRAN_RE.test(t)) return "iran";
  if (byContent) {
    if (byContent === "gulf" && !isGulfPolitics(t)) return "intl";
    return byContent;
  }
  const hintId =
    hint && (hint in ARENA_META) ? (hint as ArenaId) : null;
  if (hintId === "gulf") {
    if (IRAN_RE.test(t)) return "iran";
    if (isGulfPolitics(t)) return "gulf";
    return "intl";
  }
  if (hintId) return hintId;
  return "intl";
}

export function isRegional(text: string) {
  return REGION_RE.test(text ?? "");
}

export function isDeskStory(text: string) {
  const t = text ?? "";
  if (JUNK_RE.test(t)) return false;
  if (DESK_RE.test(t)) return true;
  const arena = classifyArena(t);
  return arena === "iran" || arena === "lebanon" || arena === "north" || arena === "axis";
}

export function isGulfPolitics(text: string) {
  const t = text ?? "";
  if (!GULF_GEO_RE.test(t)) return false;
  if (JUNK_RE.test(t)) return false;
  if (/(oil price|brent|wti|תעריף הנפט|מחיר הנפט)/i.test(t) && !GULF_POL_RE.test(t)) {
    return false;
  }
  return GULF_POL_RE.test(t) || /(בן סלמאן|בן זאיד|תמים|אל־סעוד|آل سعود)/.test(t);
}

export function isJunkItem(speaker: string, body: string, url = "") {
  const bd = collapse(body ?? "");
  if (bd.length < 8) return true;
  const t = `${speaker ?? ""} ${bd} ${url ?? ""}`;
  if (JUNK_RE.test(t)) return true;
  if (MEDIA_IL_RE.test(t) && !/נתניהו|שר הביטחון|צה["״]ל|לשכת רמ["״]מ/.test(bd)) {
    return true;
  }
  if (/^\s*https?:\/\//i.test(bd)) return true;
  if (/2026-\d{2}-\d{2}T/.test(bd) && bd.length < 48) return true;
  if (!hasHebrew(bd) && bd.length < 24) return true;
  return false;
}

function eventTokens(s: string) {
  const key = s
    .replace(/\*\*/g, "")
    .replace(/איראן|לבנון|זירה צפונית|הציר|המפרציות|תורכיה|באזור|בינ["״]ל/g, " ")
    .replace(/[|:：,.;!?()[\]{}"«»״]/g, " ")
    .toLowerCase();
  const out = new Set<string>();
  for (const w of key.split(/\s+/)) {
    if (w.length < 3 || STOP.has(w)) continue;
    out.add(w);
  }
  return out;
}

export function sameEvent(a: string, b: string) {
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
  return jaccard >= 0.42 || (overlap >= 0.72 && inter >= 3);
}

export function shapeCopy(speaker: string, body: string, url = "") {
  let sp = shortenSpeaker(speaker ?? "");
  let bd = toDeskHebrew(body ?? "");
  bd = bd.replace(/\s*20\d{2}-\d{2}-\d{2}T[\d:.Z+-]+/g, "").trim();
  bd = bd.replace(/^\s*(?:BREAKING|عاجل|דחוף|عاجل جدا|מבזק)\s*[:\-–]\s*/i, "");
  if (sp) {
    const escaped = sp.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    bd = bd.replace(new RegExp(`^${escaped}\\s*[:：]\\s*`), "");
  }
  bd = collapse(bd).replace(/^["«»״]+|["«»״]+$/g, "").trim();
  if (isPropagandaCopy(bd)) {
    return { speaker: sp, body: "" };
  }
  if (sp && MEDIA_IL_RE.test(sp)) sp = "";
  if (isIsraeliVoice(sp, bd, url) && MEDIA_IL_RE.test(`${sp} ${url}`)) {
    if (!/^(נתניהו|שר הביטחון|משהב["״]ט|צה["״]ל|הלוי|זמיר|קץ|כץ|לשכת רמ["״]מ)$/.test(sp)) {
      sp = "";
    }
  }
  return { speaker: sp, body: bd };
}

export function flagsForItems(items: CopyBits[] = []) {
  const blob = items.map(blobOf).join(" ");
  const found: string[] = [];
  for (const { re, code } of FLAG_HINTS) {
    if (re.test(blob) && !found.includes(code)) found.push(code);
  }
  return found;
}

export function arenaPresentation(
  id: ArenaId,
  items: Array<CopyBits | BriefingItem> = [],
): { title: string; flags: string[] } {
  const meta = ARENA_META[id] ?? ARENA_META.intl;
  if (id === "intl") return { title: "בינ״ל", flags: ["globe"] };
  if (id === "iran") return { title: "איראן", flags: ["ir"] };
  const found = flagsForItems(items).map((c) => c.toLowerCase());
  // Desk: US mention inside a regional item does not add 🇺🇸
  const filtered = found.filter((c) => c !== "us");
  const names: Record<string, string> = {
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
    tr: "תורכיה",
  };
  if (id === "axis" && filtered.length === 1 && names[filtered[0]]) {
    return { title: names[filtered[0]], flags: filtered };
  }
  if (id === "gulf") {
    const gulfOnly = filtered.filter((c) => ["sa", "ae", "qa", "kw", "bh", "om"].includes(c));
    if (gulfOnly.length === 1 && names[gulfOnly[0]]) {
      return { title: names[gulfOnly[0]], flags: gulfOnly };
    }
    return { title: "המפרציות", flags: gulfOnly.length ? gulfOnly : ["sa", "ae"] };
  }
  if (filtered.length === 1 && names[filtered[0]]) {
    return { title: names[filtered[0]], flags: filtered };
  }
  if (filtered.length) {
    return { title: meta.title, flags: filtered.slice(0, 4) };
  }
  return { title: meta.title, flags: [...meta.flags] };
}

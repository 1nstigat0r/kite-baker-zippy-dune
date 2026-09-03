const TZ = "Asia/Jerusalem";

const MONTHS_HE = [
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
  "דצמבר",
];

function partsFor(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

export function israelParts(date = new Date()) {
  return partsFor(date);
}

export function hourKey(date = new Date()) {
  const p = partsFor(date);
  let hour = Number(p.hour);
  let min = Number(p.minute);
  if (min >= 45) {
    hour = (hour + 1) % 24;
    min = 0;
  } else if (min >= 15) {
    min = 30;
  } else {
    min = 0;
  }
  return `${p.year}-${p.month}-${p.day}T${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export function hourLabelFromKey(key: string) {
  const m = key.match(/T(\d{2})(?::(\d{2}))?$/);
  if (!m) return key;
  return `${m[1]}:${m[2] ?? "00"}`;
}

export function dateLabelFromKey(key: string) {
  const day = Number(key.slice(8, 10));
  const month = Number(key.slice(5, 7));
  return `${day} ב${MONTHS_HE[month - 1]}`;
}

export function formatHeDateTime(date: Date) {
  const p = partsFor(date);
  const day = Number(p.day);
  const month = Number(p.month);
  return `${day} ב${MONTHS_HE[month - 1]}, ${p.hour}:${p.minute}`;
}

export function formatHeClock(date: Date) {
  const p = partsFor(date);
  return `${p.hour}:${p.minute}`;
}

export function todayDateLabel(date = new Date()) {
  const p = partsFor(date);
  return `${Number(p.day)} ב${MONTHS_HE[Number(p.month) - 1]}`;
}

export function parsePossiblyUtc(value: string | Date | null | undefined) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export { MONTHS_HE, TZ };

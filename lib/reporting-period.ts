const BUSINESS_TIME_ZONE = "Asia/Kolkata";
const IST_OFFSET_MINUTES = 330;

function istParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: BUSINESS_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
  const parts = Object.fromEntries(formatter.formatToParts(date).filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]));
  return parts as Record<string, number>;
}

function utcFromIst(year: number, month: number, day: number, hour: number) { return new Date(Date.UTC(year, month - 1, day, hour, -IST_OFFSET_MINUTES, 0)); }

export function getBusinessWeekBounds(now = new Date()) {
  const current = istParts(now);
  const currentUtc = new Date(Date.UTC(current.year, current.month - 1, current.day));
  const mondayOffset = (currentUtc.getUTCDay() + 6) % 7;
  currentUtc.setUTCDate(currentUtc.getUTCDate() - mondayOffset);
  const start = utcFromIst(currentUtc.getUTCFullYear(), currentUtc.getUTCMonth() + 1, currentUtc.getUTCDate(), 0);
  const end = new Date(start); end.setUTCDate(end.getUTCDate() + 7);
  return { timeZone: BUSINESS_TIME_ZONE, start: start.toISOString(), end: end.toISOString() };
}


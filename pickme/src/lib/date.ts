import type { ISODate, ISODateTime } from "./api-types";

/** Local calendar date as "YYYY-MM-DD" (the API's date format). */
export function todayISO(date = new Date()): ISODate {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "3:05 PM" from a UTC ISO datetime, in the device's local zone. */
export function formatClockTime(iso: ISODateTime | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Signed seconds until an ISO datetime (negative = in the past). */
export function secondsUntil(iso: ISODateTime | null, now = Date.now()): number {
  if (!iso) return 0;
  return Math.round((new Date(iso).getTime() - now) / 1000);
}

/** Compact "in 1h 20m" / "in 45m" / "now" countdown label. */
export function formatCountdown(iso: ISODateTime | null): string {
  const secs = secondsUntil(iso);
  if (!iso) return "—";
  if (secs <= 0) return "now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `in ${hours}h ${rem}m` : `in ${hours}h`;
}

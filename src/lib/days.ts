const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Whole calendar days between the local date of `iso` and today's local date
 * (never negative). This rolls the count over at local midnight rather than at
 * the time of day the count started, which is what people expect from a
 * day counter. Both ends are snapped to local midnight before subtracting, and
 * the gap is rounded, so DST transitions (a 23- or 25-hour "day") don't skew it.
 */
export function calendarDaysSince(iso: string): number {
  const start = new Date(iso);
  if (Number.isNaN(start.getTime())) return 0;
  const now = new Date();
  const startMidnight = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  ).getTime();
  const todayMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  return Math.max(0, Math.round((todayMidnight - startMidnight) / MS_PER_DAY));
}

/** Locale date string for the "Since ..." subtitle. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Whole days elapsed since the given ISO timestamp (never negative). */
export function daysSince(iso: string): number {
  const start = new Date(iso).getTime();
  if (Number.isNaN(start)) return 0;
  return Math.max(0, Math.floor((Date.now() - start) / MS_PER_DAY));
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

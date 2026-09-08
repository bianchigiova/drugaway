import { useCallback, useEffect, useState } from "react";
import { calendarDaysSince } from "../lib/days";
import { getDayCountMax, setDayCountMax } from "../lib/prefs";

/**
 * Derives the sober-day count from a fixed start timestamp. Nothing is persisted
 * per-day — the number simply recomputes:
 *   - every 60s (covers the app being left open across midnight),
 *   - whenever the tab regains focus / visibility (covers reopening the app).
 *
 * `startISO` changing (a reset) immediately re-derives the count.
 *
 * The raw figure is calendar days since the start date, so it ticks over at
 * local midnight. Crossing into a timezone behind the previous one could nudge
 * that backwards, so the result is clamped to a stored high-water mark that only
 * ever rises — until the spell restarts, which clears it (see prefs).
 */
export function useDayCount(startISO: string): number {
  const [count, setCount] = useState(() => derive(startISO));

  const refresh = useCallback(() => {
    setCount(derive(startISO));
  }, [startISO]);

  useEffect(() => {
    refresh();
    const interval = window.setInterval(refresh, 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  return count;
}

function derive(startISO: string): number {
  const days = Math.max(calendarDaysSince(startISO), getDayCountMax());
  setDayCountMax(days);
  return days;
}

import { useCallback, useEffect, useState } from "react";
import { daysSince } from "../lib/days";

/**
 * Derives the sober-day count from a fixed start timestamp. Nothing is persisted
 * per-day — the number simply recomputes:
 *   - every 60s (covers the app being left open across midnight),
 *   - whenever the tab regains focus / visibility (covers reopening the app).
 *
 * `startISO` changing (a reset) immediately re-derives the count.
 */
export function useDayCount(startISO: string): number {
  const [count, setCount] = useState(() => daysSince(startISO));

  const refresh = useCallback(() => {
    setCount(daysSince(startISO));
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

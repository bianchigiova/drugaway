import { useCallback, useEffect, useState } from "react";
import { computeStats, type Stats } from "../lib/stats";

/**
 * Recomputes the stats whenever the screen is shown or refocused, and once a
 * minute while open, so the "longest (current)" spell and averages stay live.
 */
export function useStats(): Stats {
  const [stats, setStats] = useState(() => computeStats());

  const refresh = useCallback(() => setStats(computeStats()), []);

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

  return stats;
}

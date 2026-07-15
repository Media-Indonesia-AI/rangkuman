"use client";

import { useEffect, useState } from "react";
import type { KeyMetrics } from "@/lib/api";
import { loadKeyMetrics } from "@/lib/api/cache";

/**
 * Data hook for `GET stocks/key-metrics/{ticker}`.
 *
 * Wraps `loadKeyMetrics()` (the per-ticker request-deduping cache
 * wrapper) with React state + a cancel-on-unmount guard. Two mounts
 * of the same ticker share one network round-trip via the cache
 * module's `inflight` Map; switching tickers triggers a fresh
 * fetch.
 *
 * State resets on every `ticker` change so the widget never
 * renders stale data from a previous ticker while the new fetch
 * is in flight — important on `/stock/[kode]` where the param
 * changes between navigations.
 *
 * On error the hook returns `data: null` so consumers can fall
 * back to their placeholder rendering without an extra null check
 * beyond the existing "data is loading" path. `isLoading` flips
 * to `false` once the fetch settles either way.
 *
 * @param ticker  Ticker code, e.g. `"ANTM"`. Uppercased inside
 *                `loadKeyMetrics`, so callers can pass any case.
 */
export function useKeyMetrics(
  ticker: string,
): { data: KeyMetrics | null; isLoading: boolean } {
  const [data, setData] = useState<KeyMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Reset on ticker change so a fast ticker switch doesn't briefly
    // show the previous ticker's data alongside the new loading state.
    setData(null);
    setIsLoading(true);

    void loadKeyMetrics(ticker)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        // Swallow — widget renders its graceful placeholder; `data`
        // stays `null` and the consumer treats that the same as
        // "still loading".
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ticker]);

  return { data, isLoading };
}

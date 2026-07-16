"use client";

import { useEffect, useState } from "react";
import type { CommodityHistoricalPoint } from "@/lib/api/types/commodity-historical";
import { loadCommodityHistorical } from "@/lib/api/cache";

/**
 * Data hook for `GET commodities/historical?symbol=...&period=...`.
 *
 * Wraps `loadCommodityHistorical()` (the per-(symbol, period)
 * request-deduping cache wrapper) with React state + a
 * cancel-on-unmount guard. Two mounts of the same pair share
 * one network round-trip via the cache module's `inflight`
 * Map; changing either param triggers a fresh fetch.
 *
 * State resets on every `(symbol, period)` change so the chart
 * never renders stale data from a previous query while the new
 * fetch is in flight.
 *
 * On error the hook returns `data: null` so consumers can render
 * their graceful empty-state without an extra null check beyond
 * the existing "data is loading" path. `isLoading` flips to
 * `false` once the fetch settles either way.
 *
 * @param symbol  Wire symbol code (e.g. `"PLO:COM"`). Pass `""`
 *                for the wildcard / default series. Uppercased
 *                inside `loadCommodityHistorical`, so callers can
 *                pass any case.
 * @param period  Time-window code (default `"1M"`). Common values:
 *                `"1D"`, `"5D"`, `"1M"`, `"3M"`, `"6M"`, `"1Y"`,
 *                `"YTD"`, `"ALL"`.
 */
export function useCommodityHistorical(
  symbol: string,
  period = "1M",
): { data: CommodityHistoricalPoint[] | null; isLoading: boolean } {
  const [data, setData] = useState<CommodityHistoricalPoint[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Reset on (symbol, period) change so a fast param switch
    // doesn't briefly show the previous query's series alongside
    // the new loading state.
    setData(null);
    setIsLoading(true);

    void loadCommodityHistorical(symbol, period)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        // Swallow — widget renders its graceful empty state;
        // `data` stays `null` and the consumer treats that the
        // same as "still loading".
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [symbol, period]);

  return { data, isLoading };
}
"use client";

import { useEffect, useState } from "react";
import type { StockHistoricalPoint } from "@/lib/api";
import { loadStockHistorical } from "@/lib/api/cache";

/**
 * Data hook for `GET stocks/stock/historical?ticker=...`.
 *
 * Wraps `loadStockHistorical()` (the per-ticker request-deduping
 * cache wrapper) with React state + a cancel-on-unmount guard.
 * Two mounts of the same ticker share one network round-trip via
 * the cache module's `inflight` Map; switching tickers triggers
 * a fresh fetch.
 *
 * State resets on every `ticker` change so the chart never renders
 * stale data from a previous ticker while the new fetch is in
 * flight — important on `/stock/[kode]` where the param changes
 * between navigations.
 *
 * On error the hook returns `data: null` so consumers can render
 * their graceful empty-state without an extra null check beyond
 * the existing "data is loading" path. `isLoading` flips to
 * `false` once the fetch settles either way.
 *
 * @param ticker  Ticker code, e.g. `"ANTM"`. Uppercased inside
 *                `loadStockHistorical`, so callers can pass any
 *                case.
 */
export function useStockHistorical(
  ticker: string,
): { data: StockHistoricalPoint[] | null; isLoading: boolean } {
  const [data, setData] = useState<StockHistoricalPoint[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Reset on ticker change so a fast ticker switch doesn't briefly
    // show the previous ticker's series alongside the new loading
    // state.
    setData(null);
    setIsLoading(true);

    void loadStockHistorical(ticker)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        // Swallow — widget renders its graceful empty state; `data`
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

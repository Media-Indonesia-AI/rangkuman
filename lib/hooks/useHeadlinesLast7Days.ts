"use client";

import { useEffect, useState } from "react";
import type { HeadlineLast7DaysItem } from "@/lib/api";
import { loadHeadlinesLast7Days } from "@/lib/api/cache";

/**
 * Data hook for `GET headlines/last-7-days`.
 *
 * Wraps `loadHeadlinesLast7Days(ticker, date)` (the (ticker, date)
 * request-deduping cache wrapper) with React state and a
 * cancel-on-unmount guard. Concurrent mounts for the same (ticker,
 * date) share one network round-trip via the cache module.
 *
 * On error the hook returns an empty array so consumers can fall back
 * to their empty state without an extra null-check — same convention
 * as `useListStory` / `useHeadlines`. `isLoading` flips to `false`
 * once the fetch settles either way.
 *
 * The call is suppressed (and `data` cleared) when disabled or when
 * `ticker` is blank, so no wasted `ticker=` request fires before the
 * page's ticker is known.
 *
 * @param ticker  Ticker code (e.g. `"ANTM"`). Uppercased inside the
 *                cache/request layer, so callers can pass any case.
 * @param date    Reference date as `YYYY-MM-DD` — the 7-day window
 *                ends on this date. Defaults to today.
 * @param enabled When `false`, suppresses the network call and returns
 *                an empty data array (default `true`).
 */
export function useHeadlinesLast7Days(
  ticker: string,
  enabled = true,
): { data: HeadlineLast7DaysItem[]; isLoading: boolean } {
  const active = enabled && ticker.trim().length > 0;
  const [data, setData] = useState<HeadlineLast7DaysItem[]>([]);
  // Start in the loading state only when we're actually going to fetch,
  // so a disabled/blank-ticker mount renders its fallback without a
  // shimmer flash.
  const [isLoading, setIsLoading] = useState(active);

  useEffect(() => {
    if (!active) {
      setData([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    void loadHeadlinesLast7Days(ticker)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        // Swallow — the consumer falls back to its empty state.
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [active, ticker]);

  return { data, isLoading };
}

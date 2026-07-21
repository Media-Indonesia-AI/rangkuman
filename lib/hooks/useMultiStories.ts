"use client";

import { useEffect, useState } from "react";
import type { HeadlineLast7DaysItem } from "@/lib/api";
import { loadMultiDateStories } from "@/lib/api/cache";

/**
 * Data hook for `GET headlines/multi-date-stories`.
 *
 * Wraps `loadMultiDateStories(ticker, limit, page)` (the
 * (ticker, limit, page) request-deduping cache wrapper) with React
 * state and a cancel-on-unmount guard. Concurrent mounts for the same
 * tuple share one network round-trip via the cache module.
 *
 * On error the hook returns an empty array so consumers can fall back
 * to their empty state without an extra null-check — same convention
 * as `useHeadlinesLast7Days` / `useListStory`. `isLoading` flips to
 * `false` once the fetch settles either way.
 *
 * The call is suppressed (and `data` cleared) when disabled or when
 * `ticker` is blank, so no wasted `ticker=` request fires before the
 * ticker is known.
 *
 * @param ticker  Ticker code (e.g. `"BBCA"`). Uppercased inside the
 *                cache/request layer, so callers can pass any case.
 * @param limit   How many stories per page (default 5).
 * @param page    1-based page number (default 1).
 * @param enabled When `false`, suppresses the network call and returns
 *                an empty data array (default `true`).
 */
export function useMultiStories(
  ticker: string,
  limit = 5,
  page = 1,
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

    void loadMultiDateStories(ticker, limit, page)
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
  }, [active, ticker, limit, page]);

  return { data, isLoading };
}

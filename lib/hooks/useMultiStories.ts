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
 * The endpoint returns `{ data: HeadlineLast7DaysItem[]; total: number }`
 * — `total` is the cross-page story count, independent of how many
 * items the current page actually shipped. The hook surfaces both
 * so callers can render "Lihat semua (N)" against the real total
 * instead of `data.length` (which only tells you what the current
 * page fetched). `total` stays `0` while loading, on error, or when
 * the call is disabled — consumers can read it without an extra
 * null-check.
 *
 * On error the hook returns `{ data: [], total: 0, isLoading: false }`
 * so consumers can fall back to their empty state without an extra
 * null-check — same convention as `useHeadlinesLast7Days` /
 * `useListStory`. `isLoading` flips to `false` once the fetch
 * settles either way.
 *
 * `ticker` is optional: pass a non-empty string to scope the feed to
 * one emiten (the per-ticker `/stock/[kode]` widget), or omit it
 * (or pass `""`) for the cross-ticker feed (the `/story/` listing).
 * In the cross-ticker case the underlying `loadMultiDateStories`
 * drops the `ticker=` query param entirely, so the request still
 * fires — only the network-suppressed case is `enabled: false`.
 *
 * @param ticker  Optional ticker code (e.g. `"BBCA"`). Uppercased
 *                inside the cache/request layer, so callers can pass
 *                any case. Empty / `undefined` → cross-ticker feed.
 * @param limit   How many stories per page (default 5).
 * @param page    1-based page number (default 1).
 * @param enabled When `false`, suppresses the network call and returns
 *                empty data + zero total (default `true`).
 */
export function useMultiStories(
  ticker?: string,
  limit = 5,
  page = 1,
  enabled = true,
): {
  data: HeadlineLast7DaysItem[];
  /** Cross-page total from the API response. `0` while loading, on
   *  error, or when the call is disabled — never `undefined`. */
  total: number;
  isLoading: boolean;
} {
  const [data, setData] = useState<HeadlineLast7DaysItem[]>([]);
  const [total, setTotal] = useState(0);
  // Start in the loading state only if we're actually going to fetch,
  // so a disabled mount renders its fallback without a shimmer flash.
  // The blank-ticker case no longer suppresses the fetch — it routes
  // through to the cross-ticker feed instead.
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setData([]);
      setTotal(0);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    void loadMultiDateStories(ticker, limit, page)
      .then((res) => {
        if (cancelled) return;
        setData(res.data);
        setTotal(res.total);
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
  }, [enabled, ticker, limit, page]);

  return { data, total, isLoading };
}

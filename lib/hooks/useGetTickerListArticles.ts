"use client";

import { useEffect, useState } from "react";
import type { StoryFilter, TickerListItem } from "@/lib/api";
import { loadTickerListArticles } from "@/lib/api/cache";

/**
 * Data hook for `GET stocks/ticker-information` (the article list).
 *
 * Wraps `loadTickerListArticles()` (the request-deduping cache
 * wrapper) with React state + a cancel-on-unmount guard. Two mounts
 * with the same `(limit, page, filters)` share one network
 * round-trip via the cache module's `inflight` Map; switching any of
 * those params triggers a fresh fetch.
 *
 * State resets whenever `(limit, page, filters)` changes so the
 * widget never renders stale rows from a previous query while the
 * new fetch is in flight.
 *
 * On error the hook returns an empty array so consumers can render
 * their fallback without an extra null-check — same convention as
 * `useListStory`, `useHeadlines`, and `useTopics`.
 *
 * Pass `enabled: false` to skip the network call entirely. Useful
 * when the filter the hook would use isn't available yet (e.g. the
 * ticker code for a deep-linked ticker page hasn't resolved). While
 * disabled, the hook returns `{ data: [], isLoading: false }` — the
 * data is cleared so stale results from a previous mount don't leak
 * through once the gate opens.
 *
 * @param limit   Page size (default 20, matching the API's default).
 * @param page    Page index (default 0).
 * @param filters Structured `{ field, operator, value }` filters to
 *                narrow the result set (default `[]`). Same list
 *                passed twice always lands on the same cache slot,
 *                e.g. `[{ field: "stock_ticker", operator: "eq",
 *                value: "ANTM" }]`.
 * @param enabled When `false`, suppresses the network call and
 *                returns an empty data array (default `true`).
 */
export function useGetTickerListArticles(
  limit = 20,
  page = 0,
  filters: StoryFilter[] = [],
  enabled = true,
): { data: TickerListItem[]; isLoading: boolean } {
  const [data, setData] = useState<TickerListItem[]>([]);
  // Start in the "loading" state only if we're actually going to
  // fetch. If the consumer opens with `enabled: false`, there's
  // nothing pending, so consumers can render their fallback
  // immediately without a shimmer flash.
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setData([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    void loadTickerListArticles(limit, page, filters)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        // Swallow — the consumer falls back to its placeholder state;
        // `data` stays `[]` so the empty-state UI still triggers.
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, limit, page, filters]);

  return { data, isLoading };
}

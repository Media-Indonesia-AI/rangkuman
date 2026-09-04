"use client";

import { useEffect, useState } from "react";
import type { StoryFilter, StoryItem } from "@/lib/api";
import { loadHeadlines } from "@/lib/api/cache";

/**
 * Data hook for the "Latest Headlines" widget on `/saham`. Wraps
 * `loadHeadlines()` (the request-deduping cache wrapper) with React
 * state + a cancel-on-unmount guard.
 *
 * Concurrent mounts of the widget (React 18 strict-mode double-invoke,
 * or two `<LatestHeadlines />` instances on the same page) share a
 * single network round-trip — the second call gets the same
 * `Promise<StoryResponse>` back from the `inflightHeadlines` Map.
 * After resolution, both callers receive the same array.
 *
 * On error the hook returns an empty array so consumers can fall back
 * to mock data without an extra null-check — same convention as
 * `useTrendingStories`. The `isLoading` flag flips to `false` once
 * the fetch settles either way, so the widget can drop its shimmer.
 *
 * Pass `enabled: false` to skip the network call entirely. Useful
 * when the filter the hook would use isn't available yet (e.g. the
 * `topic_id` from `<TopicsProvider />` hasn't resolved). While
 * disabled, the hook returns `{ data: [], isLoading: false }` — the
 * data is cleared so stale results from a previous mount don't leak
 * through once the gate opens. Mirrors the `useListStory` convention.
 *
 * @param limit   How many stories to fetch (default 10, matching the
 *                backend's default).
 * @param skip    How many stories to skip (default 0).
 * @param filters Structured `{ field, operator, value }` filters
 *                (default `[]`). Same list passed twice always lands
 *                on the same cache slot.
 * @param enabled When `false`, suppresses the network call and
 *                returns an empty data array (default `true`).
 */
export function useHeadlines(
  limit = 10,
  skip = 0,
  filters: StoryFilter[] = [],
  enabled = true,
): { data: StoryItem[]; isLoading: boolean } {
  const [data, setData] = useState<StoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setData([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    void loadHeadlines(limit, skip, filters)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        // Swallow — the widget falls back to its mock headlines.
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, limit, skip, filters]);

  return { data, isLoading };
}
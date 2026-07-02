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
 * @param limit   How many stories to fetch (default 10, matching the
 *                backend's default).
 * @param skip    How many stories to skip (default 0).
 * @param filters Structured `{ field, operator, value }` filters
 *                (default `[]`). Same list passed twice always lands
 *                on the same cache slot.
 */
export function useLatestStories(
  limit = 10,
  skip = 0,
  filters: StoryFilter[] = [],
): { data: StoryItem[]; isLoading: boolean } {
  const [data, setData] = useState<StoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
  }, [limit, skip, filters]);

  return { data, isLoading };
}
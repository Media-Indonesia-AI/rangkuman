"use client";

import { useEffect, useState } from "react";
import { type TrendingStory } from "@/lib/api";
import { loadTrendingStories } from "@/lib/api/cache";

/**
 * Data hook for the "Paling banyak diberitakan" section on `/saham`.
 * Wraps `loadTrendingStories()` (the request-deduping cache wrapper)
 * with React state + a cancel-on-unmount guard.
 *
 * Concurrent mounts of the component (e.g. React 18 strict-mode
 * double-invoke, or two `<PalingBanyakDiberitakan />` instances on
 * the same page) share a single network round-trip — the second call
 * gets the same `Promise<TrendingStoriesResponse>` back from the
 * `inflightTrendingStories` Map. After resolution, both callers
 * receive the same array.
 *
 * The first 20 stories by default, matching the API's own default.
 * The same `(limit, source)` tuple applies to the dedup key — two
 * mounts with different limits or sources each get their own fetch.
 *
 * @param limit  How many stories to fetch (default 20).
 * @param source Source identifier for the feed (default `"sahamrakyat"`).
 */
export function useTrendingStories(
  limit = 20,
  source = "sahamrakyat",
): { data: TrendingStory[]; isLoading: boolean } {
  const [data, setData] = useState<TrendingStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void loadTrendingStories(limit, source)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        // Swallow — the widget renders a graceful empty state on error.
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [limit, source]);

  return { data, isLoading };
}
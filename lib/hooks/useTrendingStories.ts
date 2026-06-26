"use client";

import { useEffect, useState } from "react";
import { api, type TrendingStory } from "@/lib/api";

/**
 * Data hook for the "Paling banyak diberitakan" section on `/saham`.
 * Wraps `api.getTrendingStories()` with React state + a cancel-on-unmount
 * guard. The endpoint is deduped by [lib/api/cache.ts] if/when a cache
 * wrapper is added.
 *
 * Returns the first 20 stories by default, matching the API's own
 * default. The same limit applies to the dedup key in the cache
 * layer — two mounts with the same `(limit, source)` tuple share one
 * network round-trip.
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

    void api
      .getTrendingStories(limit, source)
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
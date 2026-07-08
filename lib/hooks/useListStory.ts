"use client";

import { useEffect, useState } from "react";
import type { EmbeddedStory, StoryFilter } from "@/lib/api";
import { loadListStory } from "@/lib/api/cache";

/**
 * Data hook for callers that want to enumerate the stories list
 * (typically filtered by `headline_id` to get the related stories
 * for a deep-linked headline). Wraps `loadListStory()` (the
 * request-deduping cache wrapper) with React state + a
 * cancel-on-unmount guard.
 *
 * Concurrent mounts of the widget (React 18 strict-mode double-invoke,
 * or two consumer instances on the same page) share a single network
 * round-trip — the second call gets the same
 * `Promise<StoryListResponse>` back from the `inflightListStories`
 * Map. After resolution, both callers receive the same array.
 *
 * On error the hook returns an empty array so consumers can fall back
 * to mock or alternate data without an extra null-check — same
 * convention as `useLatestStories`, `useTopics`, and
 * `useTrendingStories`. The `isLoading` flag flips to `false` once
 * the fetch settles either way, so the widget can drop its shimmer.
 *
 * @param limit   How many stories to fetch (default 10, matching
 *                the backend's default).
 * @param skip    How many stories to skip (default 0).
 * @param filters Structured `{ field, operator, value }` filters
 *                (default `[]`). Same list passed twice always lands
 *                on the same cache slot.
 */
export function useListStory(
  limit = 10,
  skip = 0,
  filters: StoryFilter[] = [],
): { data: EmbeddedStory[]; isLoading: boolean } {
  const [data, setData] = useState<EmbeddedStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void loadListStory(limit, skip, filters)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        // Swallow — the consumer falls back to mock or alternate data.
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
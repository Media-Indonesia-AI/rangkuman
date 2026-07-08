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
 * Pass `enabled: false` to skip the network call entirely. Useful
 * when the filter the hook would use isn't available yet (e.g. the
 * headline ID for a deep-linked detail hasn't resolved). While
 * disabled, the hook returns `{ data: [], isLoading: false }` — the
 * data is cleared so stale results from a previous mount don't leak
 * through once the gate opens.
 *
 * @param limit   How many stories to fetch (default 10, matching
 *                the backend's default).
 * @param skip    How many stories to skip (default 0).
 * @param filters Structured `{ field, operator, value }` filters
 *                (default `[]`). Same list passed twice always lands
 *                on the same cache slot.
 * @param enabled When `false`, suppresses the network call and
 *                returns an empty data array (default `true`).
 */
export function useListStory(
  limit = 10,
  skip = 0,
  filters: StoryFilter[] = [],
  enabled = true,
): { data: EmbeddedStory[]; isLoading: boolean } {
  const [data, setData] = useState<EmbeddedStory[]>([]);
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
  }, [enabled, limit, skip, filters]);

  return { data, isLoading };
}
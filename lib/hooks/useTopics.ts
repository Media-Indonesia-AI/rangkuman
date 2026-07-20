"use client";

import { useEffect, useState } from "react";
import type { StoryFilter, StoryTopic } from "@/lib/api";
import { loadTopic } from "@/lib/api/cache";

/**
 * Data hook for the topic-tab menu on the General News Feed.
 * Wraps `loadTopic()` (the request-deduping cache wrapper) with React
 * state + a cancel-on-unmount guard.
 *
 * Concurrent mounts (React 18 strict-mode double-invoke, or two
 * `<GeneralNewsFeed />` instances on the same page) share a single
 * network round-trip — the second call gets the same
 * `Promise<TopicResponse>` back from the `inflightTopics` Map.
 *
 * On error the hook returns an empty array so consumers can fall back
 * to their mock / hardcoded category list without an extra null-check
 * — same convention as `useHeadlines` and `useTrendingStories`.
 * The `isLoading` flag flips to `false` once the fetch settles either
 * way, so the widget can drop its shimmer.
 *
 * Pass `enabled: false` to skip the network call entirely. Useful
 * when the topics should only be fetched post-auth (the layout-level
 * `<TopicsProvider />` gates on `useCurrentUser()` so the request
 * only fires after a successful login / register). While disabled,
 * the hook returns `{ data: [], isLoading: false }` — the data is
 * cleared so a previous session's topics don't leak through once the
 * gate opens, and a new session starts fresh from an empty list.
 *
 * @param limit   How many topics to fetch (default 10, matching the
 *                backend's default).
 * @param skip    How many topics to skip (default 0).
 * @param filters Structured `{ field, operator, value }` filters
 *                (default `[]`). Same list passed twice always lands
 *                on the same cache slot.
 * @param enabled When `false`, suppresses the network call and
 *                returns an empty data array (default `true`).
 */
export function useTopics(
  limit = 10,
  skip = 0,
  filters: StoryFilter[] = [],
  enabled = true,
): { data: StoryTopic[]; isLoading: boolean } {
  const [data, setData] = useState<StoryTopic[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setData([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    void loadTopic(limit, skip, filters)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        // Swallow — the widget falls back to its mock category list.
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
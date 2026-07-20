"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { EmbeddedStory, StoryFilter } from "@/lib/api";
import { useListStory } from "@/lib/hooks/useListStory";
import { useHeadlineDetail } from "./HeadlineDetailProvider";

interface HeadlineStoriesContextValue {
  /** All stories tagged with the deep-linked headline, oldest →
   *  newest as the API returns them. Empty array while the headline
   *  detail hasn't resolved yet, while loading, or on error. */
  stories: EmbeddedStory[];
  /** True while the fetch is in flight. */
  isLoading: boolean;
}

const HeadlineStoriesContext = createContext<HeadlineStoriesContextValue>({
  stories: [],
  isLoading: false,
});

/** Default page-size for the headline-scoped `/stories` fetch.
 *  Both `SentimentSparkline` (one bar per unique `recap_date`) and
 *  the three detail consumers (`NewsTimeline`,
 *  `ArticlesByMediaWidget`, `AggregateSummary`) need only a handful
 *  of items, so 10 is enough for the common case. */
const FETCH_LIMIT = 10;

/**
 * Shared headline-scoped `/stories` fetch for the stock detail page.
 *
 * Four widgets on the page need the same `headline_id` story list:
 * `SentimentSparkline` (sentiment trail), `NewsTimeline` (day-by-day
 * buckets), `ArticlesByMediaWidget` (article-by-media grouping),
 * and `AggregateSummary` (per-source counts). Mounting them inside
 * this provider gives all four a single network round-trip per
 * page load — the underlying `loadListStory` cache dedups identical
 * `(limit, skip, filters)` tuples, but each widget used to drive
 * its own hook with its own `useState` and cancel-on-unmount
 * `useEffect`.
 *
 * **Must be nested inside `<HeadlineDetailProvider>`.** The provider
 * reads `detail.id` from `useHeadlineDetail()` rather than reaching
 * for `useSearchParams()` itself, so it depends on the detail having
 * been resolved upstream. The fetch is also gated on
 * `detail !== null` — when no `?id=` is set (or the detail fetch is
 * still in flight), the hook returns
 * `{ stories: [], isLoading: false }` and no `/stories` request
 * fires. This avoids the wasted `headline_id=""` slot the old
 * `TickerStoriesProvider` would have written to the cache.
 *
 * Patterned after `<HeadlineDetailProvider>`. The default context
 * value is `{ stories: [], isLoading: false }` so consumers outside
 * a provider degrade gracefully (no `null` checks needed).
 */
export function HeadlineStoriesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { detail } = useHeadlineDetail();

  // `useListStory` lists `filters` in its `useEffect` dep array, so the
  // reference must be stable across renders when its content is
  // unchanged. Building the array inline each render would give it a
  // fresh identity every time — re-running the effect, re-issuing
  // `setIsLoading(true)`, re-rendering, and looping until React hits
  // "Maximum update depth exceeded". `useMemo` pins the reference to
  // `detail?.id` (and skips the array entirely while detail is null),
  // so the effect only re-fires when the headline actually changes.
  const filters = useMemo<StoryFilter[]>(
    () =>
      detail
        ? [{ field: "headline_id", operator: "eq", value: detail.id }]
        : [],
    [detail?.id],
  );
  const { data: stories, isLoading } = useListStory(
    FETCH_LIMIT,
    0,
    filters,
    detail !== null,
  );
  return (
    <HeadlineStoriesContext.Provider value={{ stories, isLoading }}>
      {children}
    </HeadlineStoriesContext.Provider>
  );
}

/** Read the shared headline-scoped stories. Returns
 *  `{ stories: [], isLoading: false }` outside a provider so
 *  consumers degrade to their fallback paths without an extra null
 *  check. */
export function useHeadlineStories(): HeadlineStoriesContextValue {
  return useContext(HeadlineStoriesContext);
}
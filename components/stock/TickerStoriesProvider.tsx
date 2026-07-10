"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { EmbeddedStory, StoryFilter } from "@/lib/api";
import { useListStory } from "@/lib/hooks/useListStory";
import { useSearchParams } from "next/navigation";

interface TickerStoriesContextValue {
  /** All stories tagged with the stock's primary ticker, oldest →
   *  newest as the API returns them. Empty array while loading or
   *  on error. */
  stories: EmbeddedStory[];
  /** True while the fetch is in flight. */
  isLoading: boolean;
}

const TickerStoriesContext = createContext<TickerStoriesContextValue>({
  stories: [],
  isLoading: false,
});

/** Default page-size for the ticker-scoped `/stories` fetch.
 *  Both consumers (`<ArsipSingkat>` shows up to `VISIBLE_COUNT`
 *  rows; `<SentimentSparkline>` buckets by `recap_date` and renders
 *  one bar per unique day) need only a handful of items, so 10 is
 *  enough for the common case. */
const FETCH_LIMIT = 10;

/**
 * Shared ticker-scoped `/stories` fetch for the stock detail page.
 *
 * Two widgets on the page (`<ArsipSingkat>` and
 * `<SentimentSparkline>`) need the same `primary_ticker_code`
 * story list. Mounting them inside this provider gives both a
 * single network round-trip per page load — the underlying
 * `loadListStory` cache already dedups identical `(limit, skip,
 * filters)` tuples, but each widget used to drive its own hook
 * with its own loading flag and React state.
 *
 * Patterned after `<HeadlineDetailProvider>`. The default context
 * value is `{ stories: [], isLoading: false }` so consumers outside
 * a provider degrade gracefully (no `null` checks needed).
 *
 * @param kode  Stock ticker; used as the `primary_ticker_code`
 *              filter value.
 */
export function TickerStoriesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const searchParams = useSearchParams();
  const headlineId = searchParams.get("id")??'';

  const filters: StoryFilter[] = [
    { field: "headline_id", operator: "eq", value: headlineId },
  ];
  const { data: stories, isLoading } = useListStory(
    FETCH_LIMIT,
    0,
    filters,
    true,
  );
  return (
    <TickerStoriesContext.Provider value={{ stories, isLoading }}>
      {children}
    </TickerStoriesContext.Provider>
  );
}

/** Read the shared ticker stories. Returns `{ stories: [], isLoading:
 *  false }` outside a provider so consumers degrade to their fallback
 *  paths without an extra null check. */
export function useTickerStories(): TickerStoriesContextValue {
  return useContext(TickerStoriesContext);
}
"use client";

import { useEffect, useState } from "react";
import type { EmbeddedStory, StoryFilter } from "@/lib/api";
import { loadHeadlines, loadListStory } from "@/lib/api/cache";

/** Page-size for the headline-scoped `/stories` fetch. Mirrors
 *  `HeadlineStoriesProvider`'s `FETCH_LIMIT` — 10 is plenty for the
 *  "artikel · media" coverage row this hook drives, and matches the
 *  cache slot other headline-scoped consumers land on. */
const FETCH_LIMIT = 10;

interface UseSektorDetailResult {
  /** The latest headline for `ticker`, or `null` while the fetch is
   *  in flight, on error, or when the ticker has no headlines. */
  title: string | null;
  /** Number of related stories (`loadListStory` data length). 0 while
   *  the fetch is in flight or on error. */
  articleCount: number;
  /** Unique publisher count across every `articles[].source_name`
   *  in the related stories. Mirrors the coverage count used by
   *  `<StockAboutPanel />` and `<ArticlesByMediaWidget />`. 0 while
   *  the fetch is in flight or on error. */
  mediaCount: number;
  /** True while the headline fetch is in flight; stays `true` until
   *  the optional followup stories fetch settles too. */
  isLoading: boolean;
}

/**
 * Data hook for the sector-top-stock card on `/sektor/[slug]`. Two
 * sequential fetches, derived off `loadHeadlines` + `loadListStory`:
 *
 *   1. `loadHeadlines(1, 0, [{primary_ticker_code, eq, ticker}])`
 *      — newest headline for `ticker`.
 *   2. `loadListStory(FETCH_LIMIT, 0, [{headline_id, eq, id}])`
 *      where `id` is `headlines[0].id` — related stories for that
 *      headline.
 *
 * Returns the headline `title`, the count of related stories
 * (`articleCount`), and the unique `source_name` count across every
 * `articles[]` (`mediaCount`).
 *
 * Concurrent mounts of the same ticker (e.g. two `<SektorTopStockCard />`
 * instances on the same sector tile) share one network round-trip
 * through the request-level cache; switching tickers triggers a fresh
 * fetch. State resets on every `ticker` change so a fast ticker switch
 * never briefly shows the previous ticker's headline alongside the
 * new loading state.
 *
 * On either fetch failing the hook falls back to
 * `{ title: null, articleCount: 0, mediaCount: 0, isLoading: false }`
 * so consumers can render an empty / placeholder row without an
 * extra null-check. The `isLoading` flag flips to `false` once the
 * headline fetch settles either way, so the card can drop its
 * shimmer even if the followup stories fetch failed.
 *
 * @param ticker Ticker code, e.g. `"ANTM"`. Case-insensitive (the
 *               cache key uppercases via `JSON.stringify(filters)`,
 *               which is structural-equality safe).
 */
export function useSektorDetail(
  ticker: string,
): UseSektorDetailResult {
  const [title, setTitle] = useState<string | null>(null);
  const [articleCount, setArticleCount] = useState(0);
  const [mediaCount, setMediaCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Reset on ticker change so a fast ticker switch doesn't briefly
    // show the previous ticker's headline alongside the new loading
    // state — same reset pattern as `useTickerInformation`.
    setTitle(null);
    setArticleCount(0);
    setMediaCount(0);
    setIsLoading(true);

    const headlineFilters: StoryFilter[] = [
      { field: "primary_ticker_code", operator: "eq", value: ticker },
    ];

    void loadHeadlines(1, 0, headlineFilters)
      .then((res) => {
        if (cancelled) return;
        const first = res.data[0];
        if (!first) {
          // Ticker has no headlines — leave the counts at zero and
          // drop loading so the card renders its empty state.
          setIsLoading(false);
          return;
        }
        setTitle(first.title);
        const storyFilters: StoryFilter[] = [
          { field: "headline_id", operator: "eq", value: first.id },
        ];
        return loadListStory(FETCH_LIMIT, 0, storyFilters)
          .then((listRes) => {
            if (cancelled) return;
            setArticleCount(listRes.data.length);
            setMediaCount(uniqueMediaCount(listRes.data));
          })
          .catch(() => {
            // Stories fetch failed — leave counts at 0, the
            // consumer treats that the same as "still loading".
          })
          .finally(() => {
            if (!cancelled) setIsLoading(false);
          });
      })
      .catch(() => {
        // Headline list fetch failed — leave everything at the
        // initial state and drop loading so the card renders its
        // empty state.
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ticker]);

  return { title, articleCount, mediaCount, isLoading };
}

/** Unique `source_name` count across every article in the supplied
 *  stories. Mirrors `mediaCount` in `<StockAboutPanel />` /
 *  `<ArticlesByMediaWidget />` so all three stay numerically
 *  consistent if the same ticker is rendered on multiple pages. */
function uniqueMediaCount(stories: EmbeddedStory[]): number {
  const sources = new Set<string>();
  for (const story of stories) {
    for (const article of story.articles ?? []) {
      if (article.source_name) sources.add(article.source_name);
    }
  }
  return sources.size;
}

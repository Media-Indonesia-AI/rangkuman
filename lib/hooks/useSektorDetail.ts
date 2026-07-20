"use client";

import { useEffect, useState } from "react";
import type { EmbeddedStory, StoryFilter, StorySentiment } from "@/lib/api";
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
  /** ISO timestamp (`created_at`) of the latest headline, used to
   *  display + sort rows by recency. `null` until the headline
   *  resolves (or when the ticker has no headlines at all). */
  date: string | null;
  /** Number of related stories (`stories.length`). 0 while the
   *  fetch is in flight or on error. */
  articleCount: number;
  /** Unique publisher count across every `articles[].source_name`
   *  in the related stories. Mirrors the coverage count used by
   *  `<StockAboutPanel />` and `<ArticlesByMediaWidget />`. 0 while
   *  the fetch is in flight or on error. */
  mediaCount: number;
  /** True while the headline fetch is in flight; stays `true` until
   *  the optional followup stories fetch settles too. */
  isLoading: boolean;
  /** All stories tagged with the resolved headline, oldest →
   *  newest as the API returns them. Empty array while the headline
   *  detail hasn't resolved yet, while loading, or on error. Each
   *  entry exposes its own `summary` (the recap paragraph rendered
   *  per row in `<SektorDetailNews />`) and `articles[]` (for the
   *  per-row media count). */
  stories: EmbeddedStory[];
  /** Sentiment of the latest headline for `ticker`, in the API
   *  `StorySentiment` vocabulary (`"positive" | "negative" |
   *  "neutral"`). `null` until the headline resolves (or when the
   *  ticker has no headlines at all) — consumers should treat
   *  `null` as "no signal" rather than defaulting it to neutral so
   *  they can suppress the sentiment badge during loading. */
  sentiment: StorySentiment | null;
}

/**
 * Data hook for the sector-top-stock card on `/sektor/[slug]` and
 * the sector news feed on the same page. Two sequential fetches,
 * derived off `loadHeadlines` + `loadListStory`:
 *
 *   1. `loadHeadlines(1, 0, [{primary_ticker_code, eq, ticker}])`
 *      — newest headline for `ticker`.
 *   2. `loadListStory(FETCH_LIMIT, 0, [{headline_id, eq, id}])`
 *      where `id` is `headlines[0].id` — related stories for that
 *      headline.
 *
 * Returns the headline `title` + `date` (`created_at`), the count of
 * related stories (`articleCount` + `stories.length`), the unique
 * `source_name` count across every `articles[]` (`mediaCount`), the
 * headline `sentiment` (English `StorySentiment` so callers like
 * `<SektorTopStockCard />` can pick their own icon set), and the
 * raw `stories` array. `date` powers the "berdasarkan tanggal"
 * sort in `<SektorDetailNews />`; `stories` powers the per-row recap
 * paragraphs; the rest drives the headline + coverage row on
 * `<SektorTopStockCard />`.
 *
 * Concurrent mounts of the same ticker (e.g. a top-5 tile *and* a
 * news row for the same ticker on one page) share one network
 * round-trip through the request-level cache; switching tickers
 * triggers a fresh fetch. State resets on every `ticker` change so
 * a fast ticker switch never briefly shows the previous ticker's
 * headline alongside the new loading state.
 *
 * On either fetch failing the hook falls back to
 * `{ title: null, date: null, articleCount: 0, mediaCount: 0, isLoading: false, stories: [], sentiment: null }`
 * so consumers can render an empty / placeholder row without an
 * extra null-check. The `isLoading` flag flips to `false` once the
 * headline fetch settles either way, so consumers can drop their
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
  const [date, setDate] = useState<string | null>(null);
  const [articleCount, setArticleCount] = useState(0);
  const [mediaCount, setMediaCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [stories, setStories] = useState<EmbeddedStory[]>([]);
  const [sentiment, setSentiment] = useState<StorySentiment | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Reset on ticker change so a fast ticker switch doesn't briefly
    // show the previous ticker's headline alongside the new loading
    // state — same reset pattern as `useTickerInformation`.
    setTitle(null);
    setDate(null);
    setArticleCount(0);
    setMediaCount(0);
    setIsLoading(true);
    setStories([]);
    setSentiment(null);

    const headlineFilters: StoryFilter[] = [
      { field: "primary_ticker_code", operator: "eq", value: ticker },
    ];

    void loadHeadlines(1, 0, headlineFilters)
      .then((res) => {
        if (cancelled) return;
        const first = res.data[0];
        if (!first) {
          // Ticker has no headlines — leave the counts at zero and
          // drop loading so the row renders its empty state.
          setIsLoading(false);
          return;
        }
        setTitle(first.title);
        setDate(first.created_at);
        setSentiment(first.sentiment);
        const storyFilters: StoryFilter[] = [
          { field: "headline_id", operator: "eq", value: first.id },
        ];
        return loadListStory(FETCH_LIMIT, 0, storyFilters)
          .then((listRes) => {
            if (cancelled) return;
            setStories(listRes.data);
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
        // initial state and drop loading so the row renders its
        // empty state.
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ticker]);

  return { title, date, articleCount, mediaCount, isLoading, stories, sentiment };
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

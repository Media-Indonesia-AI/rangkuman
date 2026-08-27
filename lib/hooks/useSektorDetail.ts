"use client";

import { useMemo } from "react";
import type { StorySentiment, TickerArticles } from "@/lib/api";
import { useTickerInformation } from "@/lib/hooks/useTickerInformation";

interface UseSektorDetailResult {
  /** Ticker-level description used as the card's recap text. */
  title: string | null;
  /** Most recent article recap timestamp. */
  date: string | null;
  /** Total articles returned by ticker information. */
  articleCount: number;
  /** Number of unique publishers across the ticker articles. */
  mediaCount: number;
  isLoading: boolean;
  /** Raw ticker articles — same shape as `data.articles` from
   *  `useTickerInformation()`. Passed through without renaming
   *  (no `title → headline` / `content → summary` rewrite) so
   *  consumers read wire fields directly. */
  stories: TickerArticles[];
  /** Ticker information does not currently expose editorial
   *  sentiment. Typed as `StorySentiment | null` (not `null`) so
   *  downstream conditionals like `sentiment ? SENTIMENT_ICON[sentiment]
   *  : null` still narrow correctly — the consumer code stays
   *  intact even when the value is always null today. */
  sentiment: StorySentiment | null;
}

/**
 * Adapts `useTickerInformation()` for the sector detail widgets.
 *
 * The ticker endpoint already provides the aggregate description and
 * article list, so this hook just walks `data.articles` once to
 * compute the four summary fields (`title` / `date` / `articleCount`
 * / `mediaCount`) and returns the article array itself as `stories`
 * — no per-item reshape, no synthetic `EmbeddedStory` wrapping.
 */
export function useSektorDetail(ticker: string): UseSektorDetailResult {
  const { data, isLoading } = useTickerInformation(ticker);

  return useMemo<UseSektorDetailResult>(() => {
    if (!data) {
      return {
        title: null,
        date: null,
        articleCount: 0,
        mediaCount: 0,
        isLoading,
        stories: [],
        sentiment: null,
      };
    }

    const sourceNames = new Set<string>();
    let latestDate: string | null = null;
    let latestTimestamp = Number.NEGATIVE_INFINITY;
    for (const article of data.articles) {
      if (article.source_name) sourceNames.add(article.source_name);
      const timestamp = new Date(article.recap_date).getTime();
      if (!Number.isNaN(timestamp) && timestamp > latestTimestamp) {
        latestTimestamp = timestamp;
        latestDate = article.recap_date;
      }
    }

    return {
      title: data.description || data.articles[0]?.title || null,
      date: latestDate,
      articleCount: data.articles.length,
      mediaCount: sourceNames.size,
      isLoading,
      stories: data.articles,
      sentiment: null,
    };
  }, [data, isLoading]);
}

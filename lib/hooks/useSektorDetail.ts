"use client";

import { useMemo } from "react";
import type { EmbeddedStory, StorySentiment } from "@/lib/api";
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
  /** Ticker articles adapted to the existing sector-news story shape. */
  stories: EmbeddedStory[];
  /** Ticker information does not currently expose editorial sentiment. */
  sentiment: StorySentiment | null;
}

/**
 * Adapts `useTickerInformation()` for the sector detail widgets.
 *
 * The ticker endpoint already provides the aggregate description and
 * article list, so this hook no longer performs separate headline and
 * story requests. Each ticker article is adapted to an `EmbeddedStory`
 * to preserve the existing `SektorDetailNews` consumer contract.
 */
export function useSektorDetail(ticker: string): UseSektorDetailResult {
  const { data, isLoading } = useTickerInformation(ticker);

  return useMemo(() => {
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

    const stories: EmbeddedStory[] = data.articles.map((article) => {
      if (article.source_name) sourceNames.add(article.source_name);

      const timestamp = new Date(article.recap_date).getTime();
      if (!Number.isNaN(timestamp) && timestamp > latestTimestamp) {
        latestTimestamp = timestamp;
        latestDate = article.recap_date;
      }

      return {
        id: article.id,
        headline: article.title,
        summary: article.content,
        primary_sentiment: "neutral",
        recap_date: article.recap_date,
        created_at: article.recap_date,
        articles: [
          {
            title: article.title,
            source_name: article.source_name,
            source_url: article.source_url,
            excerpt: article.content,
          },
        ],
      };
    });

    return {
      title: data.description || stories[0]?.headline || null,
      date: latestDate,
      articleCount: data.articles.length,
      mediaCount: sourceNames.size,
      isLoading,
      stories,
      sentiment: null,
    };
  }, [data, isLoading]);
}

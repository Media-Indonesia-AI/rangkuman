/**
 * Types for `/story/trending`. Hits a separate domain from
 * stocks / market / auth, so the types live in their own file.
 */

// ─── TRENDING STORIES ──────────────────────────────────────────

/** Direction of the day's net sentiment for a trending ticker. */
export type TrendingSentiment = "positive" | "negative" | "neutral";

/** One article surfaced for the trending ticker. */
export interface TrendingArticle {
  /** Headline of the article. */
  title: string;
  /** Hostname or canonical URL of the publisher (e.g. `market.bisnis.com`). */
  source_url: string;
  /** Display name of the publisher (usually matches `source_url`). */
  source_name: string;
}

/** Aggregated media presence for the trending ticker. */
export interface TrendingMedia {
  /** Publisher name (matches `TrendingArticle.source_name`). */
  name: string;
  /** Number of articles from this publisher in the rolling window. */
  count: number;
}

/**
 * One ticker that's currently trending in the market. Bundles a
 * brief editorial summary, the recap timestamp, the day's net
 * sentiment, and the supporting article + per-media counts.
 */
export interface TrendingStory {
  /** Ticker code (e.g. `"BBCA"`). */
  ticker: string;
  /** One-paragraph editorial summary of why this ticker is trending. */
  brief_summary: string;
  /** ISO timestamp of when this recap was generated. */
  recap_date: string;
  /** Net sentiment direction for the day. */
  sentiment: TrendingSentiment;
  /** Articles surfaced for this ticker, in display order. */
  articles: TrendingArticle[];
  /** Per-publisher article counts (a rollup of `articles`). */
  medias: TrendingMedia[];
}

/** Wire format the backend actually returns: `{ data: [...] }`. */
export interface TrendingStoriesResponse {
  data: TrendingStory[];
}
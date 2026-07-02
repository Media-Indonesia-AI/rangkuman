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
 * brief editorial summary, timestamps, the day's net sentiment,
 * and rollup counts (story_count, keywords, topics).
 */
export interface TrendingStory {
  /** Story ID. */
  id: string;
  /** Headline. */
  title: string;
  /** One-paragraph editorial summary of why this ticker is trending. */
  summary: string;
  /** Primary ticker code mentioned (e.g. `"MTEL"`). */
  primary_ticker_code: string;
  /** Net sentiment direction for the day. */
  sentiment: TrendingSentiment;
  /** ISO timestamp of when the record was created. */
  created_at: string;
  /** ISO timestamp of when the record was last updated. */
  updated_at: string;
  /** Keywords tagged on this story. */
  keywords: string[];
  /** Topics this story is filed under. */
  topics: StoryTopic[];
  /** Number of stories aggregated into this trending entry. */
  story_count: number;
}

/** Wire format the backend actually returns: `{ data: [...] }`. */
export interface TrendingStoriesResponse {
  data: TrendingStory[];
}

// ─── STORY LIST ────────────────────────────────────────────────

/**
 * One structured filter applied to the story list query. Composed into
 * the `filters` query param as a JSON-encoded array — e.g.
 *   `filters=[{"field":"primary_ticker_code","operator":"eq","value":"IHSG"}]`.
 *
 * `operator` is whatever the backend accepts for the chosen `field`
 * (e.g. `"eq"`, `"ne"`, `"in"`, `"gt"`, `"lt"`). The list is intentionally
 * open — we don't enumerate operators here because the backend may add
 * new ones at any time.
 */
export interface StoryFilter {
  /** Field name to filter on (e.g. `"primary_ticker_code"`). */
  field: string;
  /** Comparison operator (e.g. `"eq"`). Exact accepted values are
   *  determined by the backend. */
  operator: string;
  /** Value to compare against. */
  value: string;
}

/** Net sentiment direction for a single story. */
export type StorySentiment = "positive" | "negative" | "neutral";

/** One article surfaced for the story. */
export interface StoryArticle {
  /** Headline of the article. */
  title: string;
  /** Hostname or canonical URL of the publisher (e.g. `market.bisnis.com`). */
  source_url: string;
  /** Display name of the publisher (usually matches `source_url`). */
  source_name: string;
}

/** The topic this story is filed under. */
export interface StoryTopic {
  /** Topic ID. */
  id: string;
  /** URL-safe topic slug. */
  slug: string;
  /** Display name of the topic. */
  name: string;
}

/** One story in the response from `GET headlines`. */
export interface StoryItem {
  /** Story ID. */
  id: string;
  /** Headline. */
  title: string;
  /** One-paragraph summary of the story. */
  summary: string;
  /** Primary ticker code mentioned (e.g. `"IHSG"`). */
  primary_ticker_code: string;
  /** Net sentiment direction for this story. */
  sentiment: StorySentiment;
  /** ISO timestamp of when the record was created. */
  created_at: string;
  /** ISO timestamp of when the record was last updated. */
  updated_at: string;
  /** Keywords tagged on this story. */
  keywords: string[];
  /** Topics this story is filed under. */
  topics: StoryTopic[];
}

/** Wire format the backend actually returns: `{ data: [...] }`. */
export interface StoryResponse {
  data: StoryItem[];
}

/** Wire format `GET topic` returns: `{ data: [StoryTopic, ...] }`.
 *  Items reuse the `StoryTopic` shape (embedded in stories) since
 *  the standalone list resource and the embedded form have
 *  identical fields today. If they diverge later, split this into
 *  its own `Topic` interface. */
export interface TopicResponse {
  data: StoryTopic[];
}
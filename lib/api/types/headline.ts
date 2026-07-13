/**
 * Types for the headline-detail request (`GET headlines/{id}`).
 *
 * Split out from `./story` so the single-headline detail shape lives
 * apart from the story-list / trending types. Shared base types
 * (`StoryItem`, `StorySentiment`) are imported from `./story`.
 */

import type { StoryArticle, StoryItem, StorySentiment } from "./story";

// ─── HEADLINE DETAIL ───────────────────────────────────────────

/**
 * A story embedded inside a `HeadlineDetail.stories[]` array. Note
 * that this is the *older* wire shape — it uses the pre-rename field
 * names (`headline`, `primary_sentiment`, `recap_date`) — and does
 * NOT match the new top-level `StoryItem` (which uses `title`,
 * `sentiment`, `created_at`). The two shapes are kept separate until
 * the backend aligns them.
 *
 * The standalone stories-list endpoint (`GET stories`,
 * `getListStory()`) also returns items in this shape, but tacks on
 * a few extra fields: `headline_id` (the parent headline, useful as
 * a round-trip key for callers that already have one in hand),
 * `articles[]` (the per-story article rollup), and `created_at` /
 * `updated_at` for sortability. Those four are optional here so the
 * same interface covers both call sites — the embedded array in
 * `HeadlineDetail` doesn't carry them today.
 */
export interface EmbeddedStory {
  /** Story ID. */
  id: string;
  /** Headline (older field name; new `StoryItem` calls this `title`). */
  headline: string;
  /** One-paragraph summary. */
  summary: string;
  /** Net sentiment direction (older field name; new `StoryItem` calls
   *  this `sentiment`). */
  primary_sentiment: StorySentiment;
  /** ISO timestamp of when the related story was generated (older
   *  field name; new `StoryItem` calls this `created_at`). */
  recap_date: string;
  /** Parent headline ID. Only present on items from the standalone
   *  `/stories` endpoint; absent on the embedded array in
   *  `HeadlineDetail`. */
  headline_id?: string;
  /** Source articles aggregated into this story. Only present on
   *  items from the standalone `/stories` endpoint. */
  articles?: StoryArticle[];
  /** ISO timestamp of when the story record was created. Only
   *  present on items from the standalone `/stories` endpoint. */
  created_at?: string;
  /** ISO timestamp of when the story record was last updated. Only
   *  present on items from the standalone `/stories` endpoint. */
  updated_at?: string;
}

/**
 * Detail of a single headline, returned by `GET headlines/{id}`.
 * Top-level fields mirror `StoryItem`; `stories[]` is the additional
 * payload with related stories in the older embedded shape
 * (see `EmbeddedStory`).
 *
 * Wire format: `{ data: HeadlineDetail }` — same `{ data: ... }`
 * wrapper as the list endpoints (`TrendingStoriesResponse`,
 * `StoryResponse`, `TopicResponse`). The API client unwraps it
 * before handing it to consumers, so call sites only ever see
 * `HeadlineDetail`.
 */
export interface HeadlineDetail extends StoryItem {
  /** Related stories for this headline, in the older wire shape. */
  stories: EmbeddedStory[];
}

/**
 * Wire format the backend returns from `GET headlines/{id}`:
 * `{ data: HeadlineDetail }`. The `getHeadlineById` API function
 * unwraps this to `HeadlineDetail` for consumers.
 */
export interface HeadlineDetailResponse {
  data: HeadlineDetail;
}

/**
 * Types for the headline-detail request (`GET headlines/{id}`).
 *
 * Split out from `./story` so the single-headline detail shape lives
 * apart from the story-list / trending types. Shared base types
 * (`StoryItem`, `StorySentiment`) are imported from `./story`.
 */

import type { StoryItem, StorySentiment } from "./story";

// ─── HEADLINE DETAIL ───────────────────────────────────────────

/**
 * A story embedded inside a `HeadlineDetail.stories[]` array. Note
 * that this is the *older* wire shape — it uses the pre-rename field
 * names (`headline`, `primary_sentiment`, `recap_date`) — and does
 * NOT match the new top-level `StoryItem` (which uses `title`,
 * `sentiment`, `created_at`). The two shapes are kept separate until
 * the backend aligns them.
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
}

/**
 * Detail of a single headline, returned by `GET headlines/{id}`.
 * Top-level fields mirror `StoryItem`; `stories[]` is the additional
 * payload with related stories in the older embedded shape
 * (see `EmbeddedStory`).
 *
 * Returned as a flat object — no `{ data: ... }` wrapper, unlike
 * the list endpoints (`TrendingStoriesResponse`, `StoryResponse`).
 * If the backend later wraps it, add a `HeadlineDetailResponse`
 * wrapper like the others.
 */
export interface HeadlineDetail extends StoryItem {
  /** Related stories for this headline, in the older wire shape. */
  stories: EmbeddedStory[];
}

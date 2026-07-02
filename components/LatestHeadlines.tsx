"use client";

import { BookOpen, Clock } from "lucide-react";
import type { StoryItem, StorySentiment } from "@/lib/api";
import { headlines as mockHeadlines } from "@/lib/mock/headlines";
import type { Sentimen } from "@/lib/mock/recaps";
import { cn, getRelativeTime } from "@/lib/utils";
import { useLatestStories } from "@/lib/hooks/useLatestStories";
import { SentimentBadge } from "./SentimentBadge";
import { Shimmer } from "./Shimmer";

/** Number of items rendered in the timeline. The widget asks the
 *  backend for `limit` and then slices down to this count. Matches
 *  the previous mock-driven behavior of `headlines.slice(0, 6)`. */
const VISIBLE_COUNT = 6;

/**
 * Translate a backend `StorySentiment` (English) into the Indonesian
 * `Sentimen` vocabulary used by the existing UI components
 * (`SentimentBadge`, market-color palette, etc.). Centralized here so
 * the mapping only lives in one place.
 */
function toSentimen(s: StorySentiment): Sentimen {
  switch (s) {
    case "positive":
      return "positif";
    case "negative":
      return "negatif";
    case "neutral":
      return "netral";
  }
}

/** Tailwind dot/rail color for a story's sentiment. Mirrors the
 *  existing `storyColor` derivation in the previous in-place
 *  `CompactHeadlines` implementation. */
function storyColor(sentiment: Sentimen | undefined): string {
  if (!sentiment) return "bg-text-muted";
  if (sentiment === "positif") return "bg-bullish";
  if (sentiment === "negatif") return "bg-bearish";
  return "bg-mixed";
}

/**
 * "Latest Headlines" widget — vertical timeline of up to 6 stories
 * with a relative-time rail, ticker badge, sentiment pill, STORY tag,
 * headline, and source name.
 *
 * Data path: `useLatestStories` → `loadHeadlines` → `api.getHeadlines`.
 *   - During the in-flight window the timeline rail shows a
 *     pulsing shimmer skeleton instead of the live list.
 *   - On success, live `StoryItem`s drive the render.
 *   - On failure (auth, network, etc.) the widget silently falls back
 *     to the mock headlines so users still see content — same UX as
 *     the prior mock-only render path.
 *
 * `Sidebar` is a server component; this file is the small client
 * island that owns the fetch.
 */
export function LatestHeadlines() {
  // Match the backend's default `limit` so we can pass through any
  // number of filters unchanged. We slice to VISIBLE_COUNT below.
  const { data, isLoading } = useLatestStories(10, 0, []);

  // Build the render list. Prefer live data; fall back to mock if the
  // fetch errored or returned empty (empty list would render an empty
  // timeline, which is a regression from the previous behavior).
  const liveItems = data.length > 0 ? data.slice(0, VISIBLE_COUNT) : null;
  const fallbackItems =
    !isLoading && liveItems === null
      ? mockHeadlines.slice(0, VISIBLE_COUNT)
      : null;
  const renderCount = liveItems?.length ?? fallbackItems?.length ?? 0;

  return (
    <section
      className="overflow-hidden rounded-lg border border-border bg-bg-secondary"
      aria-label="Latest headlines"
    >
      <header className="flex items-center justify-between border-b border-border bg-bg-tertiary px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-brand" aria-hidden />
          <h3 className="label">Latest Headlines</h3>
        </div>
        <span className="font-mono text-[9.5px] text-text-muted num-tabular">
          {isLoading ? <Shimmer className="h-2 w-4" /> : renderCount}
        </span>
      </header>

      <ol className="relative">
        {isLoading && <HeadlinesSkeleton count={VISIBLE_COUNT} />}

        {liveItems?.map((story, idx) => {
          const sentiment = toSentimen(story.sentiment);
          const dotColor = storyColor(sentiment);
          const isLast = idx === liveItems.length - 1;
          return (
            <li
              key={story.id}
              className={cn(
                "group relative pl-8 pr-3 py-2.5 transition-colors hover:bg-bg-tertiary",
                !isLast && "border-b border-border",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute left-3 top-0 bottom-0 w-0.5 -translate-x-1/2",
                  dotColor,
                )}
              />
              <span
                aria-hidden
                className={cn(
                  "absolute left-3 top-3.5 h-2 w-2 -translate-x-1/2 rounded-full ring-4 ring-bg-secondary",
                  dotColor,
                )}
              />

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-muted num-tabular">
                    {getRelativeTime(story.created_at)}
                  </span>
                  {story.primary_ticker_code && (
                    <span className="inline-flex items-center gap-0.5 rounded border border-border bg-bg-tertiary px-1 py-px font-mono text-[9.5px] font-semibold text-text-primary">
                      {story.primary_ticker_code}
                    </span>
                  )}
                  <SentimentBadge sentiment={sentiment} size="sm" />
                  <span className="inline-flex items-center gap-0.5 rounded border border-brand-line bg-brand-soft px-1 py-px font-mono text-[9px] font-semibold uppercase tracking-widest text-brand">
                    <BookOpen className="h-2 w-2" aria-hidden />
                    Story
                  </span>
                </div>
                <p className="text-[11.5px] font-medium leading-snug text-text-primary group-hover:text-brand">
                  {story.title}
                </p>
              </div>
            </li>
          );
        })}

        {fallbackItems?.map((h) => (
          <FallbackRow key={h.id} headline={h} isLast={false} />
        ))}
      </ol>
    </section>
  );
}

/** Skeleton shown while the story fetch is in flight — pulsing
 *  rectangles sized to roughly match a single headline row, minus the
 *  real text so the layout doesn't shift when the data arrives. */
function HeadlinesSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={`skel-${i}`}
          className={cn(
            "relative pl-8 pr-3 py-2.5",
            i < count - 1 && "border-b border-border",
          )}
        >
          <span
            aria-hidden
            className="absolute left-3 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-border"
          />
          <span
            aria-hidden
            className="absolute left-3 top-3.5 h-2 w-2 -translate-x-1/2 rounded-full bg-border ring-4 ring-bg-secondary"
          />
          <div className="space-y-1.5">
            <Shimmer className="h-2.5 w-24" />
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-2 w-16" />
          </div>
        </li>
      ))}
    </>
  );
}

/** Renders a mock `MarketHeadline` row using the same visual rules
 *  as the live path so the fallback is visually identical. */
function FallbackRow({
  headline: h,
  isLast,
}: {
  headline: (typeof mockHeadlines)[number];
  isLast: boolean;
}) {
  return (
    <li
      className={cn(
        "group relative pl-8 pr-3 py-2.5 transition-colors hover:bg-bg-tertiary",
        !isLast && "border-b border-border",
      )}
    >
      <span
        aria-hidden
        className="absolute left-3 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-border"
      />
      <span
        aria-hidden
        className="absolute left-3 top-3.5 h-2 w-2 -translate-x-1/2 rounded-full bg-text-muted ring-4 ring-bg-secondary"
      />
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-1">
          <span className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-muted num-tabular">
            {h.relativeTime}
          </span>
          {h.ticker && (
            <span className="inline-flex items-center gap-0.5 rounded border border-border bg-bg-tertiary px-1 py-px font-mono text-[9.5px] font-semibold text-text-primary">
              {h.ticker}
            </span>
          )}
          {h.sentiment && <SentimentBadge sentiment={h.sentiment} size="sm" />}
        </div>
        <p className="text-[11.5px] font-medium leading-snug text-text-primary group-hover:text-brand">
          {h.title}
        </p>
        {h.source && (
          <p className="font-mono text-[9.5px] text-text-muted">{h.source}</p>
        )}
      </div>
    </li>
  );
}
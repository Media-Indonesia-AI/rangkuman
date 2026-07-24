"use client";

import Link from "next/link";
import {
  Newspaper,
  ArrowRight,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toSentimen } from "@/lib/util/sentiment";
import type { Sentimen } from "@/lib/mock/recaps";
import type { HeadlineLast7DaysItem, EmbeddedStory } from "@/lib/api";
import { useMultiStories } from "@/lib/hooks/useMultiStories";
import { Shimmer } from "../Shimmer";

/**
 * "Story" widget — multi-date stories for a ticker
 * ("Konteks emiten yang lagi berkembang"). Renders one large featured
 * card (the latest story); the `feed` variant follows it with a stack
 * of compact list rows, the `highlight` variant wraps everything in a
 * card and shows only the featured story.
 *
 * Data comes from `GET headlines/multi-date-stories` via
 * `useMultiStories(ticker)`. The endpoint provides ticker, title,
 * summary, sentiment, created_at, keywords, and topics — fields it
 * doesn't provide yet (a lifecycle status, a price move "sejak story",
 * a milestone timeline) render as `N/A` / are omitted.
 *
 * Variants:
 *   - `feed` (default): borderless section for the `/saham` feed —
 *     featured card + list rows, "Lihat semua (N)" in the header.
 *   - `highlight`: bordered card for the stock detail page — a
 *     `HIGHLIGHT` badge, featured story only, "Lihat semua story" at
 *     the bottom.
 *
 * `ticker` is optional; it defaults to `DEFAULT_TICKER` so the widget
 * works on the non-ticker-scoped `/saham` page.
 */

/** Fallback ticker when the host page doesn't pass one. */
const DEFAULT_TICKER = "";

/** How many stories to request (featured + list rows). */
const STORY_LIMIT = 5;

/** Visual style per sentiment — pill colors + status dot. */
const sentimentStyle: Record<
  Sentimen,
  { label: string; pill: string; dot: string }
> = {
  positif: { label: "Positif", pill: "border-bullish/30 text-bullish", dot: "bg-bullish" },
  netral: { label: "Netral", pill: "border-border text-text-muted", dot: "bg-text-muted" },
  negatif: { label: "Negatif", pill: "border-bearish/30 text-bearish", dot: "bg-bearish" },
};

type EmitenStoriesVariant = "feed" | "highlight";

interface EmitenStoriesProps {
  /** Ticker to fetch stories for. Defaults to `DEFAULT_TICKER`. */
  ticker?: string;
  /** Layout variant (default `"feed"`). */
  variant?: EmitenStoriesVariant;
  className?: string;
  storyLimit?: number;
}

export function EmitenStories({
  ticker = DEFAULT_TICKER,
  variant = "feed",
  className,
  storyLimit = STORY_LIMIT,
}: EmitenStoriesProps) {
  const { data: stories, total, isLoading } = useMultiStories(
    ticker,
    storyLimit,
  );
  const [featured, ...rest] = stories;

  const seeAll = (
    <Link
      href="/story"
      className="group inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold uppercase tracking-widest text-brand transition-colors hover:text-brand-hover"
    >
      {variant === "highlight"
        ? "Lihat semua story"
        : `Lihat semua (${total})`}
      <ArrowRight
        className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );

  // ─── HIGHLIGHT variant — bordered card, featured story only ───
  if (variant === "highlight") {
    return (
      <section
        aria-label="Story emiten"
        className={cn(
          "rounded-lg border border-white bg-bg-secondary p-4",
          className,
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-2 border-b border-white pb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <Newspaper className="h-3.5 w-3.5 text-brand" aria-hidden />
              <span className="label text-text-secondary">Story</span>
              <span className="rounded border border-brand/40 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-widest text-brand">
                Highlight
              </span>
            </div>
            <p className="mt-0.5 text-[12px] text-text-muted">
              Cerita panjang untuk emiten ini
            </p>
          </div>
          <span className="shrink-0 font-mono text-[10.5px] text-text-faint">
            {stories.length} cerita · update tiap minggu
          </span>
        </div>

        {isLoading ? (
          <FeaturedSkeleton />
        ) : stories.length === 0 ? (
          <EmptyStory ticker={ticker} />
        ) : (
          <>
            <FeaturedStory story={featured} />
            <div className="mt-3 flex justify-end">{seeAll}</div>
          </>
        )}
      </section>
    );
  }

  // ─── FEED variant (default) — borderless, featured + list rows ───
  return (
    <section aria-label="Story emiten" className={className}>
      <div className="mb-3 flex items-end justify-between gap-2 border-b border-white pb-2">
        <div>
          <div className="flex items-center gap-1.5">
            <Newspaper className="h-3.5 w-3.5 text-brand" aria-hidden />
            <span className="label text-text-secondary">Story</span>
          </div>
          <p className="mt-0.5 text-[12px] text-text-muted">
            Konteks emiten yang lagi berkembang
          </p>
        </div>
        {seeAll}
      </div>

      {isLoading ? (
        <StoriesSkeleton />
      ) : stories.length === 0 ? (
        <EmptyStory ticker={ticker} />
      ) : (
        <>
          <FeaturedStory story={featured} />
          <ul className="mt-1">
            {rest.map((story, i) => (
              <li key={story.id}>
                <StoryRow story={story} first={i === 0} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

/** Empty-state message when the ticker has no stories. */
function EmptyStory({ ticker }: { ticker: string }) {
  return (
    <p className="py-6 text-center font-mono text-[11px] text-text-faint">
      Belum ada story untuk {ticker.toUpperCase()}.
    </p>
  );
}

/**
 * "Since story" price-move chip — turns `HeadlineLast7DaysItem[
 * 'pct_change_since_story']` into a sign + color + arrow.
 * Returns `null` when the field is absent so the caller can fall
 * back to its own `n/a` placeholder. Sign convention matches the
 * price APIs: positive = up (bullish, `TrendingUp`), negative =
 * down (bearish, `TrendingDown`), zero renders as neutral with
 * `TrendingUp` (no arrow flip on 0).
 */
function PctChangeChip({
  pct,
}: {
  pct: number | undefined;
}) {
  if (pct === undefined || pct === null) return null;
  const isPositive = pct >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const color = isPositive ? "text-bullish" : "text-bearish";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-mono text-[11px] font-bold tabular-nums",
        color,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {isPositive ? "+" : ""}
      {pct.toFixed(1)}%
    </span>
  );
}

/** Ticker code chip. */
function TickerBadge({ kode }: { kode: string }) {
  return (
    <span className="rounded border border-white bg-bg-tertiary px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-wide text-brand">
      {kode}
    </span>
  );
}

/** Colored sentiment pill with a leading dot. */
function SentimentPill({ sentiment }: { sentiment: HeadlineLast7DaysItem["sentiment"] }) {
  const s = sentimentStyle[toSentimen(sentiment)];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-widest",
        s.pill,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} aria-hidden />
      {s.label}
    </span>
  );
}

/** Muted "N/A" marker for fields the endpoint doesn't provide yet. */
function NotAvailable({ className }: { className?: string }) {
  return (
    <span className={cn("font-mono text-[10.5px] text-text-faint", className)}>
      N/A
    </span>
  );
}

/**
 * Human "X waktu lalu" label from an ISO timestamp. Returns "N/A" if
 * the string can't be parsed.
 */
function relativeUpdated(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "N/A";
  const diffMs = Date.now() - then;
  const days = Math.floor(diffMs / 86_400_000);
  if (days >= 1) return `${days} hari lalu`;
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours >= 1) return `${hours} jam lalu`;
  const mins = Math.max(1, Math.floor(diffMs / 60_000));
  return `${mins} menit lalu`;
}

function FeaturedStory({
  story,
}: {
  story: HeadlineLast7DaysItem;
}) {
  const topic = story.topics[0]?.name;
  return (
    <Link
      href={`/story/${story.id}`}
      className="block rounded-lg border border-border bg-bg-secondary p-4 transition-colors hover:border-border-strong"
    >
      <div className="flex flex-wrap items-center gap-2">
        <TickerBadge kode={story.primary_ticker_code} />
        <SentimentPill sentiment={story.sentiment} />
        <span className="font-mono text-[10.5px] text-text-faint">
          · {story.keywords.length} kata kunci
        </span>
      </div>

      <h3 className="mt-2.5 text-lg font-bold leading-tight text-text-primary">
        {story.title}
      </h3>
      <p className="mt-1 text-[13px] leading-relaxed text-text-muted line-clamp-1">
        {story.summary}
      </p>

      {/* Timeline — sits between the summary and the footer so it
          reads as a per-card progress strip. Sourced from the
          headline's embedded `stories` payload so the dot count
          reflects the actual related-story count rather than the
          size of the parent feed. */}
      <div className="mt-3">
        <StoryTimeline stories={story.stories ?? []} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white pt-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-mono text-[10.5px] text-text-muted">
            <Clock className="h-3 w-3" aria-hidden />
            Update {relativeUpdated(story.created_at)}
          </span>
          {topic ? (
            <span className="rounded border border-border bg-bg-tertiary px-1.5 py-0.5 font-mono text-[9.5px] text-text-secondary">
              {topic}
            </span>
          ) : (
            <NotAvailable />
          )}
        </div>
        {/* Price move "sejak story" — driven by
            `pct_change_since_story` on the headline. Falls back to
            `n/a` when the field is absent (older responses). */}
        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-text-faint">
          {story.pct_change_since_story !== undefined ? (
            <PctChangeChip pct={story.pct_change_since_story} />
          ) : (
            <NotAvailable />
          )}
          sejak story
        </span>
      </div>
    </Link>
  );
}

function StoryRow({ story, first }: { story: HeadlineLast7DaysItem; first?: boolean }) {
  return (
    <Link
      href={`/story/${story.id}`}
      className={cn(
        "flex gap-3 py-3 transition-colors hover:bg-bg-secondary/60",
        // Skip the top divider on the first row so there's no line
        // between the featured card and item two.
        !first && "border-t border-white",
      )}
    >
      <div className="flex w-[52px] shrink-0 flex-col items-start gap-1">
        <TickerBadge kode={story.primary_ticker_code} />
        {/* Price change "sejak story" — falls back to `n/a` when
            the endpoint doesn't ship `pct_change_since_story`. */}
        {story.pct_change_since_story !== undefined ? (
          <PctChangeChip pct={story.pct_change_since_story} />
        ) : (
          <NotAvailable />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <SentimentPill sentiment={story.sentiment} />
          <span className="font-mono text-[10px] text-text-faint">
            · {story.keywords.length} kata kunci · {relativeUpdated(story.created_at)}
          </span>
        </div>
        <h4 className="mt-1 text-[15px] font-semibold leading-tight text-text-primary">
          {story.title}
        </h4>
        <p className="mt-0.5 text-[12px] leading-snug text-text-muted line-clamp-1">
          {story.summary}
        </p>
      </div>
    </Link>
  );
}

/**
 * Dot timeline — one dot per story, equal-weighted and uniform in
 * color. The track is a single horizontal line that starts at the
 * left edge of the row and ends at the last dot. Each dot is a
 * button with a native `title` tooltip so hovering surfaces the
 * story's title. Renders nothing when the stories array is empty
 * so callers can safely drop it next to the loading skeleton and
 * empty state.
 */
function StoryTimeline({ stories }: { stories: EmbeddedStory[] }) {
  if (stories.length === 0) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
        Timeline
      </span>
      <div className="relative flex flex-1 items-center">
        {/* Track — starts and ends at the center of the first and last
            dots so the endpoints are anchored cleanly to the timeline. */}
        <div className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-border" />
        <div className="relative z-10 flex flex-1 items-center justify-between">
          {stories.map((story, index) => {
            const title = story.headline || "n/a";
            return (
              <button
                key={`${story.id}-${index}`}
                type="button"
                title={title}
                aria-label={title}
                className="block h-2 w-2 shrink-0 rounded-full bg-bullish transition-transform hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bullish/40"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Skeleton for the featured card block. */
function FeaturedSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-bg-secondary p-4">
      <div className="flex items-center gap-2">
        <Shimmer className="h-4 w-12" />
        <Shimmer className="h-4 w-20" />
      </div>
      <Shimmer className="mt-2.5 h-5 w-2/3" />
      <div className="mt-2 space-y-1.5">
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-4/5" />
      </div>
    </div>
  );
}

/** Loading placeholder — one featured block + three compact rows. */
function StoriesSkeleton() {
  return (
    <div>
      <FeaturedSkeleton />
      <ul className="mt-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="flex gap-3 border-t border-white py-3">
            <div className="flex w-[52px] shrink-0 flex-col gap-1">
              <Shimmer className="h-4 w-11" />
              <Shimmer className="h-3 w-10" />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <Shimmer className="h-3 w-24" />
              <Shimmer className="h-3.5 w-1/2" />
              <Shimmer className="h-3 w-full" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

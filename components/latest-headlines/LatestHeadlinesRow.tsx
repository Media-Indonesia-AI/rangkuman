"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { StoryItem } from "@/lib/api";
import type { Sentimen } from "@/lib/mock/recaps";
import { toSentimen } from "@/lib/util/sentiment";
import { cn } from "@/lib/utils";
import { getRelativeTime } from "@/lib/util/formatDate";
import { SentimentBadge } from "@/components/SentimentBadge";
import { ShareButton } from "@/components/ShareButton";
import { SITE_URL } from "@/lib/og";

/** Tailwind dot/rail color for a story's sentiment. */
function storyColor(sentiment: Sentimen | undefined): string {
  if (!sentiment) return "bg-text-muted";
  if (sentiment === "positif") return "bg-bullish";
  if (sentiment === "negatif") return "bg-bearish";
  return "bg-mixed";
}

interface LatestHeadlinesRowProps {
  /** The story to render. */
  story: StoryItem;
  /** When `true`, drop the bottom border (last row in the list). */
  isLast: boolean;
}

/**
 * One live timeline row — relative-time rail + colored dot,
 * sentiment pill, ticker badge, STORY tag, headline text, and a
 * per-row share button.
 *
 * Layout: the `<Link>` is an absolutely-positioned overlay (z-0)
 * spanning the whole row, with the visual content (rail, dot,
 * chips, headline, share button) sitting above it (z-10). This
 * mirrors the `<StockCardActions />` pattern — the link's hit
 * area covers the full row, but the ShareButton (a real
 * `<button>`) sits on top with its own click handler so it can
 * open the share popover without triggering navigation. The
 * link's `preventDefault` would also work, but nesting
 * `<button>` inside `<a>` is invalid HTML and React/Next.js
 * would warn, so the overlay split is the cleaner structural
 * choice.
 *
 * `pointer-events-none` on the content wrapper is the critical
 * piece — without it the z-10 wrapper covers the z-0 link and
 * intercepts every click on the chips/headline, breaking
 * navigation. With `pointer-events-none`, clicks pass through
 * the chips/headline straight to the link behind them. The
 * ShareButton opts back in with `pointer-events-auto` so it
 * stays interactive. Hover styles (`group-hover:*`) keep
 * working because CSS `:hover` propagates to ancestors when the
 * link underneath receives the hover.
 *
 * `group` lives on the `<li>` so the title's `group-hover:text-brand`
 * still fires when the visitor hovers anywhere on the row (the
 * overlay link's hover area covers the full `<li>`).
 *
 * Designed to be `key`-friendly inside the parent `<ol>` map
 * (`key={story.id}`); the rail layout assumes the row sits inside
 * a relative parent with `pl-8 pr-3 py-2.5`.
 */
export function LatestHeadlinesRow({ story, isLast }: LatestHeadlinesRowProps) {
  const sentiment = toSentimen(story.sentiment);
  const dotColor = storyColor(sentiment);

  return (
    <li className={cn("group relative", !isLast && "border-b border-border")}>
      {/* Whole-row link overlay — covers the `<li>` so the
          full row is clickable. Sits at z-0 so the visual
          content (chips, headline, share) can paint above it
          via z-10, but with `pointer-events-none` on the
          content wrapper below, clicks fall through to this
          link. The visible hover state comes from `group-hover`
          styles driven by the `<li>`'s group class. */}
      <Link
        href={`/sorotan/detail/${story.id}`}
        aria-label={story.title}
        className="absolute inset-0 z-0"
      />

      {/* Visual content row — relative so its descendants can
          stack above the link overlay. `pointer-events-none`
          passes clicks through to the overlay link; the
          ShareButton opts back in via `pointer-events-auto`
          on its wrapper below. */}
      <div className="pointer-events-none relative z-10 flex items-start gap-2 pl-8 pr-3 py-2.5 transition-colors group-hover:bg-bg-tertiary">
        {/* Vertical rail */}
        <span
          aria-hidden
          className={cn(
            "absolute left-3 top-0 bottom-0 w-0.5 -translate-x-1/2",
            dotColor,
          )}
        />
        {/* Dot at the row's top baseline */}
        <span
          aria-hidden
          className={cn(
            "absolute left-3 top-3.5 h-2 w-2 -translate-x-1/2 rounded-full ring-4 ring-bg-secondary",
            dotColor,
          )}
        />

        <div className="min-w-0 flex-1 space-y-1">
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

        {/* Per-row share button. `pointer-events-auto`
            re-enables pointer events on this wrapper (the
            surrounding content wrapper is `pointer-events-none`
            so clicks fall through to the overlay link). URL
            points at the sorotan detail page for this story
            so receivers land on the same headline. `tone` is
            omitted so the button follows the current theme —
            same as the parent card's `bg-bg-secondary`
            background. */}
        <div className="pointer-events-auto">
          <ShareButton
            variant="xs"
            title={story.title}
            url={`${SITE_URL}/sorotan/detail/${story.id}`}
            surface="latest_headlines_row"
          />
        </div>
      </div>
    </li>
  );
}
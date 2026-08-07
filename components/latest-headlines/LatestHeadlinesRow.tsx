"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { StoryItem } from "@/lib/api";
import type { Sentimen } from "@/lib/mock/recaps";
import { toSentimen } from "@/lib/util/sentiment";
import { cn } from "@/lib/utils";
import { getRelativeTime } from "@/lib/util/formatDate";
import { SentimentBadge } from "@/components/SentimentBadge";

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
 * sentiment pill, ticker badge, STORY tag, and the headline text.
 *
 * The whole row is a `<Link>` to `/sorotan/detail/{story.id}` so
 * the entire hit area (not just the headline text) is clickable.
 * The vertical rail + dot stay absolutely positioned *inside* the
 * link so the visual decoration still lines up with the padding.
 * `group` lives on the link so `group-hover:text-brand` on the
 * headline still fires when the visitor hovers anywhere on the
 * row.
 *
 * Designed to be `key`-friendly inside the parent `<ol>` map
 * (`key={story.id}`); the rail layout assumes the row sits inside
 * a relative parent with `pl-8 pr-3 py-2.5`.
 */
export function LatestHeadlinesRow({ story, isLast }: LatestHeadlinesRowProps) {
  const sentiment = toSentimen(story.sentiment);
  const dotColor = storyColor(sentiment);

  return (
    <li className={cn(!isLast && "border-b border-border")}>
      <Link
        href={`/sorotan/detail/${story.id}`}
        className={cn(
          "group relative block pl-8 pr-3 py-2.5 transition-colors hover:bg-bg-tertiary",
        )}
      >
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
      </Link>
    </li>
  );
}

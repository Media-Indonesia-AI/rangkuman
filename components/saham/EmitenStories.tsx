"use client";

import Link from "next/link";
import { Newspaper, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toSentimen } from "@/lib/util/sentiment";
import type { Sentimen } from "@/lib/mock/recaps";
import type { HeadlineLast7DaysItem } from "@/lib/api";
import { useMultiStories } from "@/lib/hooks/useMultiStories";
import { Shimmer } from "../Shimmer";

/**
 * "Story" widget — multi-date stories for a ticker
 * ("Konteks emiten yang lagi berkembang"). Renders one large featured
 * card (the latest story) followed by a stack of compact list rows.
 *
 * Data comes from `GET headlines/multi-date-stories` via
 * `useMultiStories(ticker)`. The endpoint provides ticker, title,
 * summary, sentiment, created_at, keywords, and topics — fields it
 * doesn't provide yet (a lifecycle status, a price move "sejak story",
 * a milestone timeline) render as `N/A` / are omitted.
 *
 * `ticker` is optional; it defaults to `DEFAULT_TICKER` so the widget
 * works on the non-ticker-scoped `/saham` page.
 */

/** Fallback ticker when the host page doesn't pass one. */
const DEFAULT_TICKER = "BBCA";

/** How many stories to request (featured + list rows). */
const STORY_LIMIT = 6;

/** Visual style per sentiment — pill colors + status dot. */
const sentimentStyle: Record<
  Sentimen,
  { label: string; pill: string; dot: string }
> = {
  positif: { label: "Positif", pill: "border-bullish/30 text-bullish", dot: "bg-bullish" },
  netral: { label: "Netral", pill: "border-border text-text-muted", dot: "bg-text-muted" },
  negatif: { label: "Negatif", pill: "border-bearish/30 text-bearish", dot: "bg-bearish" },
};

interface EmitenStoriesProps {
  /** Ticker to fetch stories for. Defaults to `DEFAULT_TICKER`. */
  ticker?: string;
  className?: string;
}

export function EmitenStories({
  ticker = DEFAULT_TICKER,
  className,
}: EmitenStoriesProps) {
  const { data: stories, isLoading } = useMultiStories(ticker, STORY_LIMIT);

  const [featured, ...rest] = stories;

  return (
    <section aria-label="Story emiten" className={className}>
      {/* Header */}
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
        <Link
          href="/trending"
          className="group inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold uppercase tracking-widest text-brand transition-colors hover:text-brand-hover"
        >
          Lihat semua ({stories.length})
          <ArrowRight
            className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>

      {isLoading ? (
        <StoriesSkeleton />
      ) : stories.length === 0 ? (
        <p className="py-6 text-center font-mono text-[11px] text-text-faint">
          Belum ada story untuk {ticker.toUpperCase()}.
        </p>
      ) : (
        <>
          <FeaturedStory story={featured} />
          <ul className="mt-1">
            {rest.map((story) => (
              <li key={story.id}>
                <StoryRow story={story} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

/** Ticker code chip. */
function TickerBadge({ kode }: { kode: string }) {
  return (
    <span className="rounded border border-border bg-bg-tertiary px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-wide text-text-primary">
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

function FeaturedStory({ story }: { story: HeadlineLast7DaysItem }) {
  const topic = story.topics[0]?.name;
  return (
    <Link
      href={`/stock/${story.primary_ticker_code}`}
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
      <p className="mt-1 text-[13px] leading-relaxed text-text-muted">
        {story.summary}
      </p>

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
        {/* Price move "sejak story" isn't in the endpoint yet. */}
        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-text-faint">
          <NotAvailable /> sejak story
        </span>
      </div>
    </Link>
  );
}

function StoryRow({ story }: { story: HeadlineLast7DaysItem }) {
  return (
    <Link
      href={`/stock/${story.primary_ticker_code}`}
      className="flex gap-3 border-t border-white py-3 transition-colors hover:bg-bg-secondary/60"
    >
      <div className="flex w-[52px] shrink-0 flex-col items-start gap-1">
        <TickerBadge kode={story.primary_ticker_code} />
        {/* Price change isn't in the endpoint yet. */}
        <NotAvailable />
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
        <p className="mt-0.5 text-[12px] leading-snug text-text-muted">
          {story.summary}
        </p>
      </div>
    </Link>
  );
}

/** Loading placeholder — one featured block + three compact rows. */
function StoriesSkeleton() {
  return (
    <div>
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

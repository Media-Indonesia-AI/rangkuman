"use client";

import Link from "next/link";
import { Newspaper, ArrowRight, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getEmitenStories,
  type EmitenStory,
  type EmitenStoryStatus,
} from "@/lib/mock/emiten-stories";

/**
 * "Story" widget — curated narrative contexts per emiten
 * ("Konteks emiten yang lagi berkembang"). Renders one large featured
 * card (the first story) followed by a stack of compact list rows.
 *
 * Data is mock (`getEmitenStories()`) — see `lib/mock/emiten-stories.ts`.
 * Purely presentational otherwise; each card links to the ticker's
 * detail page, and the header "Lihat semua" links to `/trending`.
 */

/** Visual style per lifecycle status — pill colors + status dot. */
const statusStyle: Record<
  EmitenStoryStatus,
  { label: string; pill: string; dot: string }
> = {
  berlangsung: {
    label: "Sedang berlangsung",
    pill: "border-bullish/30 text-bullish",
    dot: "bg-bullish",
  },
  berkembang: {
    label: "Berkembang",
    pill: "border-blue-400/40 text-blue-400",
    dot: "bg-blue-400",
  },
};

export function EmitenStories({ className }: { className?: string }) {
  const stories = getEmitenStories();
  if (stories.length === 0) return null;

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

      <FeaturedStory story={featured} />

      <ul className="mt-1">
        {rest.map((story) => (
          <li key={story.id}>
            <StoryRow story={story} />
          </li>
        ))}
      </ul>
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

/** Colored lifecycle pill with a leading status dot. */
function StatusPill({ status }: { status: EmitenStoryStatus }) {
  const s = statusStyle[status];
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

/** Signed percent change, `▲`/`▼` prefixed and colored. */
function ChangeBadge({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      className={cn(
        "num-tabular font-mono text-[10.5px] font-semibold",
        positive ? "text-bullish" : "text-bearish",
      )}
    >
      {positive ? "▲" : "▼"}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function FeaturedStory({ story }: { story: EmitenStory }) {
  const positive = story.changePercent >= 0;
  const ChangeIcon = positive ? TrendingUp : TrendingDown;
  return (
    <Link
      href={`/stock/${story.kode}`}
      className="block rounded-lg border border-border bg-bg-secondary p-4 transition-colors hover:border-border-strong"
    >
      <div className="flex flex-wrap items-center gap-2">
        <TickerBadge kode={story.kode} />
        <StatusPill status={story.status} />
        <span className="font-mono text-[10.5px] text-text-faint">
          · {story.liputanCount} liputan
        </span>
      </div>

      <h3 className="mt-2.5 text-lg font-bold leading-tight text-text-primary">
        {story.title}
      </h3>
      <p className="mt-1 text-[13px] leading-relaxed text-text-muted">
        {story.summary}
      </p>

      {story.timeline && (
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-text-faint">
              Timeline
            </span>
            <TimelineDots steps={story.timeline.steps} />
          </div>
          <span className="truncate font-mono text-[10.5px] text-text-faint">
            {story.timeline.milestone}
          </span>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white pt-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-mono text-[10.5px] text-text-muted">
            <Clock className="h-3 w-3" aria-hidden />
            Update {story.updatedLabel}
          </span>
          {story.topic && (
            <span className="rounded border border-border bg-bg-tertiary px-1.5 py-0.5 font-mono text-[9.5px] text-text-secondary">
              {story.topic}
            </span>
          )}
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 font-mono text-[11px] font-semibold num-tabular",
            positive ? "text-bullish" : "text-bearish",
          )}
        >
          <ChangeIcon className="h-3 w-3" aria-hidden />
          {positive ? "+" : ""}
          {story.changePercent.toFixed(1)}% sejak story
        </span>
      </div>
    </Link>
  );
}

/** Row of connected milestone dots for the featured timeline. */
function TimelineDots({ steps }: { steps: number }) {
  return (
    <span className="flex items-center" aria-hidden>
      {Array.from({ length: Math.max(steps, 1) }).map((_, i) => (
        <span key={i} className="flex items-center">
          {i > 0 && <span className="h-px w-3 bg-bullish/50" />}
          <span className="h-1.5 w-1.5 rounded-full bg-bullish" />
        </span>
      ))}
    </span>
  );
}

function StoryRow({ story }: { story: EmitenStory }) {
  return (
    <Link
      href={`/stock/${story.kode}`}
      className="flex gap-3 border-t border-white py-3 transition-colors hover:bg-bg-secondary/60"
    >
      <div className="flex w-[52px] shrink-0 flex-col items-start gap-1">
        <TickerBadge kode={story.kode} />
        <ChangeBadge value={story.changePercent} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusPill status={story.status} />
          <span className="font-mono text-[10px] text-text-faint">
            · {story.liputanCount} liputan · {story.updatedLabel}
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

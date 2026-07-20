"use client";

import { headlines as mockHeadlines } from "@/lib/mock/headlines";
import { cn } from "@/lib/utils";
import { SentimentBadge } from "@/components/SentimentBadge";

interface LatestHeadlinesFallbackRowProps {
  /** The mock headline to render. Pulled from the same mock
   *  collection (`lib/mock/headlines`) the widget falls back to
   *  when the live API call fails or returns empty. */
  headline: (typeof mockHeadlines)[number];
  /** When `true`, drop the bottom border (last row in the list). */
  isLast: boolean;
}

/**
 * One mock fallback row — visually mirrors `<LatestHeadlinesRow />`
 * but consumes the older `MarketHeadline` shape (uses `relativeTime`,
 * `ticker`, `sentiment`, `title`, `source`). Rendered only when the
 * live fetch errored / returned empty, so the timeline is never
 * blank when the user lands on the page.
 */
export function LatestHeadlinesFallbackRow({
  headline: h,
  isLast,
}: LatestHeadlinesFallbackRowProps) {
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

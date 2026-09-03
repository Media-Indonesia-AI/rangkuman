"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { TickerArticles } from "@/lib/api";
import type { SektorDisplayStock } from "@/lib/util/sectorMappers";
import { cn } from "@/lib/utils";

interface SektorNewsItemProps {
  /** The article whose `title` + `content` fill the body of the
   *  row, whose `source_name` populates the byline pill, whose
   *  `recap_date` drives the time chip on the left rail, and
   *  whose `source_url` is the row's click target (opens the
   *  publisher's article in a new tab). */
  story: TickerArticles;
  /** The stock the article belongs to. Drives the ticker + (optional)
   *  company name header and the byline's directional icon. Just
   *  context — the row itself links to the article, not the stock. */
  stock: SektorDisplayStock;
}

/** Normalize a publisher `source_url` to a fully-qualified `https://`
 *  URL. The wire sometimes hands us a bare hostname (e.g.
 *  `market.bisnis.com`); we prepend the protocol in that case so
 *  the browser treats the click as an external link instead of a
 *  same-origin navigation. Same convention as
 *  `<ArticlesByMediaWidget />`. */
function articleHref(sourceUrl: string): string {
  return /^https?:\/\//i.test(sourceUrl) ? sourceUrl : `https://${sourceUrl}`;
}

/**
 * One row in the sector news feed — `<SektorDetailNews />`.
 *
 * Self-contained: the parent passes a `story` + `stock` pair and
 * the row renders:
 *
 *   - left rail — the publication **time** chip (`"14:30"`,
 *     `"09:05"` …) derived from the article's `recap_date`.
 *     Lives where the old rank strip used to be, so the row
 *     layout stays balanced without a global row number. The day
 *     context is already carried by the parent's day-group header
 *     above, so a single time stamp is enough for the reader to
 *     place it on the timeline.
 *   - body — ticker + (optional) company name, then the article's
 *     `title` (the headline), then its `content` (the recap
 *     paragraph), then a byline pill with the publisher name from
 *     `source_name`, prefixed by a small directional icon
 *     (`<TrendingUp />` / `<Minus />` / `<TrendingDown />`)
 *     tinted by the stock's `changePercent` sign so the reader
 *     can scan direction at a glance. Only the icon is tinted —
 *     the source name itself stays muted so "CNN Indonesia"
 *     doesn't read as bullish/bearish.
 *
 * The whole row is a single `<a target="_blank">` to the
 * publisher's article URL (`story.source_url`, normalized via
 * `articleHref` so bare hostnames get `https://` prepended).
 * Same convention as `<ArticlesByMediaWidget />` and
 * `<HeadlineDetailSources />` — the click takes the reader straight
 * to the source article rather than to an internal recap page.
 * The parent stock ticker shown in the body header is just
 * context, not a sub-link target.
 *
 * The hook lives in the parent (`<SektorDetailNews />` mounts one
 * `<StoryCollector />` per stock); this row receives the resolved
 * data as props and stays purely presentational.
 */
export function SektorNewsItem({ story, stock }: SektorNewsItemProps) {
  const stockPositive = stock.changePercent > 0;
  const stockFlat = stock.changePercent === 0;

  // Click target — the publisher's article URL, normalized via
  // `articleHref`. Opens in a new tab so the reader keeps their
  // place on the sector detail page.
  const href = articleHref(story.source_url);

  const DirectionIcon = stockPositive
    ? TrendingUp
    : stockFlat
      ? Minus
      : TrendingDown;
  const directionColor = stockPositive
    ? "text-bullish"
    : stockFlat
      ? "text-text-muted"
      : "text-bearish";

  // Time-of-day chip (HH:MM, 24-hour, local TZ). Returns "" when
  // the timestamp is missing/unparseable so the caller can decide
  // on a fallback (em-dash) without the chip collapsing.
  const timeLabel = formatTimeOfDay(story.recap_date);

  return (
    <li className="list-none">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-stretch gap-4 overflow-hidden rounded-lg border border-border bg-bg-secondary px-4 py-3 transition-all hover:border-border-strong hover:shadow-card-hover"
      >
        {/* Left rail — publication time (HH:MM) */}
        <div className="flex shrink-0 items-start pt-0.5">
          <span className="font-mono text-[10px] font-semibold text-text-faint num-tabular">
            {timeLabel || "—"}
          </span>
        </div>

        {/* Body column — ticker + title + content + source byline */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="font-mono text-[14px] font-bold leading-tight tracking-tight text-text-primary group-hover:text-brand">
              {stock.kode}
            </h3>
            {stock.nama && (
              <span className="truncate text-[11px] text-text-muted">
                {stock.nama}
              </span>
            )}
          </div>
          {story.title && (
            <p className="mt-1.5 line-clamp-2 text-[13px] font-medium leading-snug text-text-primary">
              {story.title}
            </p>
          )}
          {story.content && (
            <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-text-muted">
              {story.content}
            </p>
          )}
          {story.source_name && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5 font-mono text-[10px] num-tabular text-text-faint">
              <DirectionIcon
                className={cn("h-3 w-3 shrink-0", directionColor)}
                aria-hidden
              />
              <span className="truncate">{story.source_name}</span>
            </div>
          )}
        </div>
      </a>
    </li>
  );
}

/** Format an ISO timestamp as `HH:MM` (24-hour, local TZ) for
 *  the row's time chip. Returns `""` for missing or unparseable
 *  input so the caller can decide on a fallback (e.g. `"—"`).
 *  Manual `getHours` / `getMinutes` padding avoids the
 *  locale-dependent separators (`toLocaleTimeString("id-ID", …)`
 *  returns `14.30` with a dot, which would clash with the
 *  project's mono-tabular convention used elsewhere). */
function formatTimeOfDay(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

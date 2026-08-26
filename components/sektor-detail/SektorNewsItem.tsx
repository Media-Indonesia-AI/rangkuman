"use client";

import Link from "next/link";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { EmbeddedStory } from "@/lib/api";
import type { SektorDisplayStock } from "@/lib/util/sectorMappers";
import { cn } from "@/lib/utils";

interface SektorNewsItemProps {
  /** The story whose `summary` is rendered as the recap paragraph
   *  on this row. Owns the `articles[]` whose `source_name`s
   *  populate the byline pill at the bottom, and the
   *  `recap_date`/`created_at` that drives the time chip on the
   *  left rail. */
  story: EmbeddedStory;
  /** The stock the story belongs to. Drives the ticker + (optional)
   *  company name header and the byline's directional icon. Linked
   *  target is `/stock/{stock.kode}`. */
  stock: SektorDisplayStock;
}

/** How many source names to show inline before truncating to a
 *  "+N" overflow. Three keeps the byline to a single visual line
 *  for most stories; longer lists get a muted overflow badge. */
const MAX_VISIBLE_SOURCES = 3;

/**
 * One row in the sector news feed — `<SektorDetailNews />`.
 *
 * Self-contained: the parent passes a `story` + `stock` pair and
 * the row renders:
 *
 *   - left rail — the publication **time** chip (`"14:30"`,
 *     `"09:05"` …) derived from the story's `recap_date`
 *     (falling back to `created_at`). Lives where the old rank
 *     strip used to be, so the row layout stays balanced without
 *     the global row number. The day context is already carried
 *     by the parent's day-group header above, so a single time
 *     stamp per story is enough for the reader to place it on
 *     the timeline.
 *   - body — ticker + (optional) company name, then the story's
 *     headline (the story-level title from the older
 *     `EmbeddedStory.headline` field — kept distinct from the
 *     per-article `excerpt` to keep each row to a single
 *     scannable line), then a byline pill with the actual
 *     publisher names (e.g. "CNN Indonesia, Kompas, CNBC +1")
 *     derived from the unique `source_name` set across
 *     `story.articles[]`, prefixed by a small directional icon
 *     (`<TrendingUp />` / `<Minus />` / `<TrendingDown />`)
 *     tinted by the stock's `changePercent` sign so the reader
 *     can scan direction at a glance. Only the icon is tinted —
 *     the source names themselves stay muted so "CNN Indonesia"
 *     doesn't read as bullish/bearish.
 *
 * The whole row is a single `<Link>` to `/stock/{stock.kode}?id={headline_id}`
 * (when `headline_id` is present) so the click deep-links into the
 * stock detail page with the right headline, mirroring the
 * `<SektorTopStockCard />` and `<SektorCard />` conventions.
 *
 * The hook lives in the parent (`<SektorDetailNews />` mounts one
 * `<StoryCollector />` per stock); this row receives the resolved
 * data as props and stays purely presentational.
 */
export function SektorNewsItem({ story, stock }: SektorNewsItemProps) {
  const stockPositive = stock.changePercent > 0;
  const stockFlat = stock.changePercent === 0;

  const params = story.headline_id ? new URLSearchParams({ id: story.headline_id }).toString() : "";
  const href = `/stock/${stock.kode}${params ? `?${params}` : ""}`;

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

  // Unique publisher display names from this story's articles[].
  // De-duped via a Set walk (mirrors the same pattern in
  // `<ArticlesByMediaWidget />` and the stock-detail page) so the
  // same outlet listed twice doesn't double-count. Order follows
  // `Array.from(set)` insertion order, which matches the wire's
  // article order — gives a stable, predictable byline.
  const sources = Array.from(
    new Set(
      (story.articles ?? [])
        .map((a) => a.source_name)
        .filter((s): s is string => Boolean(s)),
    ),
  );
  const overflow = Math.max(0, sources.length - MAX_VISIBLE_SOURCES);
  const visibleSources = sources.slice(0, MAX_VISIBLE_SOURCES);

  // Time-of-day chip (HH:MM, 24-hour, local TZ). Falls back to
  // `created_at` when `recap_date` is missing, and to a quiet
  // em-dash when neither is parseable so the left rail never
  // collapses.
  const timeLabel = formatTimeOfDay(
    story.recap_date || story.created_at || "",
  );

  return (
    <li className="list-none">
      <Link
        href={href}
        className="group flex items-stretch gap-4 overflow-hidden rounded-lg border border-border bg-bg-secondary px-4 py-3 transition-all hover:border-border-strong hover:shadow-card-hover"
      >
        {/* Left rail — publication time (HH:MM) */}
        <div className="flex shrink-0 items-start pt-0.5">
          <span className="font-mono text-[10px] font-semibold text-text-faint num-tabular">
            {timeLabel || "—"}
          </span>
        </div>

        {/* Body column — ticker + recap paragraph + source byline */}
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
          {story.headline && (
            <p className="mt-1.5 text-[12.5px] leading-snug text-text-secondary">
              {story.headline}
            </p>
          )}
          {visibleSources.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5 font-mono text-[10px] num-tabular text-text-faint">
              <DirectionIcon
                className={cn("h-3 w-3 shrink-0", directionColor)}
                aria-hidden
              />
              <span className="truncate">
                {visibleSources.join(", ")}
                {overflow > 0 && `, +${overflow}`}
              </span>
            </div>
          )}
        </div>
      </Link>
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
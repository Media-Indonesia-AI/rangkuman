"use client";

import Link from "next/link";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { EmbeddedStory } from "@/lib/api";
import type { SektorDisplayStock } from "@/lib/util/sectorMappers";
import { cn } from "@/lib/utils";

interface SektorNewsItemProps {
  /** The story whose `summary` is rendered as the recap paragraph
   *  on this row. Owns the `articles[]` the per-row media count
   *  is derived from. */
  story: EmbeddedStory;
  /** The stock the story belongs to. Drives the ticker + (optional)
   *  company name header and the day-change percent on the right.
   *  Linked target is `/stock/{stock.kode}`. */
  stock: SektorDisplayStock;
  /** 1-based global rank across the section, assigned by the parent
   *  after sorting all stories by date desc. Rendered as "#01",
   *  "#02" in the rank strip. */
  rank: number;
}

/**
 * One row in the sector news feed — `<SektorDetailNews />`.
 *
 * Self-contained: the parent passes a `story` + `stock` pair and
 * a `rank`, and the row renders:
 *
 *   - left — the global rank strip ("#01", "#02"),
 *   - middle — ticker + (optional) company name, then one
 *     paragraph per article in `story.articles[]` rendering
 *     each article's `excerpt` (the editorial dek — the "all
 *     articles" content), then a "<n> media" pill driven by the
 *     unique `source_name` count across `story.articles[]`,
 *   - right — the stock's day-change percent, colored bullish
 *     when positive, bearish when negative, muted when flat.
 *     A small `<TrendingUp />` / `<Minus />` / `<TrendingDown />`
 *     icon next to the media count mirrors that direction so the
 *     reader can scan direction at a glance.
 *
 * The whole row is a single `<Link>` to `/stock/{stock.kode}` so
 * the full hit-area is clickable, mirroring the
 * `<SektorTopStockCard />` and `<SektorCard />` conventions.
 *
 * Articles without an `excerpt` are skipped — older wire rows
 * don't carry one (see `StoryArticle.excerpt?`). When every
 * article is excerpt-less, the excerpt block renders nothing
 * and the row keeps the ticker + media pill only, so the layout
 * stays predictable.
 *
 * The hook lives in the parent (`<SektorDetailNews />` mounts one
 * `<StoryCollector />` per stock); this row receives the resolved
 * data as props and stays purely presentational.
 */
export function SektorNewsItem({ story, stock, rank }: SektorNewsItemProps) {
  const stockPositive = stock.changePercent > 0;
  const stockFlat = stock.changePercent === 0;
  const href = `/stock/${stock.kode}`;

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

  // Articles with a usable `excerpt` — older wire rows omit the
  // field, so we filter rather than render blank paragraphs.
  const excerptArticles = (story.articles ?? []).filter(
    (a): a is typeof a & { excerpt: string } => Boolean(a.excerpt),
  );

  // Per-story media count — unique `source_name` across this
  // story's `articles[]`. Mirrors the Set walk in
  // `<ArticlesByMediaWidget />` and the per-row "Diliput media"
  // count on the stock detail page.
  const mediaCount = new Set(
    (story.articles ?? [])
      .map((a) => a.source_name)
      .filter((s): s is string => Boolean(s)),
  ).size;

  return (
    <li className="list-none">
      <Link
        href={href}
        className="group flex items-stretch gap-4 overflow-hidden rounded-lg border border-border bg-bg-secondary px-4 py-3 transition-all hover:border-border-strong hover:shadow-card-hover"
      >
        {/* Global rank strip */}
        <div className="flex shrink-0 items-start pt-0.5">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-faint num-tabular">
            #{String(rank).padStart(2, "0")}
          </span>
        </div>

        {/* Main column — ticker + recap paragraph + media pill */}
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
          {excerptArticles.length > 0 && (
            <div className="mt-1.5 space-y-1">
              {excerptArticles.map((article, idx) => (
                <p
                  key={`${article.source_url}-${idx}`}
                  className="text-[12.5px] leading-snug text-text-secondary"
                >
                  {article.excerpt}
                </p>
              ))}
            </div>
          )}
          {mediaCount > 0 && (
            <div
              className={cn(
                "mt-2 flex items-center gap-1 font-mono text-[10px] num-tabular",
                directionColor,
              )}
            >
              <DirectionIcon className="h-3 w-3" aria-hidden />
              <span>{`${mediaCount} media`}</span>
            </div>
          )}
        </div>

        {/* Right column — stock day-change percent */}
        <div className="flex shrink-0 items-center">
          <span
            className={cn(
              "font-mono text-[13px] font-semibold num-tabular",
              directionColor,
            )}
          >
            {`${stockPositive ? "+" : stockFlat ? "" : "-"}${Math.abs(stock.changePercent).toFixed(2)}%`}
          </span>
        </div>
      </Link>
    </li>
  );
}

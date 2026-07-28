"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SentimentBadge } from "@/components/SentimentBadge";
import type { StockTrendingItem } from "@/lib/api";
import { toSentimen } from "@/lib/util/sentiment";
import { cn } from "@/lib/utils";

interface TrendingRowProps {
  /** The trending ticker to render. Drives every field on the row. */
  item: StockTrendingItem;
  /** 1-based rank in the list. Passed in by the parent
   *  (`<TrendingList />`) so the row stays a pure presentation
   *  component — the data payload from the API doesn't carry
   *  a rank field, so it's derived from the list index. */
  rank: number;
}

/**
 * One trending row — links to `/stock/{ticker}` and renders two
 * distinct layouts from the same data, gated on Tailwind's `sm:`
 * breakpoint:
 *
 *   - **Mobile** (default): stacked vertically. Rank + ticker +
 *     company name + sentiment + change share the first row,
 *     articles + media + price share the second row. Keeps the
 *     row's hit area wide and avoids cramping a 5-column grid
 *     below 640px.
 *   - **Desktop** (`sm:`+): 5-column grid that matches the
 *     table-style header row rendered above the list
 *     (`TrendingList`). Rank · Saham · Sentimen · Artikel/Media ·
 *     Perubahan.
 *
 * Field mapping from the API wire shape (`StockTrendingItem`) to
 * the row's display:
 *
 *   - `ticker`              → ticker (heading) + URL slug
 *   - `company_name`        → company name (subdued line)
 *   - `sentiment`           → `<SentimentBadge />`
 *   - `article_count`       → article count
 *   - `distinct_sources`    → media count
 *   - `price`               → formatted price
 *   - `pct_change`          → signed percent change
 *
 * The `sektor` field from the prior mock payload isn't on the
 * trending endpoint, so the sector subline is dropped here.
 *
 * The whole row is a single `<Link>` so the click hit area
 * covers the entire tile, including the trailing `ArrowUpRight`
 * chevron — mirrors the whole-link convention used by
 * `<SektorTopStockCard />` and `<CommodityTile />`.
 */
export function TrendingRow({ item: r, rank }: TrendingRowProps) {
  const href = `/stock/${r.ticker}`;
  const isUp = r.pct_change >= 0;
  const changeSign = isUp ? "▲ +" : "▼ ";
  const sentimen = toSentimen(r.sentiment);

  return (
    <li>
      <Link
        href={href}
        className="group block px-3 py-3 transition-colors hover:bg-bg-tertiary/60 sm:grid sm:grid-cols-[40px_1fr_60px_120px_120px] sm:items-center sm:gap-3 sm:px-4 sm:py-3"
      >
        {/* Mobile card layout (stacked vertically) */}
        <div className="flex flex-col gap-1.5 sm:hidden">
          {/* Row 1: rank + ticker + company + sentiment + change */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-baseline gap-2">
              <span className="font-mono text-[10px] font-semibold leading-none text-text-faint num-tabular">
                #{String(rank).padStart(2, "0")}
              </span>
              <span className="font-mono text-[16px] font-bold leading-none tracking-tighter text-text-primary group-hover:text-brand">
                {r.ticker}
              </span>
              <span className="truncate text-[10.5px] text-text-muted">
                {r.company_name}
              </span>
            </div>
            <span
              className={cn(
                "font-mono text-[12.5px] font-semibold leading-none num-tabular",
                isUp ? "text-bullish" : "text-bearish",
              )}
            >
              {changeSign}
              {Math.abs(r.pct_change).toFixed(2)}%
            </span>
          </div>
          {/* Row 2: sentiment + articles + media + price */}
          <div className="flex items-center gap-2">
            <SentimentBadge
              sentiment={sentimen}
              size="sm"
              showLabel={false}
            />
            <span className="font-mono text-[10px] text-text-muted">
              {r.article_count} art · {r.distinct_sources} md
            </span>
            <span className="ml-auto truncate font-mono text-[10px] uppercase tracking-wider text-text-faint">
              Rp {r.price.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Desktop table layout */}
        <span className="hidden font-mono text-[13.5px] font-semibold leading-none text-text-faint num-tabular sm:inline">
          {String(rank).padStart(2, "0")}
        </span>
        <div className="hidden min-w-0 sm:block">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[16px] font-bold leading-none tracking-tighter text-text-primary group-hover:text-brand">
              {r.ticker}
            </span>
            <span className="truncate text-[11.5px] text-text-muted">
              {r.company_name}
            </span>
          </div>
          <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-wider text-text-faint">
            Rp {r.price.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="hidden sm:flex sm:justify-center">
          <SentimentBadge sentiment={sentimen} size="sm" />
        </div>
        <div className="hidden text-right sm:block">
          <p className="font-mono text-[12.5px] font-semibold text-text-primary num-tabular">
            {r.article_count}
          </p>
          <p className="font-mono text-[9.5px] text-text-muted">
            {r.distinct_sources} media
          </p>
        </div>
        <div className="hidden items-center justify-end gap-2 sm:flex">
          <p
            className={cn(
              "font-mono text-[12.5px] font-semibold leading-none num-tabular",
              isUp ? "text-bullish" : "text-bearish",
            )}
          >
            {changeSign}
            {Math.abs(r.pct_change).toFixed(2)}%
          </p>
          <ArrowUpRight
            className="h-3 w-3 shrink-0 text-text-faint transition-colors group-hover:text-brand"
            aria-hidden
          />
        </div>
      </Link>
    </li>
  );
}

"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { SektorDisplayStock } from "@/lib/util/sectorMappers";
import { cn } from "@/lib/utils";

interface SektorTopStockCardProps {
  /** The stock to render. Drives every field on the card —
   *  `kode` is the link target + primary label, `price` /
   *  `changePercent` fill the price row, `nama` (optional,
   *  since the wire `SectorStock` doesn't always carry one)
   *  is the muted secondary label. */
  stock: SektorDisplayStock;
  /** 1-based rank in the top-N list. Rendered as "#01", "#02"
   *  in the rank strip. Pass the array index + 1 from the
   *  parent map. */
  rank: number;
}

/**
 * One card in the sector detail page's "Top 5" stock grid.
 *
 * Self-contained so `<SektorTopStocks />` only has to map
 * `stocks.map((s, i) => <SektorTopStockCard stock={s} rank={i + 1} />)`.
 * Renders a single `<Link>` to `/stock/{kode}` wrapping:
 *   - top rank strip with the #NN badge,
 *   - the ticker + optional company name row,
 *   - the price + day-change row (bullish/bearish colored),
 *   - the footer row with a "Live dari API" pill and the
 *     `ArrowUpRight` CTA affordance.
 *
 * The whole card is a single `<Link>` so the click hit area
 * covers the entire tile, not just the bottom CTA — mirrors
 * the `SektorCard` and `CommodityTile` conventions.
 *
 * `nama` is rendered only when present. The wire `SectorStock`
 * payload may omit it; in that case the card collapses to
 * ticker + price + change (no muted secondary label), keeping
 * the layout stable.
 */
export function SektorTopStockCard({ stock, rank }: SektorTopStockCardProps) {
  const stockPositive = stock.changePercent >= 0;
  const href = `/stock/${stock.kode}`;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-bg-secondary transition-all hover:border-border-strong hover:shadow-card-hover"
    >
      {/* Top rank strip */}
      <div className="flex items-center justify-between border-b border-border bg-bg-tertiary px-3 py-1.5">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-faint num-tabular">
          #{String(rank).padStart(2, "0")}
        </span>
      </div>

      <div className="p-3.5">
        <div className="flex items-baseline gap-2">
          <h3 className="font-mono text-[20px] font-bold leading-none tracking-tighter text-text-primary group-hover:text-brand">
            {stock.kode}
          </h3>
          {stock.nama && (
            <span className="truncate text-[11px] text-text-muted">
              {stock.nama}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-mono text-[16px] font-bold leading-none text-text-primary num-tabular">
            {stock.price.toLocaleString("id-ID")}
          </span>
          <span
            className={cn(
              "font-mono text-[12px] font-semibold num-tabular",
              stockPositive ? "text-bullish" : "text-bearish",
            )}
          >
            {stockPositive ? "▲ +" : "▼ "}
            {Math.abs(stock.changePercent).toFixed(2)}%
          </span>
        </div>

        <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2">
          <span className="font-mono text-[10px] text-text-faint">
            Live dari API
          </span>
          <ArrowUpRight
            className="h-3 w-3 text-text-faint transition-colors group-hover:text-brand"
            aria-hidden
          />
        </div>
      </div>
    </Link>
  );
}
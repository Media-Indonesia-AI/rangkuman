"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SparklineChart } from "@/components/SparklineChart";
import { useCommodityHistorical } from "@/lib/hooks/useCommodityHistorical";
import type { DisplayCommodity } from "@/lib/util/commodityCategoriesMappers";
import { cn } from "@/lib/utils";
import { iconFor } from "./commodityIcons";
import type { CategoryStyle } from "./categoryStyles";

interface CommodityTileProps {
  /** The commodity to render. Drives every field on the tile. */
  commodity: DisplayCommodity;
  /**
   * Resolved styling for the tile's badge and section-colored
   * elements (icon chip, change label inherits via parent). Comes
   * pre-computed from `styleForBucket(commodity.category)` by the
   * caller so the tile stays purely presentational and doesn't
   * have to reach back into the bucket-resolution logic.
   */
  style: CategoryStyle;
}

/** Format price with appropriate precision. */
function formatPrice(p: number): string {
  return p.toLocaleString("en-US", {
    maximumFractionDigits: p >= 1000 ? 0 : 2,
  });
}

/**
 * One tile in the commodity-price grid.
 *
 * Self-contained so `<CommodityPrices />` only has to orchestrate
 * the section header and the per-category grid mapping. Renders
 * a single `<Link>` wrapping:
 *   - the icon + name + change% top row,
 *   - the price + currency/unit row,
 *   - the sparkline (powered by `useCommodityHistorical`),
 *   - the top-3 related-stocks footer with the trailing
 *     `ArrowUpRight` affordance.
 *
 * Each tile fetches its own historical series via
 * `useCommodityHistorical(commodity.symbol, "1M")` — the cache
 * module dedupes concurrent fetches of the same symbol, so
 * mounting 10 tiles triggers at most 10 unique round-trips, not
 * 10 simultaneous fetches per tile.
 *
 * The whole tile is a single `<Link>` so the click hit area
 * covers the entire card, not just the footer CTA — mirrors the
 * `SektorCard` convention.
 *
 * `style` is passed in (rather than re-resolved inside) so a
 * future caller can mix-and-match — e.g. a "highlight" tile that
 * borrows the price/change layout but uses a brand-colored chip
 * instead of the section palette.
 */
export function CommodityTile({ commodity, style }: CommodityTileProps) {
  const Icon = iconFor(commodity);
  const positive = commodity.changePercent >= 0;
  const { data: historyPoints } = useCommodityHistorical(commodity.symbol, "1M");
  const rates = historyPoints?.map((p) => p.rate) ?? [];

  return (
    <Link
      href="#"
      className="group relative flex flex-col gap-1 overflow-hidden rounded-md border border-border bg-bg-secondary p-2 transition-all hover:border-border-strong hover:shadow-card-hover"
    >
      {/* Top row: icon + name + change */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-1">
          <span
            className={cn(
              "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded",
              style.bg,
              style.text,
            )}
          >
            <Icon className="h-2.5 w-2.5" aria-hidden />
          </span>
          <span className="truncate text-[11px] font-semibold leading-tight text-text-primary">
            {commodity.name}
          </span>
        </div>
        <span
          className={cn(
            "shrink-0 font-mono text-[9.5px] font-semibold leading-none num-tabular",
            positive ? "text-bullish" : "text-bearish",
          )}
        >
          {positive ? "+" : ""}
          {commodity.changePercent.toFixed(2)}%
        </span>
      </div>

      {/* Price + currency/unit */}
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-[15px] font-bold leading-none tracking-tight text-text-primary num-tabular">
          {formatPrice(commodity.price)}
        </span>
        <span className="truncate font-mono text-[8.5px] text-text-muted">
          {commodity.currency}/{commodity.unit}
        </span>
      </div>

      {/* Sparkline — very compact. Falls back to the chart's
       *  empty-state div while the per-symbol historical fetch
       *  is in flight (same visual as before data arrives). */}
      <SparklineChart
        data={rates}
        positive={positive}
        height={18}
        showArea
      />

      {/* Related stocks footer — single line, very small */}
      <div className="-mx-2 -mb-2 flex items-center justify-between border-t border-border bg-bg-tertiary/40 px-2 py-1">
        <p className="truncate font-mono text-[8.5px] text-text-muted">
          {commodity.relatedStocks.slice(0, 3).map((t, i) => (
            <span key={t}>
              <span className="font-semibold uppercase tracking-wide text-text-secondary">
                {t}
              </span>
              {i < Math.min(commodity.relatedStocks.length, 3) - 1 && (
                <span className="mx-0.5 text-text-faint">·</span>
              )}
            </span>
          ))}
          {commodity.relatedStocks.length > 3 && (
            <span className="ml-0.5 text-text-faint">
              +{commodity.relatedStocks.length - 3}
            </span>
          )}
        </p>
        <ArrowUpRight
          className="h-2.5 w-2.5 shrink-0 text-text-faint transition-colors group-hover:text-brand"
          aria-hidden
        />
      </div>
    </Link>
  );
}
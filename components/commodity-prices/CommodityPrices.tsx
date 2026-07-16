"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SparklineChart } from "@/components/SparklineChart";
import { useCommodityCategories } from "@/lib/hooks/useCommodityCategories";
import {
  mapCommodityCategories,
  type CommodityCategorySlug,
  type DisplayCategory,
} from "@/lib/util/commodityCategoriesMappers";
import { cn } from "@/lib/utils";
import { iconFor } from "./commodityIcons";
import { styleForBucket } from "./categoryStyles";
import { CommodityPricesEmpty } from "./CommodityPricesEmpty";
import { CommodityPricesShimmer } from "./CommodityPricesShimmer";

interface CommodityPricesProps {
  filter?: CommodityCategorySlug;
}

/** Format price with appropriate precision. */
function formatPrice(p: number): string {
  return p.toLocaleString("en-US", {
    maximumFractionDigits: p >= 1000 ? 0 : 2,
  });
}

/**
 * One-section-per-wire-category commodity grid:
 *  - Header strip ("Komoditas · penggerak IHSG")
 *  - One tile grid per wire category, in the order the backend
 *    returned them. Each section uses the wire category's
 *    localized `name_id` (title-cased) as its label and the
 *    resolved styling bucket (energi / logam / pertanian, with
 *    a generic neutral fallback) for its chip color.
 *
 * Data is fetched live from `GET stocks/commodity-categories`
 * via `useCommodityCategories` and projected onto
 * `DisplayCategory[]` by `mapCommodityCategories` — see
 * `lib/util/commodityCategoriesMappers.ts` for the per-field
 * derivation rules. The mapper already filters out wire
 * categories whose `commodities[]` is empty, so every entry
 * rendered here is guaranteed to have at least one tile.
 *
 * Three render branches (mirrors `<SektorSection />`):
 *   1. `isLoading`     → shimmer skeleton (`CommodityPricesShimmer`)
 *   2. data is null    → empty-state shell (`CommodityPricesEmpty`)
 *   3. real data       → the populated grid (this function)
 *
 * The optional `filter` prop narrows to a single styling
 * bucket (`"energi" | "logam" | "pertanian"`). When set, the
 * grid renders only sections whose bucket matches.
 *
 * Styling helpers live alongside this file:
 *   - `./categoryStyles` — per-bucket chip colors
 *   - `./commodityIcons` — per-commodity / per-category icon lookup
 *
 * State variants live in:
 *   - `./CommodityPricesShimmer`
 *   - `./CommodityPricesEmpty`
 */
export function CommodityPrices({ filter }: CommodityPricesProps) {
  const { data, isLoading } = useCommodityCategories();

  if (isLoading) {
    return <CommodityPricesShimmer />;
  }

  const sections: DisplayCategory[] = data ? mapCommodityCategories(data) : [];

  if (sections.length === 0) {
    return <CommodityPricesEmpty />;
  }

  const visible = filter
    ? sections.filter((s) => s.bucket === filter)
    : sections;

  if (visible.length === 0) {
    return <CommodityPricesEmpty />;
  }

  const totalInstruments = visible.reduce(
    (sum, s) => sum + s.commodities.length,
    0,
  );

  return (
    <section aria-label="Harga Komoditas">
      {/* Header — compact, single line */}
      <header className="mb-2 flex items-end justify-between gap-3 border-b border-border-strong pb-1.5">
        <div className="min-w-0">
          <h2 className="truncate text-[14px] font-bold tracking-tight text-text-primary">
            Komoditas · penggerak IHSG
          </h2>
          <p className="text-[10.5px] text-text-muted">
            Update harian · dikaitkan ke emiten IDX terdampak
          </p>
        </div>
        <span className="shrink-0 font-mono text-[10px] text-text-faint">
          {totalInstruments} instrumen
        </span>
      </header>

      {/* One tile grid per wire category — no client-side regrouping. */}
      <div className="space-y-3">
        {visible.map((cat) => {
          const cfg = styleForBucket(cat.bucket);
          const items = cat.commodities;
          return (
            <div key={cat.id}>
              {/* Category header — inline, very compact */}
              <div className="mb-1.5 flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center rounded border px-1.5 py-px font-mono text-[9px] font-semibold uppercase tracking-widest",
                    cfg.text,
                    cfg.bg,
                    cfg.border,
                  )}
                >
                  {cat.label}
                </span>
                <span className="font-mono text-[9px] text-text-faint">
                  {items.length}
                </span>
              </div>

              {/* Compact tile grid — 2/3/4/5 cols */}
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {items.map((c) => {
                  const Icon = iconFor(c);
                  const positive = c.changePercent >= 0;
                  return (
                    <Link
                      key={c.id}
                      href="#"
                      className="group relative flex flex-col gap-1 overflow-hidden rounded-md border border-border bg-bg-secondary p-2 transition-all hover:border-border-strong hover:shadow-card-hover"
                    >
                      {/* Top row: icon + name + change */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex min-w-0 items-center gap-1">
                          <span
                            className={cn(
                              "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded",
                              cfg.bg,
                              cfg.text,
                            )}
                          >
                            <Icon className="h-2.5 w-2.5" aria-hidden />
                          </span>
                          <span className="truncate text-[11px] font-semibold leading-tight text-text-primary">
                            {c.name}
                          </span>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 font-mono text-[9.5px] font-semibold leading-none num-tabular",
                            positive ? "text-bullish" : "text-bearish",
                          )}
                        >
                          {positive ? "+" : ""}
                          {c.changePercent.toFixed(2)}%
                        </span>
                      </div>

                      {/* Price + unit */}
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono text-[15px] font-bold leading-none tracking-tight text-text-primary num-tabular">
                          {formatPrice(c.price)}
                        </span>
                        <span className="truncate font-mono text-[8.5px] text-text-muted">
                          {c.unit}
                        </span>
                      </div>

                      {/* Sparkline — very compact */}
                      <SparklineChart
                        data={c.history}
                        positive={positive}
                        height={18}
                        showArea
                      />

                      {/* Related stocks footer — single line, very small */}
                      <div className="-mx-2 -mb-2 flex items-center justify-between border-t border-border bg-bg-tertiary/40 px-2 py-1">
                        <p className="truncate font-mono text-[8.5px] text-text-muted">
                          {c.relatedStocks.slice(0, 3).map((t, i) => (
                            <span key={t}>
                              <span className="font-semibold uppercase tracking-wide text-text-secondary">
                                {t}
                              </span>
                              {i < Math.min(c.relatedStocks.length, 3) - 1 && (
                                <span className="mx-0.5 text-text-faint">·</span>
                              )}
                            </span>
                          ))}
                          {c.relatedStocks.length > 3 && (
                            <span className="ml-0.5 text-text-faint">
                              +{c.relatedStocks.length - 3}
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
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
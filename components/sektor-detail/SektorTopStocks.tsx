"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import {
  type SektorDisplay,
  type SektorDisplayStock,
} from "@/lib/util/sectorMappers";
import { SektorTopStockCard } from "./SektorTopStockCard";

interface SektorTopStocksProps {
  /** The live-mapped sector whose `leadingStocks` and
   *  `laggingStocks` buckets are rendered in full — no
   *  client-side top-N slicing. The page that mounts this
   *  component is responsible for asking the API for a large
   *  enough `limit` that the buckets are meaningful (see
   *  `<SektorDetailPage />` for `useSectors(10)`). */
  sektor: SektorDisplay;
}

/**
 * "Saham trending di sektor ini" section on the sector detail
 * page — `/sektor/{slug}`.
 *
 * Renders one section header + two sub-grids, one per wire bucket:
 *   - **Top leading** — gainers, `TrendingUp` icon + bullish accent
 *   - **Top lagging** — losers, `TrendingDown` icon + bearish accent
 *
 * Each sub-grid renders `<SektorTopStockCard />` for every stock in
 * its bucket, ranked 1..N *within that bucket* (so the leader of
 * the gainers shows `#01` and the leader of the losers also shows
 * `#01` — they're independent lists, not one merged ranking).
 * Per-card color still follows the actual sign of `changePercent`,
 * so a positive print inside the lagging bucket reads bullish (and
 * vice versa) — the heading only sets the *expected* mood for the
 * column.
 *
 * Empty buckets fall back to a quiet em-dash so the layout stays
 * stable when a sector has, say, no losers (a fully-green sector).
 *
 * Note: this component no longer sorts or slices — the wire shape
 * already separates gainers from losers. Old behavior (sort the
 * merged list by `|changePercent|` desc, take top N) lived in
 * `topStocksByAbsChange`; we don't import it here.
 */
export function SektorTopStocks({ sektor }: SektorTopStocksProps) {
  return (
    <section className="mb-5" aria-label="Saham trending di sektor ini">
      <header className="mb-3 flex items-end justify-between border-b border-border-strong pb-2">
        <div>
          <div className="mb-0.5 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-brand" aria-hidden />
            <span className="label text-text-secondary">
              Saham trending di sektor ini
            </span>
          </div>
          <h2 className="text-[15px] font-bold tracking-tight text-text-primary">
            Saham {sektor.name}
          </h2>
        </div>
      </header>

      <StockBucket
        heading="Top leading"
        icon={<TrendingUp className="h-3 w-3 text-bullish" aria-hidden />}
        stocks={sektor.leadingStocks}
      />
      <StockBucket
        heading="Top lagging"
        icon={<TrendingDown className="h-3 w-3 text-bearish" aria-hidden />}
        stocks={sektor.laggingStocks}
      />
    </section>
  );
}

/** One bucket of stocks inside the section. Renders a small
 *  heading with a directional icon and the responsive
 *  `sm:2 lg:3` grid of `<SektorTopStockCard />`, ranked 1..N
 *  within the bucket. Empty buckets fall back to a quiet em-dash
 *  so the section rhythm stays intact. */
function StockBucket({
  heading,
  icon,
  stocks,
}: {
  heading: string;
  icon: React.ReactNode;
  stocks: SektorDisplayStock[];
}) {
  return (
    <div className="mb-4">
      <p className="label mb-1.5 flex items-center gap-1">
        {icon}
        {heading}
      </p>
      {stocks.length === 0 ? (
        <p className="font-mono text-[10.5px] text-text-faint">—</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stocks.map((stock, idx) => (
            <SektorTopStockCard
              key={stock.kode}
              stock={stock}
              rank={idx + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
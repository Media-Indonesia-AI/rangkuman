"use client";

import { TrendingUp } from "lucide-react";
import { topStocksByAbsChange, type SektorDisplay } from "@/lib/util/sectorMappers";
import { SektorTopStockCard } from "./SektorTopStockCard";

interface SektorTopStocksProps {
  /** The live-mapped sector to render the top-N stocks for.
   *  The full `stocks[]` array is sorted locally by
   *  `|changePercent|` desc and sliced to `count`, so the
   *  caller doesn't need to pre-sort. */
  sektor: SektorDisplay;
  /** How many top stocks to surface. Defaults to 5 to match
   *  the original layout. */
  count?: number;
}

/**
 * "Saham trending di sektor ini" section on the sector detail
 * page — `/sektor/{slug}`.
 *
 * Renders the section header (TrendingUp icon + label + H2 +
 * count meta) and the responsive `sm:2 lg:3` grid of
 * `<SektorTopStockCard />` tiles, ranked 1..N by
 * `|changePercent|` desc.
 *
 * Sorting happens here (via `topStocksByAbsChange`) rather than
 * at the mapper so the underlying `SektorDisplay.stocks[]`
 * stays in wire order — other consumers that want raw order
 * can call `sektor.stocks` directly without paying a sort cost.
 */
export function SektorTopStocks({ sektor, count = 5 }: SektorTopStocksProps) {
  const topStocks = topStocksByAbsChange(sektor.stocks, count);

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
            Top {count} saham {sektor.name}
          </h2>
        </div>
        <span className="font-mono text-[10.5px] text-text-muted">
          diurutin berdasarkan perubahan hari ini
        </span>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {topStocks.map((stock, idx) => (
          <SektorTopStockCard key={stock.kode} stock={stock} rank={idx + 1} />
        ))}
      </div>
    </section>
  );
}
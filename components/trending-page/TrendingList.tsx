import type { StockTrendingItem } from "@/lib/api";
import { Shimmer } from "@/components/Shimmer";
import { TrendingRow } from "./TrendingRow";

interface TrendingListProps {
  /** The trending rows to render, in display order. Drives the
   *  per-row table + the empty / loading branches below. */
  rows: StockTrendingItem[];
  /** Loading flag from the parent fetch — drives the row-shaped
   *  shimmer so the list doesn't shift when data lands. */
  isLoading?: boolean;
  /** Human-readable aria-label for the surrounding `<section>`.
   *  Matches the prior copy: "Daftar 20 saham trending". */
  ariaLabel?: string;
  /** ISO date (`YYYY-MM-DD`) of the trending snapshot the rows
   *  belong to. Forwarded to each `<TrendingRow />` so the
   *  per-row GA4 click event can split reports by snapshot. */
  recapDate: string;
}

/** Skeleton placeholder that mirrors the desktop table layout
 *  (5-column grid + the mobile stacked layout) so the rail
 *  doesn't shift when data lands. */
function TrendingRowSkeleton() {
  return (
    <li className="px-3 py-3 sm:grid sm:grid-cols-[40px_1fr_60px_120px_120px] sm:items-center sm:gap-3 sm:px-4 sm:py-3">
      <Shimmer className="hidden h-3 w-6 sm:inline-block" />
      <div className="flex flex-col gap-1.5 sm:gap-0">
        <div className="flex items-baseline gap-2">
          <Shimmer className="h-4 w-16" />
          <Shimmer className="h-3 w-32" />
        </div>
        <Shimmer className="mt-1 h-2.5 w-40 sm:mt-0" />
      </div>
      <Shimmer className="hidden h-4 w-12 sm:inline-block" />
      <Shimmer className="hidden h-4 w-16 sm:inline-block" />
      <Shimmer className="hidden h-4 w-20 sm:inline-block" />
    </li>
  );
}

/**
 * Trending table — the bordered card that holds the column-header
 * strip + the row list. Renders inside an `<ol>` so each `<li>`
 * emitted by `<TrendingRow />` is semantically ordered. Pure
 * presentational.
 *
 * Loading branch: 5 row-shaped shimmer lines. Empty branch: hidden
 * (strip + footer note still render, so the page reads as
 * "fetched but nothing to show" rather than "loading").
 */
export function TrendingList({
  rows,
  isLoading = false,
  ariaLabel = "Daftar 20 saham trending",
  recapDate,
}: TrendingListProps) {
  return (
    <section
      className="overflow-hidden rounded-lg border border-border bg-bg-secondary"
      aria-label={ariaLabel}
    >
      <header className="hidden border-b border-border bg-bg-tertiary px-3 py-2 sm:grid sm:grid-cols-[40px_1fr_60px_120px_120px] sm:gap-3 sm:px-4">
        <span className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-faint">
          #
        </span>
        <span className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-faint">
          Saham
        </span>
        <span className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-faint">
          Sentimen
        </span>
        <span className="text-right font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-faint">
          Artikel / Media
        </span>
        <span className="text-right font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-faint">
          Perubahan
        </span>
      </header>

      <ol className="divide-y divide-border">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <TrendingRowSkeleton key={i} />)
        ) : rows.length > 0 ? (
          rows.map((r, i) => (
            <TrendingRow
              key={r.ticker}
              item={r}
              rank={i + 1}
              recapDate={recapDate}
            />
          ))
        ) : null}
      </ol>
    </section>
  );
}

import type { TrendingStock } from "@/lib/mock/trending";
import { TrendingRow } from "./TrendingRow";

interface TrendingListProps {
  /** The trending rows to render, in display order. */
  rows: TrendingStock[];
  /** Human-readable aria-label for the surrounding `<section>`.
   *  Matches the prior monolith copy: "Daftar 20 saham trending". */
  ariaLabel?: string;
}

/**
 * Trending table — the bordered card that holds the column-header
 * strip + the row list. Renders inside an `<ol>` so each `<li>`
 * emitted by `<TrendingRow />` is semantically ordered. Pure
 * presentational.
 */
export function TrendingList({
  rows,
  ariaLabel = "Daftar 20 saham trending",
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
        {rows.map((r) => (
          <TrendingRow key={r.kode} stock={r} />
        ))}
      </ol>
    </section>
  );
}

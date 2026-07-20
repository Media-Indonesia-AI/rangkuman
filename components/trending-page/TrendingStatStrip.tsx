import { TrendingStatBlock } from "./TrendingStatBlock";

interface TrendingStatStripProps {
  /** Number of `positif`-tagged rows. */
  positif: number;
  /** Number of `netral`-tagged rows. */
  netral: number;
  /** Number of `negatif`-tagged rows. */
  negatif: number;
  /** Sum of `articleCount` across rows. */
  totalArticles: number;
  /** Total number of rows in the period (denominator for sublabels). */
  rowCount: number;
}

/**
 * Four-up aggregate stats strip for `/trending`:
 *
 *   Positif · Netral · Negatif · Total artikel
 *
 * Each cell mirrors the per-row sentiment colors used elsewhere
 * (bullish / mixed / bearish / brand) so the strip reads as a
 * sentiment summary at a glance. The total-articles cell opts
 * into `mono` + `num-tabular` so the digits line up vertically
 * with the sentiment counts above them.
 *
 * Renders inside a `grid grid-cols-2 sm:grid-cols-4 divide-x…border-y`
 * to match the previous monolith's layout; the strip itself only
 * owns the cells.
 */
export function TrendingStatStrip({
  positif,
  netral,
  negatif,
  totalArticles,
  rowCount,
}: TrendingStatStripProps) {
  return (
    <section className="mb-4 grid grid-cols-2 divide-x divide-border border-y border-border sm:grid-cols-4">
      <TrendingStatBlock
        label="Positif"
        value={positif}
        sublabel={`/ ${rowCount}`}
        color="text-bullish"
      />
      <TrendingStatBlock
        label="Netral"
        value={netral}
        sublabel={`/ ${rowCount}`}
        color="text-mixed"
      />
      <TrendingStatBlock
        label="Negatif"
        value={negatif}
        sublabel={`/ ${rowCount}`}
        color="text-bearish"
      />
      <TrendingStatBlock
        label="Total artikel"
        value={totalArticles}
        sublabel={`${rowCount} saham`}
        color="text-brand"
        mono
      />
    </section>
  );
}

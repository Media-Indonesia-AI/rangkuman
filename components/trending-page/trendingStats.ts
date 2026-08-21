/**
 * Aggregation helpers for the `/trending` page stat strip.
 *
 * `rows` is the resolved `StockTrendingItem[]` from
 * `useGetStocksTrending()`. The stat strip and the per-row list
 * subscribe to the same array, so the totals stay in sync with
 * the rows.
 *
 * Field mapping:
 *
 *   - `r.sentiment`          → drives the positif / netral / negatif count
 *   - `r.article_count`      → summed into `totalArticles`
 *   - `r.distinct_sources`   → counted in `totalMedia` (one ticker =
 *                              one entry regardless of how many publishers
 *                              covered it, so the cell matches the
 *                              "how many rows have any media" meaning)
 */

import type { StockTrendingItem } from "@/lib/api";

export interface TrendingStats {
  /** Rows tagged `sentiment === "positive"`. */
  positif: number;
  /** Rows tagged `sentiment === "neutral"`. */
  netral: number;
  /** Rows tagged `sentiment === "negative"`. */
  negatif: number;
  /** Sum of every row's `article_count`. */
  totalArticles: number;
  /**
   * Number of rows with at least one source listed. The prior
   * mock formula synthesized `mediaCount` duplicates per row's
   * `kode` and then deduped — for any row with `mediaCount > 0`
   * the `kode` landed in the set, so the result was "how many
   * rows have any media". Preserved verbatim so the visible
   * number matches the prior monolith.
   */
  totalMedia: number;
}

/** Aggregate the trending-page stat strip inputs from a row set. */
export function computeTrendingStats(rows: StockTrendingItem[]): TrendingStats {
  return {
    positif: rows.filter((r) => r.sentiment === "positive").length,
    netral: rows.filter((r) => r.sentiment === "neutral").length,
    negatif: rows.filter((r) => r.sentiment === "negative").length,
    totalArticles: rows.reduce((acc, r) => acc + r.article_count, 0),
    totalMedia: new Set(
      rows.flatMap((r) =>
        Array.from({ length: r.distinct_sources }, () => r.ticker),
      ),
    ).size,
  };
}

/**
 * Aggregation helpers for the `/trending` page stat strip.
 *
 * The original monolith computed these inline in the page body;
 * pulling them here keeps the page orchestrator focused on
 * composition and lets the stat strip stay presentational
 * (props-only).
 *
 * Numbers follow the source convention — `rows` is the raw
 * `TrendingStock[]` from `getTrending(period)`. The shape of
 * each derived value matches the original inline computation
 * exactly so the visible numbers don't shift.
 */

import type { TrendingStock } from "@/lib/mock/trending";

export interface TrendingStats {
  /** Rows tagged `sentimen === "positif"`. */
  positif: number;
  /** Rows tagged `sentimen === "netral"`. */
  netral: number;
  /** Rows tagged `sentimen === "negatif"`. */
  negatif: number;
  /** Sum of every row's `articleCount`. */
  totalArticles: number;
  /**
   * Distinct `kode`s that have at least one media mention.
   * The original formula synthesizes `mediaCount` duplicates
   * per row's `kode` and then dedupes — for any row with
   * `mediaCount > 0` the `kode` lands in the set, so the
   * result is "how many rows have any media". Preserved
   * verbatim so behavior matches the prior monolith.
   */
  totalMedia: number;
}

/** Aggregate the trending-page stat strip inputs from a row set. */
export function computeTrendingStats(rows: TrendingStock[]): TrendingStats {
  return {
    positif: rows.filter((r) => r.sentiment === "positif").length,
    netral: rows.filter((r) => r.sentiment === "netral").length,
    negatif: rows.filter((r) => r.sentiment === "negatif").length,
    totalArticles: rows.reduce((acc, r) => acc + r.articleCount, 0),
    totalMedia: new Set(
      rows.flatMap((r) => Array.from({ length: r.mediaCount }, () => r.kode)),
    ).size,
  };
}

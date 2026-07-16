/**
 * Types for the `GET commodities/historical` endpoint.
 *
 * Separate file from `types/commodity-categories.ts` because the
 * wire shape is a per-symbol time series (one row per trading
 * day with the rate and percent change vs. the prior row),
 * not a category-bucketed aggregate. Keeping it in its own
 * module also makes it easy to evolve the time-series-specific
 * fields (`rate`, `percent_change`, `date_time`) without
 * churning the category type file.
 *
 * Consumed by `../commodity-historical.ts` (request function)
 * and any sparkline / chart components that build on top of it.
 */

/**
 * One row in the `data[]` array — a single point on the
 * commodity's time series for the requested period.
 *
 * `rate` is the price at the start of `date_time` in the
 * commodity's wire `unit` / `currency` (e.g. for `"PLO:COM"`
 * Palm Oil the rate is in MYR/ton).
 *
 * `percent_change` is the day-over-day change percent (signed;
 * positive = up). The first row of the series has no prior
 * point to compare against, so the wire sends `null` — callers
 * should treat null as "no prior data" rather than "0% change"
 * (these are semantically different: null = "n/a", 0 = "flat").
 */
export interface CommodityHistoricalPoint {
  /** ISO 8601 timestamp of the rate, e.g. `"2026-07-09T00:00:00.000Z"`. */
  date_time: string;
  /** Price at `date_time` (raw, unformatted). */
  rate: number;
  /** Day-over-day change percent (signed). `null` on the first
   *  row of the series (no prior point to compare). */
  percent_change: number | null;
}

/**
 * Wire format for `GET commodities/historical` —
 * `{ symbol, period, data: CommodityHistoricalPoint[] }`.
 *
 * `symbol` echoes the request param (the wire `symbol` code,
 * e.g. `"PLO:COM"`). `period` echoes the request period
 * (e.g. `"1M"`) so callers can verify the response matches
 * what they asked for without re-encoding the params.
 */
export interface CommodityHistoricalResponse {
  symbol: string;
  period: string;
  data: CommodityHistoricalPoint[];
}
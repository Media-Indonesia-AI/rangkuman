/**
 * Types for the `GET coin/{ticker}/historical` endpoint.
 *
 * Separate file from `types/coin.ts` (which holds the static
 * catalog shape — ticker / price / 24h change / market cap /
 * logo) because the wire shape here is a per-ticker time
 * series, not a snapshot. Keeping the time-series-specific
 * fields (`price`, `price_change`, `date_time`) in their own
 * module lets the shape evolve without churning the catalog
 * type file.
 *
 * Consumed by `../coin.ts` (request function) and any chart /
 * sparkline components that build on top of it.
 */

/**
 * One row in the time series — a single point on a coin's
 * price history for the requested `period`.
 *
 * `price` is the spot price at `date_time` in USD.
 *
 * `price_change` is the period-over-period change percent
 * (signed; positive = up). The wire sends signed floats —
 * callers should display the raw value (or run it through the
 * existing `priceChangeTone` helper) rather than assume the
 * precision is intentional.
 */
export interface CoinHistoricalPoint {
  /** ISO 8601 timestamp of the price, e.g.
   *  `"2026-08-31T07:00:00.000Z"`. */
  date_time: string;
  /** Spot price in USD at `date_time` (raw, unformatted). */
  price: number;
  /** Period-over-period change percent (signed). */
  price_change: number;
}

/**
 * Wire format for `GET coin/{ticker}/historical/?period=...`.
 *
 * The endpoint returns the series as a bare array (no envelope
 * fields), so this type is the array itself — call sites
 * receive it as-is and iterate without unwrapping.
 */
export type CoinHistoricalResponse = CoinHistoricalPoint[];

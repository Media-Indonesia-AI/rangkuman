/**
 * Types for `/interest-rate` and `/exchange-rate` endpoints.
 * Consumed by `../market.ts` (request functions) and `MarketMood`.
 */

// ─── INTEREST RATE ──────────────────────────────────────────────

/** Latest BI Rate snapshot returned by `GET interest-rate`. */
export interface InterestRate {
  /** ISO timestamp of the previous rate decision (the one being compared against). */
  last_rate_date: string;
  /** ISO timestamp of when this snapshot was generated. */
  date: string;
  /** Current BI Rate in percent (e.g. `5.75` = 5,75%). */
  rate: number;
  /** Change vs. the previous decision, in basis points (signed). */
  bps: number;
}

// ─── EXCHANGE RATE ──────────────────────────────────────────────

/**
 * One data point in the exchange-rate time series returned by
 * `GET exchange-rate/chart`. Each point is a (timestamp, rate) pair —
 * `rate` is the counter-currency value of 1 unit of the base currency
 * (e.g. for `initialCurrency=idr&exchange=usd`, `rate` is the USD
 * price of 1 IDR).
 */
export interface ExchangeRateChartPoint {
  /** ISO timestamp for the data point. */
  date: string;
  /** Exchange rate at `date`. */
  rate: number;
}

/** Time series of exchange-rate points returned by `GET exchange-rate/chart`. */
export type ExchangeRateChartResponse = ExchangeRateChartPoint[];
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
 * One snapshot of cross-rates — each key is an ISO 4217 currency code,
 * each value is the rate in IDR per 1 unit of that currency
 * (e.g. `USD: 17950.1` means 1 USD = 17,950.1 IDR).
 *
 * Keys are not enumerated — the backend may add or remove currencies
 * at any time, so the type is intentionally open. Consumers that read
 * a specific currency should still handle the absent case
 * (e.g. `rates.USD ?? 0`).
 */
export type ExchangeRate = Record<string, number>;

/** Wire format the backend actually returns: `{ data: [snapshot] }`. */
export interface ExchangeRateResponse {
  data: ExchangeRate[];
}
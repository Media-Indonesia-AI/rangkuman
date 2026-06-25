/**
 * Market-data API endpoints (BI Rate + exchange rates).
 *
 * Hits `/interest-rate` and `/exchange-rate`. Re-exports are composed
 * into the top-level `api` object in `./client` so existing call sites
 * (`api.getInterestRate(...)`, `api.getExchangeRate(...)`) keep working.
 */

import { request, todayIsoDate } from "./client";
import type {
  ExchangeRateResponse,
  InterestRate,
} from "./types/market";

/**
 * Fetch the BI Rate snapshot for a given date.
 * @param date ISO date string `YYYY-MM-DD`. Defaults to today (local TZ).
 */
export function getInterestRate(
  date?: string,
): Promise<InterestRate> {
  const params = new URLSearchParams({ date: date ?? todayIsoDate() });
  return request<InterestRate>(
    `interest-rate?${params.toString()}`,
    { method: "GET" },
  );
}

/**
 * Fetch the latest exchange-rate snapshot. `base` is the base currency
 * code passed as a query param (defaults to `"idr"`). The response is
 * wrapped in `{ data: [snapshot] }` — read the first element to get
 * the per-currency rates.
 */
export function getExchangeRate(
  base = "idr",
): Promise<ExchangeRateResponse> {
  const params = new URLSearchParams({ currency: base });
  return request<ExchangeRateResponse>(
    `exchange-rate?${params.toString()}`,
    { method: "GET" },
  );
}
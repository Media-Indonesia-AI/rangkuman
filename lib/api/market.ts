/**
 * Market-data API endpoints (BI Rate + exchange rates + market mood).
 *
 * Hits `/interest-rate`, `/exchange-rate`, and `/market-mood`.
 * Re-exports are composed into the top-level `api` object in
 * `./client` so existing call sites (`api.getInterestRate(...)`,
 * `api.getExchangeRate(...)`, `api.getMarketMood()`) keep working.
 */

import { request, todayIsoDate } from "./client";
import type {
  ExchangeRateChartResponse,
  InterestRate,
} from "./types/market";
import { MarketMood } from "./types/moods";

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
 * Fetch the historical exchange-rate series. `initialCurrency` is the
 * base currency code (defaults to `"idr"`) and `exchange` is the
 * counter currency code (defaults to `"usd"`). The response is a time
 * series of `{ date, rate }` points — see `ExchangeRateChartResponse`.
 */
export function getExchangeRate(
  initialCurrency = "idr",
  exchange = "usd",
): Promise<ExchangeRateChartResponse> {
  const params = new URLSearchParams({ initial_currency: initialCurrency, exchange });
  return request<ExchangeRateChartResponse>(
    `exchange-rate/chart?${params.toString()}`,
    { method: "GET" },
  );
}

/**
 * Fetch the composite market-mood snapshot. Combines IHSG change,
 * foreign flow, USD/IDR, the latest BI Rate decision, and
 * headline-sentiment counts into a single object with a 0–100 score,
 * an Indonesian label band, and an AI-written narrative explaining
 * the drivers. The response is returned unwrapped (no `{ data: ... }`
 * envelope — `MarketMood` is the top-level payload).
 */
export function getMarketMood(): Promise<MarketMood> {
  return request<MarketMood>("market-mood", { method: "GET" });
}
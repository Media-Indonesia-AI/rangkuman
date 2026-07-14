/**
 * Request-level cache for `GET exchange-rate/chart`.
 *
 * Per-(initialCurrency, exchange) cache — different currency pairs get
 * different slots. Concurrent and subsequent callers for the same pair
 * share one network round-trip. Errors clear the in-flight slot so the
 * next mount can retry.
 */

import { api } from "../client";
import type { ExchangeRateChartResponse } from "../types/market";

const cached = new Map<string, ExchangeRateChartResponse>();
const inflight = new Map<string, Promise<ExchangeRateChartResponse>>();

/** Cache key for a given currency pair. */
function key(initialCurrency: string, exchange: string): string {
  return `${initialCurrency}|${exchange}`;
}

/**
 * Fetch the historical exchange-rate series for a currency pair, with
 * request-level dedup.
 *
 * @param initialCurrency Base currency code (default `"idr"`).
 * @param exchange       Counter currency code (default `"usd"`).
 *                       The response is a time series of `{ date, rate }`
 *                       points — see `ExchangeRateChartResponse`.
 */
export function loadExchangeRate(
  initialCurrency = "idr",
  exchange = "usd",
): Promise<ExchangeRateChartResponse> {
  const k = key(initialCurrency, exchange);
  const hit = cached.get(k);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(k);
  if (pending) return pending;
  const promise = api
    .getExchangeRate(initialCurrency, exchange)
    .then((res) => {
      cached.set(k, res);
      return res;
    })
    .catch((err) => {
      inflight.delete(k); // allow retry on next mount
      throw err;
    });
  inflight.set(k, promise);
  return promise;
}

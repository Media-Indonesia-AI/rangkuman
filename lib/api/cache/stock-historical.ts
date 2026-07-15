/**
 * Request-level cache for `GET stocks/stock/historical?ticker=...`.
 *
 * Per-ticker cache keyed by the uppercased ticker code. Concurrent
 * mounts of the same ticker share one network round-trip; subsequent
 * mounts of the same ticker return the cached value instantly. Errors
 * clear the in-flight slot for that ticker so the next mount can retry.
 *
 * Different tickers are independent — the cache holds one entry per
 * ticker, so a freshly-navigated detail page for a new stock doesn't
 * evict the previously-fetched one.
 */

import { api } from "../client";
import type { StockHistoricalResponse } from "../types/stocks";

const cached = new Map<string, StockHistoricalResponse>();
const inflight = new Map<string, Promise<StockHistoricalResponse>>();

/**
 * Fetch the historical daily price series for a given ticker, with
 * request-level dedup. The ticker is uppercased before use so
 * callers can pass `"antm"` or `"ANTM"` interchangeably.
 */
export function loadStockHistorical(
  ticker: string,
): Promise<StockHistoricalResponse> {
  const k = ticker.toUpperCase();
  const hit = cached.get(k);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(k);
  if (pending) return pending;
  const promise = api
    .getStockHistorical(k)
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

/**
 * Request-level cache for `GET coin/{ticker}/historical`.
 *
 * Per-(ticker, period) cache keyed by the composite pair. The
 * series for one ticker+period is independent of any other
 * (different tickers fetch different coins; different periods
 * fetch different windows of the same coin's history), so the
 * cache holds one entry per pair rather than a single global
 * slot.
 *
 * Concurrent mounts of the same pair share one network round-
 * trip; subsequent mounts return the cached value instantly.
 * Errors clear the in-flight slot for that pair so the next
 * mount can retry.
 *
 * Tickers are lowercased before being used as a cache key so
 * callers can pass `"btc"` or `"BTC"` interchangeably —
 * matches the lowercase `CoinTickerItem.ticker` wire shape.
 */

import { api } from "../client";
import type { CoinHistoricalResponse } from "../types/coin-historical";

const cached = new Map<string, CoinHistoricalResponse>();
const inflight = new Map<string, Promise<CoinHistoricalResponse>>();

/** Composite cache key — ticker lowercased + `|` + period uppercased. */
function keyOf(ticker: string, period: string): string {
  return `${ticker.toLowerCase()}|${period.toUpperCase()}`;
}

/**
 * Fetch a coin's time-series for a given period with request-
 * level dedup. See module header for the caching model.
 *
 * @param ticker  Wire ticker code (e.g. `"btc"`). Lowercased
 *                inside, so callers can pass any case.
 * @param period  Time-window code (default `"1D"`).
 */
export function loadCoinHistorical(
  ticker: string,
  period = "1D",
): Promise<CoinHistoricalResponse> {
  const key = keyOf(ticker, period);
  const hit = cached.get(key);
  if (hit !== undefined) return Promise.resolve(hit);
  const pending = inflight.get(key);
  if (pending !== undefined) return pending;
  const req = api
    .getCoinHistorical(ticker, period)
    .then((res) => {
      cached.set(key, res);
      inflight.delete(key);
      return res;
    })
    .catch((err) => {
      inflight.delete(key); // allow retry on next mount
      throw err;
    });
  inflight.set(key, req);
  return req;
}

/**
 * Request-level cache for `GET stocks/ticker-information/{ticker}`.
 *
 * Per-(ticker, date) cache keyed by `"{TICKER}|{YYYY-MM-DD}"`. The
 * `date` segment matters because the same ticker can return
 * different `description` / `articles` / price snapshots for
 * different recap days — a bare ticker key would let a stale
 * earlier day's payload leak into a `/stock/X/Y` navigation.
 *
 * Concurrent mounts of the same (ticker, date) pair share one
 * network round-trip; subsequent mounts return the cached value
 * instantly. Errors clear the in-flight slot for that pair so the
 * next mount can retry.
 *
 * Different (ticker, date) pairs are independent — the cache holds
 * one entry per pair, so a freshly-navigated recap day or a fresh
 * stock doesn't evict the previously-fetched one (good for
 * repeated navigations between two recap days of the same ticker).
 */

import { api } from "../client";
import type { TickerInformation } from "../types/stocks";

const cached = new Map<string, TickerInformation>();
const inflight = new Map<string, Promise<TickerInformation>>();

/**
 * Build the cache key for a (ticker, date) pair. Tickers are
 * uppercased so callers can pass `"antm"` or `"ANTM"` interchangeably
 * and hit the same cached value. Dates are taken verbatim — an
 * empty / `undefined` date is treated as "no date segment", letting
 * the API fall back to today.
 */
function cacheKey(ticker: string, date?: string): string {
  return `${ticker.toUpperCase()}|${date ?? ""}`;
}

/**
 * Fetch composite ticker information for a given ticker and recap
 * day, with request-level dedup keyed on (ticker, date).
 */
export function loadTickerInformation(
  ticker: string,
  date?: string
): Promise<TickerInformation> {
  const k = cacheKey(ticker, date);
  const hit = cached.get(k);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(k);
  if (pending) return pending;
  const promise = api
    .getTickerInformation(ticker.toUpperCase(), date)
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

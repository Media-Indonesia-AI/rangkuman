/**
 * Request-level cache for `GET stocks/ticker-information/{ticker}`.
 *
 * Per-ticker cache keyed by the uppercased ticker code. Concurrent
 * mounts of the same ticker share one network round-trip; subsequent
 * mounts of the same ticker return the cached value instantly. Errors
 * clear the in-flight slot for that ticker so the next mount can retry.
 *
 * Different tickers are independent — the cache holds one entry per
 * ticker, so a freshly-navigated detail page for a new stock doesn't
 * evict the previously-fetched one (good for repeated navigations
 * between two tickers in a sector panel).
 */

import { api } from "../client";
import type { TickerInformation } from "../types/stocks";

const cached = new Map<string, TickerInformation>();
const inflight = new Map<string, Promise<TickerInformation>>();

/**
 * Fetch composite ticker information for a given ticker, with
 * request-level dedup. The ticker is uppercased before use so callers
 * can pass `"antm"` or `"ANTM"` interchangeably.
 */
export function loadTickerInformation(
  ticker: string,
): Promise<TickerInformation> {
  const k = ticker.toUpperCase();
  const hit = cached.get(k);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(k);
  if (pending) return pending;
  const promise = api
    .getTickerInformation(k)
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
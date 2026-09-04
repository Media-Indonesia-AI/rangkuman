/**
 * Request-level cache for `GET coin/ticker/`.
 *
 * Keyed by `limit` — different limits are distinct snapshots, so each
 * gets its own cached value and in-flight promise. Concurrent mounts
 * for the same limit share one network round-trip; subsequent mounts
 * return the cached value instantly. Errors clear the in-flight slot
 * so the next mount can retry.
 *
 * Mirrors `coin-top-tickers.ts` for the same reason: the endpoint
 * exposes a `limit` query param, so a single-slot cache would
 * conflate different pages. The dedup matters most under React 18
 * StrictMode (mount → unmount → mount in dev) — without it the
 * `useCoinTicker` hook fires the request twice per visit, and once
 * another consumer subscribes the same way every additional mount
 * would join in.
 */

import { api } from "../client";
import type { CoinTickerItem } from "../types/coin";

const cached = new Map<number, CoinTickerItem[]>();
const inflight = new Map<number, Promise<CoinTickerItem[]>>();

/** Read the currently cached coin ticker list without triggering a
 *  fetch — useful for SSR-seeded initial state in `useCoinTicker`
 *  so a remount after another instance has already fetched renders
 *  with the data on first paint instead of flashing empty. */
export function peekCoinTicker(limit: number): CoinTickerItem[] | null {
  return cached.get(limit) ?? null;
}

/**
 * Fetch the coin ticker catalog with request-level dedup.
 *
 * @param limit Page size forwarded to `getCoinTicker` (default 30).
 */
export function loadCoinTicker(limit = 30): Promise<CoinTickerItem[]> {
  const hit = cached.get(limit);
  if (hit !== undefined) return Promise.resolve(hit);
  const pending = inflight.get(limit);
  if (pending !== undefined) return pending;
  const req = api
    .getCoinTicker(limit)
    .then((res) => {
      cached.set(limit, res);
      inflight.delete(limit);
      return res;
    })
    .catch((err) => {
      inflight.delete(limit); // allow retry on next mount
      throw err;
    });
  inflight.set(limit, req);
  return req;
}

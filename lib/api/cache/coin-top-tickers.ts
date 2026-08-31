/**
 * Request-level cache for `GET coin/top-tickers`.
 *
 * Keyed by `limit` — different limits are distinct snapshots, so each
 * gets its own cached value and in-flight promise. Concurrent mounts
 * for the same limit share one network round-trip; subsequent mounts
 * return the cached value instantly. Errors clear the in-flight slot
 * so the next mount can retry.
 */

import { api } from "../client";
import type { CoinTopTickersResponse } from "../types/coin";

const cached = new Map<number, CoinTopTickersResponse>();
const inflight = new Map<number, Promise<CoinTopTickersResponse>>();

/**
 * Fetch the day's top movers split into `top-gainer` and
 * `top-looser` groups, with request-level dedup.
 *
 * @param limit How many coins per group to request (default 6 —
 *              matches `getCoinTopTickers`'s default).
 */
export function loadCoinTopTickers(
  limit = 6,
): Promise<CoinTopTickersResponse> {
  const hit = cached.get(limit);
  if (hit !== undefined) return Promise.resolve(hit);
  const pending = inflight.get(limit);
  if (pending !== undefined) return pending;
  const req = api
    .getCoinTopTickers(limit)
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

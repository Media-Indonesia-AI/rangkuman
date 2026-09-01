/**
 * Request-level cache for `GET coin-category`.
 *
 * Keyed by `${limit}-${skip}` — different page sizes or offsets are
 * distinct snapshots, so each gets its own cached value and in-flight
 * promise. Concurrent mounts for the same key share one network
 * round-trip; subsequent mounts return the cached value instantly.
 * Errors clear the in-flight slot so the next mount can retry.
 */

import { api } from "../client";
import type { CoinCategoriesResponse } from "../types/coin";

const cached = new Map<string, CoinCategoriesResponse>();
const inflight = new Map<string, Promise<CoinCategoriesResponse>>();

const keyOf = (limit: number, skip: number) => `${limit}-${skip}`;

/**
 * Fetch a paginated slice of the coin-category list with request-
 * level dedup.
 *
 * @param limit Page size — how many categories to fetch
 *              (default 10, matches `getCoinCategories`'s default).
 * @param skip  Offset into the list — `0` is the first page, `10`
 *              the next, etc. (default 0).
 */
export function loadCoinCategories(
  limit = 10,
  skip = 0,
): Promise<CoinCategoriesResponse> {
  const key = keyOf(limit, skip);
  const hit = cached.get(key);
  if (hit !== undefined) return Promise.resolve(hit);
  const pending = inflight.get(key);
  if (pending !== undefined) return pending;
  const req = api
    .getCoinCategories(limit, skip)
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

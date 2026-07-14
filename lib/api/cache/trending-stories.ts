/**
 * Request-level cache for `GET trending-stories`.
 *
 * Per-`limit` cache — different limits get different slots. Concurrent
 * and subsequent callers for the same limit share one network round-trip.
 * Errors clear the in-flight slot so the next mount can retry.
 */

import { api } from "../client";
import type { TrendingStoriesResponse } from "../types/story";

const cached = new Map<string, TrendingStoriesResponse>();
const inflight = new Map<string, Promise<TrendingStoriesResponse>>();

/** Cache key for a given `limit`. */
function key(limit: number): string {
  return String(limit);
}

/**
 * Fetch the trending-stories snapshot for a given limit, with
 * request-level dedup.
 *
 * @param limit  How many stories to fetch (default 20).
 */
export function loadTrendingStories(
  limit = 20,
): Promise<TrendingStoriesResponse> {
  const k = key(limit);
  const hit = cached.get(k);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(k);
  if (pending) return pending;
  const promise = api
    .getTrendingStories(limit)
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

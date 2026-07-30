/**
 * Request-level cache for `GET stocks/ticker-information`.
 *
 * Per-`(limit, page, filters)` cache — different tuples get different
 * slots. The filter list is JSON-encoded into the key so callers with
 * structurally-equal filters share a slot. Concurrent and subsequent
 * callers for the same tuple share one network round-trip. Errors
 * clear the in-flight slot so the next mount can retry.
 */

import { api } from "../client";
import type { StoryFilter } from "../types/story";
import type { TickerListResponse } from "../types/stocks";

const cached = new Map<string, TickerListResponse>();
const inflight = new Map<string, Promise<TickerListResponse>>();

/** Cache key for a given `(limit, page, filters)` tuple. The filter list
 *  is JSON-encoded into the key so callers with structurally-equal
 *  filters share a slot. */
function key(
  limit: number,
  page: number,
  filters: StoryFilter[],
): string {
  return `${limit}|${page}|${JSON.stringify(filters)}`;
}

/**
 * Fetch the ticker-tagged article list for a `(limit, page, filters)`
 * tuple, with request-level dedup.
 *
 * @param limit   Page size (default 20, matching the API's default).
 * @param page    Page index (default 0).
 * @param filters Structured `{ field, operator, value }` filters
 *                (default `[]`). Same list passed twice always lands
 *                on the same cache slot.
 */
export function loadTickerListArticles(
  limit = 20,
  page = 0,
  filters: StoryFilter[] = [],
): Promise<TickerListResponse> {
  const k = key(limit, page, filters);
  const hit = cached.get(k);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(k);
  if (pending) return pending;
  const promise = api
    .getTickerListArticles(limit, page, filters)
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

/**
 * Request-level cache for `GET headlines`.
 *
 * Per-(limit, skip, filters) cache — different tuples get different
 * slots. The filter list is JSON-encoded into the key so callers with
 * structurally-equal filters share a slot. Concurrent and subsequent
 * callers for the same tuple share one network round-trip. Errors
 * clear the in-flight slot so the next mount can retry.
 */

import { api } from "../client";
import type { StoryFilter, StoryResponse } from "../types/story";

const cached = new Map<string, StoryResponse>();
const inflight = new Map<string, Promise<StoryResponse>>();

/** Cache key for a given (limit, skip, filters) tuple. The filter list
 *  is JSON-encoded into the key so callers with structurally-equal
 *  filters share a slot. */
function key(
  limit: number,
  skip: number,
  filters: StoryFilter[],
): string {
  return `${limit}|${skip}|${JSON.stringify(filters)}`;
}

/**
 * Fetch the headlines list for a (limit, skip, filters) tuple, with
 * request-level dedup.
 *
 * @param limit   How many headlines to return (default 10).
 * @param skip    How many headlines to skip from the start of the result
 *                set, for pagination (default 0).
 * @param filters Structured `{ field, operator, value }` filters
 *                (default `[]`). Same list passed twice always lands on
 *                the same cache slot.
 */
export function loadHeadlines(
  limit = 10,
  skip = 0,
  filters: StoryFilter[] = [],
): Promise<StoryResponse> {
  const k = key(limit, skip, filters);
  const hit = cached.get(k);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(k);
  if (pending) return pending;
  const promise = api
    .getHeadlines(limit, skip, filters)
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

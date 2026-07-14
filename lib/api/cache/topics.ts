/**
 * Request-level cache for `GET topic`.
 *
 * Per-(limit, skip, filters) cache — same shape as the story-list
 * cache; isolated so its keys can't collide with stories even when
 * (limit, skip, filters) tuples happen to match.
 */

import { api } from "../client";
import type { StoryFilter, TopicResponse } from "../types/story";

const cached = new Map<string, TopicResponse>();
const inflight = new Map<string, Promise<TopicResponse>>();

function key(
  limit: number,
  skip: number,
  filters: StoryFilter[],
): string {
  return `${limit}|${skip}|${JSON.stringify(filters)}`;
}

/**
 * Fetch the topic list for a (limit, skip, filters) tuple, with
 * request-level dedup.
 *
 * @param limit   How many topics to return (default 10, matching the
 *                backend's `getTopic` default after the latest spec
 *                change).
 * @param skip    How many topics to skip (default 0).
 * @param filters Structured `{ field, operator, value }` filters
 *                (default `[]`).
 */
export function loadTopic(
  limit = 10,
  skip = 0,
  filters: StoryFilter[] = [],
): Promise<TopicResponse> {
  const k = key(limit, skip, filters);
  const hit = cached.get(k);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(k);
  if (pending) return pending;
  const promise = api
    .getTopic(limit, skip, filters)
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

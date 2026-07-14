/**
 * Request-level cache for `GET stories` (the standalone `/stories`
 * endpoint, filtered by `headline_id` for deep-linked headlines).
 *
 * Per-(limit, skip, filters) cache — same shape as the headlines-list
 * / topic-list caches; isolated so its keys can't collide with the
 * others even when (limit, skip, filters) tuples happen to match.
 */

import { api } from "../client";
import type { StoryFilter, StoryListResponse } from "../types/story";

const cached = new Map<string, StoryListResponse>();
const inflight = new Map<string, Promise<StoryListResponse>>();

function key(
  limit: number,
  skip: number,
  filters: StoryFilter[],
): string {
  return `${limit}|${skip}|${JSON.stringify(filters)}`;
}

/**
 * Fetch the stories list for a (limit, skip, filters) tuple, with
 * request-level dedup.
 *
 * Typical use: filter by `headline_id` to fetch the related stories
 * for a deep-linked headline. The hook `useListStory` is the
 * React-friendly wrapper that adds state + cancel-on-unmount.
 *
 * @param limit   How many stories to return (default 10, matching
 *                the backend's default).
 * @param skip    How many stories to skip (default 0).
 * @param filters Structured `{ field, operator, value }` filters
 *                (default `[]`). Same list passed twice always
 *                lands on the same cache slot.
 */
export function loadListStory(
  limit = 10,
  skip = 0,
  filters: StoryFilter[] = [],
): Promise<StoryListResponse> {
  const k = key(limit, skip, filters);
  const hit = cached.get(k);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(k);
  if (pending) return pending;
  const promise = api
    .getListStory(limit, skip, filters)
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

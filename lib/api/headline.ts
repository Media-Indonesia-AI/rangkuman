/**
 * Headline-domain API endpoints.
 *
 * Hits `headlines/*` — the trending ticker snapshot, the paginated
 * headlines list, and the per-headline detail resource. Composed into
 * the top-level `api` object in `./client` so existing call sites
 * (`api.getTrendingStories()`, `api.getHeadlines()`,
 * `api.getHeadlineById()`) keep working.
 *
 * The split between this file and `./topic` mirrors the backend
 * route grouping: everything under `/headlines` lives here, the
 * topic list (`/topic`) lives next door.
 */

import { request } from "./client";
import type {
  StoryFilter,
  StoryResponse,
  TrendingStoriesResponse,
} from "./types/story";
import type { HeadlineDetail, HeadlineDetailResponse } from "./types/headline";

/**
 * Fetch the current trending-ticker stories.
 *
 * @param limit How many trending tickers to return (default 20).
 */
export function getTrendingStories(
  limit = 20,
): Promise<TrendingStoriesResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
  });
  return request<TrendingStoriesResponse>(
    `headlines/trending?${params.toString()}`,
    { method: "GET" },
  );
}

/**
 * Fetch the headlines list, with optional structured filters.
 *
 * @param limit   How many headlines to return (default 10).
 * @param skip    How many headlines to skip from the start of the result
 *                set, for pagination (default 0).
 * @param filters Structured `{ field, operator, value }` filters to
 *                narrow the result set (default `[]`). The list is
 *                JSON-encoded into a single `filters` query param, e.g.
 *                `filters=[{"field":"primary_ticker_code","operator":"eq","value":"IHSG"}]`.
 *                Empty list omits the param entirely.
 */
export function getHeadlines(
  limit = 10,
  skip = 0,
  filters: StoryFilter[] = [],
): Promise<StoryResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    skip: String(skip),
  });
  if (filters.length > 0) {
    params.set("filters", JSON.stringify(filters));
  }
  return request<StoryResponse>(
    `headlines?${params.toString()}`,
    { method: "GET" },
  );
}

/**
 * Fetch a single headline by ID, with its related stories.
 *
 * The backend wraps the response in `{ data: HeadlineDetail }`
 * (same shape as the list endpoints); this function unwraps it
 * so call sites only see `HeadlineDetail`. See `HeadlineDetailResponse`
 * for the raw wire shape.
 *
 * The `id` is path-encoded with `encodeURIComponent` so callers can
 * pass any string the backend hands out (e.g. mongo-style hashes)
 * without worrying about reserved characters.
 *
 * @param id Headline ID — opaque string from a list response.
 */
export function getHeadlineById(
  id: string,
): Promise<HeadlineDetail> {
  return request<HeadlineDetailResponse>(
    `headlines/${encodeURIComponent(id)}`,
    { method: "GET" },
  ).then((res) => res.data);
}

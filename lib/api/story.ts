/**
 * Story-domain API endpoints.
 *
 * Hits `/story/*` and `/topic`. Re-exports are composed into the
 * top-level `api` object in `./client` so existing call sites
 * (`api.getTrendingStories()`, `api.getHeadlines()`, `api.getTopic()`)
 * keep working.
 */

import { request } from "./client";
import type {
  StoryFilter,
  StoryResponse,
  TopicResponse,
  TrendingStoriesResponse,
} from "./types/story";

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
 * Fetch the topic list, with optional structured filters. Topics are
 * the same entities embedded under `StoryItem.topic` — exposed here
 * as a paginated top-level resource so callers can enumerate them
 * (e.g. for navigation / filter chips) without first loading stories.
 *
 * The default `skip = 10` is unusual (other list endpoints default to
 * `0`); it matches the backend's own default and the user's spec.
 * Don't "fix" this to `0` without checking with whoever defined the
 * contract.
 *
 * @param limit   How many topics to return (default 10).
 * @param skip    How many topics to skip from the start of the result
 *                set, for pagination (default 10).
 * @param filters Structured `{ field, operator, value }` filters to
 *                narrow the result set (default `[]`). JSON-encoded
 *                the same way as `getHeadlines`'s filters. Empty list
 *                omits the param entirely.
 */
export function getTopic(
  limit = 10,
  skip = 0,
  filters: StoryFilter[] = [],
): Promise<TopicResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    skip: String(skip),
  });
  if (filters.length > 0) {
    params.set("filters", JSON.stringify(filters));
  }
  return request<TopicResponse>(
    `topic?${params.toString()}`,
    { method: "GET" },
  );
}
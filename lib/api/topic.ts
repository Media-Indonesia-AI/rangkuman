/**
 * Topic-domain API endpoints.
 *
 * Hits `/topic`. Composed into the top-level `api` object in `./client`
 * so existing call sites (`api.getTopic()`) keep working.
 *
 * The split between this file and `./headline` mirrors the backend
 * route grouping: the topic list (`/topic`) lives here, everything
 * under `/headlines` lives next door.
 */

import { request } from "./client";
import type { StoryFilter, TopicResponse } from "./types/story";

/**
 * Fetch the topic list, with optional structured filters. Topics are
 * the same entities embedded under `StoryItem.topic` — exposed here
 * as a paginated top-level resource so callers can enumerate them
 * (e.g. for navigation / filter chips) without first loading stories.
 *
 * @param limit   How many topics to return (default 10).
 * @param skip    How many topics to skip from the start of the result
 *                set, for pagination (default 0).
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

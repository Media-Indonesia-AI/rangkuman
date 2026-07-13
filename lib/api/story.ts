/**
 * Story-domain API endpoints.
 *
 * Hits `/stories`. Re-exports are composed into the top-level `api`
 * object in `./client` so existing call sites
 * (`api.getListStory()`) keep working.
 *
 * The split between this file and the others mirrors the backend
 * route grouping: stories live here, headlines under `/headlines/*`
 * live in `./headline`, the topic list (`/topic`) lives in
 * `./topic`.
 */

import { request } from "./client";
import type { StoryFilter, StoryListResponse } from "./types/story";

/**
 * Fetch the stories list, with optional structured filters.
 *
 * Typical filter shape for narrowing to stories related to a specific
 * headline (matching the `stories[]` array on `HeadlineDetail`):
 *
 *   filters: [{
 *     field: "headline_id",
 *     operator: "eq",
 *     value: "6a4b1410c549f3ad229d2da7",
 *   }]
 *
 * @param limit   How many stories to return (default 10, matching
 *                the backend's default).
 * @param skip    How many stories to skip from the start of the
 *                result set, for pagination (default 0).
 * @param filters Structured `{ field, operator, value }` filters to
 *                narrow the result set (default `[]`). The list is
 *                JSON-encoded into a single `filters` query param,
 *                e.g.
 *                `filters=[{"field":"headline_id","operator":"eq","value":"..."}]`.
 *                Empty list omits the param entirely.
 */
export function getListStory(
  limit = 10,
  skip = 0,
  filters: StoryFilter[] = [],
): Promise<StoryListResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    skip: String(skip),
  });
  if (filters.length > 0) {
    params.set("filters", JSON.stringify(filters));
  }
  return request<StoryListResponse>(
    `story?${params.toString()}`,
    { method: "GET" },
  );
}
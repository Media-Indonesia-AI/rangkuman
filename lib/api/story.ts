/**
 * Story-domain API endpoints.
 *
 * Hits `/story/*`. Re-exports are composed into the top-level `api`
 * object in `./client` so existing call sites (`api.getTrendingStories()`
 * etc.) keep working.
 */

import { request } from "./client";
import type { TrendingStoriesResponse } from "./types/story";

/**
 * Fetch the current trending-ticker stories.
 *
 * @param limit How many trending tickers to return (default 20).
 * @param source Source identifier for the underlying feed
 *               (default `"sahamrakyat"`). The backend may accept
 *               other values to switch feeds.
 */
export function getTrendingStories(
  limit = 20,
  source = "sahamrakyat",
): Promise<TrendingStoriesResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    source,
  });
  return request<TrendingStoriesResponse>(
    `story/trending?${params.toString()}`,
    { method: "GET" },
  );
}
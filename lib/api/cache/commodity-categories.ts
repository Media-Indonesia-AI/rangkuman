/**
 * Request-level cache for `GET stocks/commodity-categories`.
 *
 * Single-slot cache — the commodity-category list is global (not
 * per-ticker) and rarely changes mid-session. Concurrent mounts
 * share one network round-trip. Errors clear the in-flight slot so
 * the next mount can retry.
 *
 * Uses the defaults from `getCommodityCategories()` (commodity
 * limit 10, top_stocks limit 0) — the most common case for the
 * CommodityPrices widget. Consumers that need a different shape
 * should call `api.getCommodityCategories(...)` directly and skip
 * this cache.
 */

import { api } from "../client";
import type { CommodityCategoriesResponse } from "../types/commodity-categories";

let cached: CommodityCategoriesResponse | null = null;
let inflight: Promise<CommodityCategoriesResponse> | null = null;

export function loadCommodityCategories(): Promise<CommodityCategoriesResponse> {
  if (cached !== null) return Promise.resolve(cached);
  if (inflight !== null) return inflight;
  inflight = api
    .getCommodityCategories()
    .then((res) => {
      cached = res;
      return res;
    })
    .catch((err) => {
      inflight = null; // allow retry on next mount
      throw err;
    });
  return inflight;
}
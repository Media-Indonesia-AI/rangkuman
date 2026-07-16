/**
 * Commodity-category-domain API endpoint.
 *
 * Hits `/stocks/commodity-categories` and returns the category list
 * with each category's commodities and each commodity's top_stocks
 * embedded. Kept in its own module (rather than folded into
 * `stocks.ts`) because:
 *   - The wire shape is a category-bucketed aggregate, not a
 *     per-ticker record like every other `/stocks/*` endpoint.
 *   - The cache key shape is different (single-slot — the
 *     commodity-category list is global, not per-ticker).
 *   - Consumers that only need commodity data shouldn't pull in
 *     the per-ticker request module.
 *
 * Re-exported into the top-level `api` object in `./client` so
 * existing call sites can keep using `api.getCommodityCategories()`.
 */

import { request } from "./client";
import type { CommodityCategoriesResponse } from "./types/commodity-categories";

/**
 * Fetch the full commodity-category list with each category's
 * commodities and each commodity's top related stocks.
 *
 * @param limit
 *   Max commodities to return per category
 *                        (default `10`). Caps the size of each
 *                        category's `commodities[]` array.
 * @param skip  Number of commodities to skip per category
 *                        (default `0`). Used for pagination.
 * @param topStocksLimit  Max top_stocks to return per commodity
 *                        (default `0` = include all). The backend
 *                        treats `0` as "no cap"; pass a positive
 *                        integer to slice the related-stocks list.
 *
 * The response is the wire envelope `{ data: CommodityCategory[] }`
 * — call sites receive it as-is so callers can introspect the
 * envelope without an extra wrapper. See
 * `CommodityCategoriesResponse` for the raw wire shape.
 */
export function getCommodityCategories(
  limit = 10,
  skip = 0,
): Promise<CommodityCategoriesResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    skip: String(skip),
  });
  return request<CommodityCategoriesResponse>(
    `commodity-categories?${params.toString()}`,
    { method: "GET" },
  );
}
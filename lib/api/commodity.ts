/**
 * Commodity-domain API endpoints.
 *
 * Both endpoints below live under the `/commodities/*` path
 * prefix and are grouped here for clean separation from auth
 * (`register`/`login`), market data (`getInterestRate`/
 * `getExchangeRate`), and per-ticker stock endpoints
 * (`getTickers`/`getKeyMetrics`) in `lib/api/client.ts`.
 *
 * The functions are individually re-exported and consumed by the
 * composite `api` object in `./client.ts`, so existing call
 * sites (`api.getCommodityCategories()`, `api.getCommodityHistorical()`)
 * keep working unchanged.
 */

import { request } from "./client";
import type { CommodityCategoriesResponse } from "./types/commodity-categories";
import type { CommodityHistoricalResponse } from "./types/commodity-historical";

/**
 * Fetch the full commodity-category list with each category's
 * commodities and each commodity's top related stocks.
 *
 * Hits `/commodities/commodity-categories`.
 *
 * @param commodityLimit  Max commodities to return per category
 *                        (default `10`). Caps the size of each
 *                        category's `commodities[]` array.
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

/**
 * Fetch the historical daily rate series for a commodity.
 *
 * Hits `/commodities/historical`.
 *
 * @param symbol  Wire symbol code (e.g. `"PLO:COM"`). Default
 *                `""` — the backend treats an empty symbol as
 *                the wildcard / default series (mirrors the
 *                user's parameter spec).
 * @param period  Time-window code (default `"1M"`). Common values:
 *                `"1D"`, `"5D"`, `"1M"`, `"3M"`, `"6M"`, `"1Y"`,
 *                `"YTD"`, `"ALL"`. Exact accepted values are
 *                determined by the backend.
 *
 * The response is the wire envelope — `{ symbol, period, data }`.
 * The `data[]` array is in chronological order (oldest → newest);
 * the first row's `percent_change` is `null` (no prior point).
 * See `CommodityHistoricalResponse` for the raw wire shape.
 */
export function getCommodityHistorical(
  symbol = "",
  period = "1M",
): Promise<CommodityHistoricalResponse> {
  const params = new URLSearchParams({ symbol, period });
  return request<CommodityHistoricalResponse>(
    `commodities/historical?${params.toString()}`,
    { method: "GET" },
  );
}
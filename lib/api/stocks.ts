/**
 * Stock-domain API endpoints.
 *
 * These methods all hit `/stocks/*` and are grouped here for clean
 * separation from auth (`register`/`login`) and market-data
 * (`getInterestRate`/`getExchangeRate`) in `lib/api/client.ts`.
 *
 * The functions are individually re-exported and consumed by the
 * composite `api` object in `./client.ts`, so existing call sites
 * (`api.getTopStocks()` etc.) keep working unchanged.
 */

import { request, todayIsoDate } from "./client";
import type {
  ForeignStocksResponse,
  TickersResponse,
  TopStocksResponse,
} from "./types";

/** Fetch top gainers and top loosers. `limit` controls how many per group (default 5). */
export function getTopStocks(limit = 5): Promise<TopStocksResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  return request<TopStocksResponse>(
    `stocks/top-stocks?${params.toString()}`,
    { method: "GET" },
  );
}

/** Fetch the full ticker catalog with latest price and day change. */
export function getTickers(): Promise<TickersResponse> {
  return request<TickersResponse>("stocks/ticker", { method: "GET" });
}

/**
 * Fetch foreign-investor buy/sell flow over a date range.
 * @param startDate ISO date string `YYYY-MM-DD`. Defaults to today.
 * @param endDate ISO date string `YYYY-MM-DD`. Defaults to today.
 */
export function getForeignStocks(
  startDate?: string,
  endDate?: string,
): Promise<ForeignStocksResponse> {
  const params = new URLSearchParams({
    startDate: startDate ?? todayIsoDate(),
    endDate: endDate ?? todayIsoDate(),
  });
  return request<ForeignStocksResponse>(
    `stocks/foreign-stocks?${params.toString()}`,
    { method: "GET" },
  );
}
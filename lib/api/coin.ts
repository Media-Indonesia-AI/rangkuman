/**
 * Coin-domain API endpoints.
 *
 * These methods hit `/coin/*` and are grouped here for clean
 * separation from stocks (`./stocks.ts`) and market data
 * (`./market.ts`).
 *
 * The functions are individually re-exported and consumed by the
 * composite `api` object in `./client.ts`, so existing call sites
 * (`api.getCoinTicker()`, etc.) keep working unchanged.
 */

import { request } from "./client";
import type {
  CoinTickerItem,
  CoinTopTickersResponse,
} from "./types/coin";

/** Fetch the coin ticker catalog with current price, 24h change,
 *  market cap, and logo. `limit` controls page size (default 30). */
export function getCoinTicker(limit = 30): Promise<CoinTickerItem[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  return request<CoinTickerItem[]>(
    `coin/ticker/?${params.toString()}`,
    { method: "GET" },
  );
}

/**
 * Fetch the day's top movers split into `top-gainer` and
 * `top-looser` groups. Mirrors the `TopStocksResponse` shape
 * (`{ data: [{ type, coins }] }`) so consumers can render the
 * two sides with the same layout.
 *
 * `limit` controls the per-group size — the endpoint returns up
 * to `limit` coins in each group (default 5).
 */
export function getCoinTopTickers(limit = 5): Promise<CoinTopTickersResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  return request<CoinTopTickersResponse>(
    `coin/top-tickers/?${params.toString()}`,
    { method: "GET" },
  );
}

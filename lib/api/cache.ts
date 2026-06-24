/**
 * Request-level cache + in-flight dedup for shared API calls.
 *
 * Both `LeftSidebar` and `MobileTopMovers` (mounted together on `/saham`
 * under `reactStrictMode`) would otherwise fire the same `getTopStocks`
 * request multiple times per page load. Sharing a single fetch via
 * module-level state collapses it down to one network round-trip.
 *
 * Only successful responses are cached. Errors clear the in-flight slot
 * so the next mount can retry.
 */

import { api } from "./client";
import type { TopStocksResponse } from "./types";

let cachedTopStocks: TopStocksResponse | null = null;
let inflightTopStocks: Promise<TopStocksResponse> | null = null;

export function loadTopStocks(): Promise<TopStocksResponse> {
  if (cachedTopStocks !== null) return Promise.resolve(cachedTopStocks);
  if (inflightTopStocks !== null) return inflightTopStocks;
  inflightTopStocks = api
    .getTopStocks()
    .then((res) => {
      cachedTopStocks = res;
      return res;
    })
    .catch((err) => {
      inflightTopStocks = null; // allow retry on next mount
      throw err;
    });
  return inflightTopStocks;
}
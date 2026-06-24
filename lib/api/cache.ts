/**
 * Request-level cache + in-flight dedup for shared API calls.
 *
 * Multiple components on the same page (e.g. `LeftSidebar` and
 * `MobileTopMovers` on `/saham`, or any other combination) would
 * otherwise fire the same request several times per page load — once
 * per mount, doubled again by `reactStrictMode` in dev. Sharing a
 * single fetch via module-level state collapses it down to one network
 * round-trip.
 *
 * Only successful responses are cached. Errors clear the in-flight
 * slot so the next mount can retry.
 */

import { api } from "./client";
import type { TickersResponse, TopStocksResponse } from "./types";

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

let cachedTickers: TickersResponse | null = null;
let inflightTickers: Promise<TickersResponse> | null = null;

/** Read the currently cached ticker list without triggering a fetch. */
export function peekTickers(): TickersResponse | null {
  return cachedTickers;
}

export function loadTickers(): Promise<TickersResponse> {
  if (cachedTickers !== null) return Promise.resolve(cachedTickers);
  if (inflightTickers !== null) return inflightTickers;
  inflightTickers = api
    .getTickers()
    .then((res) => {
      cachedTickers = res;
      return res;
    })
    .catch((err) => {
      inflightTickers = null; // allow retry on next mount
      throw err;
    });
  return inflightTickers;
}
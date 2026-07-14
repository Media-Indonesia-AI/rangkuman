/**
 * Request-level cache for `GET stocks/top-stocks`.
 *
 * Single-slot cache — only one top-movers snapshot is meaningful per
 * session. Concurrent mounts share one network round-trip; subsequent
 * mounts return the cached value instantly. Errors clear the in-flight
 * slot so the next mount can retry.
 */

import { api } from "../client";
import type { TopStocksResponse } from "../types/stocks";

let cached: TopStocksResponse | null = null;
let inflight: Promise<TopStocksResponse> | null = null;

export function loadTopStocks(): Promise<TopStocksResponse> {
  if (cached !== null) return Promise.resolve(cached);
  if (inflight !== null) return inflight;
  inflight = api
    .getTopStocks()
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

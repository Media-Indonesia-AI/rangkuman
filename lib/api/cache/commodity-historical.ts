/**
 * Request-level cache for `GET commodities/historical`.
 *
 * Per-(symbol, period) cache keyed by the composite pair. The
 * series for one symbol+period is independent of any other
 * (different symbols fetch different series; different periods
 * fetch different windows of the same series), so the cache
 * holds one entry per pair rather than a single global slot.
 *
 * Concurrent mounts of the same pair share one network round-
 * trip; subsequent mounts return the cached value instantly.
 * Errors clear the in-flight slot for that pair so the next
 * mount can retry.
 *
 * Symbols are uppercased before being used as a cache key so
 * callers can pass `"plo:com"` or `"PLO:COM"` interchangeably
 * — matches the convention used by `loadStockHistorical`.
 */

import { api } from "../client";
import type { CommodityHistoricalResponse } from "../types/commodity-historical";

const cached = new Map<string, CommodityHistoricalResponse>();
const inflight = new Map<string, Promise<CommodityHistoricalResponse>>();

/** Composite cache key — `symbol` uppercased + `period` uppercased. */
function key(symbol: string, period: string): string {
  return `${symbol.toUpperCase()}|${period.toUpperCase()}`;
}

/**
 * Fetch the historical daily rate series for a commodity, with
 * request-level dedup. See module header for the caching model.
 */
export function loadCommodityHistorical(
  symbol = "",
  period = "1M",
): Promise<CommodityHistoricalResponse> {
  const k = key(symbol, period);
  const hit = cached.get(k);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(k);
  if (pending) return pending;
  const promise = api
    .getCommodityHistorical(symbol, period)
    .then((res) => {
      cached.set(k, res);
      return res;
    })
    .catch((err) => {
      inflight.delete(k); // allow retry on next mount
      throw err;
    });
  inflight.set(k, promise);
  return promise;
}
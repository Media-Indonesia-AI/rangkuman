/**
 * Request-level cache for `GET stocks/stock/trending`.
 *
 * Per-`(date, page, limit)` cache — different combinations get
 * different slots. Concurrent and subsequent callers for the same
 * triplet share one network round-trip. Errors clear the in-flight
 * slot so the next mount can retry.
 */

import { toIsoDateTime } from "@/lib/util/formatDate";
import { api, todayIsoDate } from "../client";
import type { StocksTrendingResponse } from "../types/stocks";

const cached = new Map<string, StocksTrendingResponse>();
const inflight = new Map<string, Promise<StocksTrendingResponse>>();

/** Cache key for a given `(date, page, limit)` triplet. */
function key(date: string, page: number, limit: number): string {
  return `${date}|${page}|${limit}`;
}

/**
 * Fetch the trending tickers snapshot for a given date + page, with
 * request-level dedup.
 *
 * @param date  ISO date string `YYYY-MM-DD`. Defaults to today via
 *              `todayIsoDate()` when the caller passes nothing.
 * @param page  1-indexed page number (default 1).
 * @param limit Page size (default 20).
 */
export function loadStocksTrending(
  date: string = todayIsoDate(),
  page = 1,
  limit = 20,
): Promise<StocksTrendingResponse> {
  const parsedDate = toIsoDateTime(date);
  const k = key(parsedDate, page, limit);
  const hit = cached.get(k);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(k);
  if (pending) return pending;
  const promise = api
    .getStocksTrending(parsedDate, page, limit)
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

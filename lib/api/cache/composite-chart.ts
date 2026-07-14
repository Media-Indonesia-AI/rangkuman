/**
 * Request-level cache for `GET stocks/composite-chart`.
 *
 * Per-period cache — different time windows get different slots.
 * Concurrent and subsequent callers for the same period share one
 * network round-trip. Errors clear the in-flight slot so the next
 * mount can retry.
 */

import { api } from "../client";
import type { CompositeChartResponse } from "../types/stocks";

const cached = new Map<string, CompositeChartResponse>();
const inflight = new Map<string, Promise<CompositeChartResponse>>();

/**
 * Fetch the composite-chart price series for a given period, with
 * request-level dedup.
 *
 * @param period Time-window code (default `"1D"`). Exact accepted
 *               values are determined by the backend.
 */
export function loadCompositeChart(
  period = "1D",
): Promise<CompositeChartResponse> {
  const hit = cached.get(period);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(period);
  if (pending) return pending;
  const promise = api
    .getCompositeChart(period)
    .then((res) => {
      cached.set(period, res);
      return res;
    })
    .catch((err) => {
      inflight.delete(period); // allow retry on next mount
      throw err;
    });
  inflight.set(period, promise);
  return promise;
}

/**
 * Request-level cache for `GET stocks/ticker`.
 *
 * Single-slot cache — the ticker list rarely changes mid-session.
 * Concurrent mounts share one network round-trip. Errors clear the
 * in-flight slot so the next mount can retry.
 *
 * `peekTickers()` reads the currently-cached value without triggering
 * a fetch — useful for code paths that want the list synchronously
 * (e.g. ticker-name lookups) and can fall back to `null` if it's
 * not warmed yet.
 */

import { api } from "../client";
import type { TickersResponse } from "../types/stocks";

let cached: TickersResponse | null = null;
let inflight: Promise<TickersResponse> | null = null;

/** Read the currently cached ticker list without triggering a fetch. */
export function peekTickers(): TickersResponse | null {
  return cached;
}

export function loadTickers(): Promise<TickersResponse> {
  if (cached !== null) return Promise.resolve(cached);
  if (inflight !== null) return inflight;
  inflight = api
    .getTickers()
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

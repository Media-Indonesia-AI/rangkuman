/**
 * Request-level cache for `GET market-mood`.
 *
 * Single-slot cache — only one composite market-mood snapshot is
 * meaningful per session. Concurrent mounts share one network round-trip.
 * Errors clear the in-flight slot so the next mount can retry.
 */

import { api } from "../client";
import type { MarketMood } from "../types/moods";

let cached: MarketMood | null = null;
let inflight: Promise<MarketMood> | null = null;

/**
 * Fetch the composite market-mood snapshot, with request-level dedup.
 */
export function loadMarketMood(): Promise<MarketMood> {
  if (cached !== null) return Promise.resolve(cached);
  if (inflight !== null) return inflight;
  inflight = api
    .getMarketMood()
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

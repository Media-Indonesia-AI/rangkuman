/**
 * Request-level cache for `GET watchlist`.
 *
 * Single-slot cache — the watchlist is user-scoped (the
 * backend resolves the user from the auth header), the row
 * count is small (typically single digits), and the payload
 * only changes on explicit add/remove/reorder mutations.
 * Concurrent mounts share one network round-trip via the
 * `inflight` slot. Errors clear the in-flight slot so the
 * next mount can retry without getting stuck on a rejected
 * promise.
 *
 * Auth-gated — the endpoint rejects with no session, so
 * callers should gate the call on the session check before
 * invoking. Same pattern as `cache/wallet.ts` /
 * `cache/topup-bundle.ts`.
 */

import { api } from "../client";
import type { WatchlistResponse } from "../types/watchlist";

let cached: WatchlistResponse | null = null;
let inflight: Promise<WatchlistResponse> | null = null;

/**
 * Fetch the active user's watchlist with request-level dedup.
 * Returns `{ items: WatchlistItem[] }` — note the `items` key
 * here, not the standard `data` envelope used by the rest of
 * the API (matches the wire shape; see
 * `lib/api/types/watchlist.ts`).
 *
 * The wire order is not guaranteed; consumers that need a
 * stable display order should sort by `order` ascending at
 * the consumer layer.
 */
export function loadWatchlist(): Promise<WatchlistResponse> {
  if (cached !== null) return Promise.resolve(cached);
  if (inflight !== null) return inflight;
  inflight = api
    .getWatchlist()
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

/**
 * Drop the cached watchlist so the next `loadWatchlist()` refetches.
 * Call after any successful add / update / delete mutation —
 * the mutation request functions (`api.addToWatchlist`,
 * `api.updateWatchlist`, `api.deleteWatchlist`) intentionally
 * don't invalidate on their own, so the consumer is responsible
 * for clearing the cache at the right point in their flow.
 *
 * Matches the wallet / transaction-history pattern: the mutation
 * surface stays decoupled from the cache, the orchestration layer
 * (page / hook) decides when the cached snapshot is stale.
 */
export function invalidateWatchlist(): void {
  cached = null;
  inflight = null;
}

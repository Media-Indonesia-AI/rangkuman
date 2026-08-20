/**
 * Request-level cache for `GET broadcast-settings`.
 *
 * Single-slot cache — the payload is small (one object with
 * four booleans), user-scoped (the backend resolves the user
 * from the auth header), and only changes on explicit
 * settings mutations. Concurrent mounts share one network
 * round-trip via the `inflight` slot, so React strict-mode
 * double-fires and rapid remounts don't fan out into duplicate
 * `GET broadcast-settings` requests. Errors clear the
 * in-flight slot so the next mount can retry without getting
 * stuck on a rejected promise.
 *
 * Auth-gated — same pattern as `cache/wallet.ts`,
 * `cache/topup-bundle.ts`, and `cache/watchlist.ts`.
 */

import { api } from "../client";
import type { BroadcastSettings } from "../types/broadcast-settings";

let cached: BroadcastSettings | null = null;
let inflight: Promise<BroadcastSettings> | null = null;

/**
 * Fetch the active user's broadcast settings with request-level
 * dedup. Returns the raw `BroadcastSettings` object — the
 * backend does not wrap it in `{ data: ... }` (matches the
 * watchlist wire shape; see `lib/api/types/watchlist.ts`).
 */
export function loadBroadcastSettings(): Promise<BroadcastSettings> {
  if (cached !== null) return Promise.resolve(cached);
  if (inflight !== null) return inflight;
  inflight = api
    .getBroadcastSettings()
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
 * Drop the cached broadcast settings so the next
 * `loadBroadcastSettings()` refetches. Call after a successful
 * settings mutation — the mutation request function
 * (`api.updateBroadcastSettings`, when it lands) intentionally
 * doesn't invalidate on its own, so the consumer is responsible
 * for clearing the cache at the right point in their flow.
 *
 * Also notifies every subscriber registered via
 * `subscribeBroadcastSettingsInvalidate`, so mounted
 * `useGetBroadcastSettings` instances auto-refresh on any
 * mutation — the consumer doesn't need to wire `refresh()` calls
 * at each mutation site.
 *
 * Matches the wallet / transaction-history pattern: the mutation
 * surface stays decoupled from the cache, the orchestration layer
 * (page / hook) decides when the cached snapshot is stale.
 */
export function invalidateBroadcastSettings(): void {
  cached = null;
  inflight = null;
  listeners.forEach((l) => l());
}

/** Subscriber set — listeners are invoked (no args) on every
 *  cache invalidation so mounted read-hooks can re-fetch.
 *  Same shape as `cache/watchlist.ts`. */
type Listener = () => void;
const listeners = new Set<Listener>();

/** Register a listener for cache-invalidation events. Returns
 *  the unsubscribe function — call it on unmount to avoid leaks. */
export function subscribeBroadcastSettingsInvalidate(
  listener: Listener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

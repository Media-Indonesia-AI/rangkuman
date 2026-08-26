/**
 * Request-level cache for `GET users/me`.
 *
 * Single-slot cache — the payload is the active user's profile
 * (one `User` object), auth-gated (the backend resolves the user
 * from the auth header), and only changes on explicit user-profile
 * mutations (phone update, phone verify, etc.) or sign-in. Concurrent
 * mounts share one network round-trip via the `inflight` slot, so
 * React strict-mode double-fires and rapid remounts don't fan out
 * into duplicate `GET users/me` requests. Errors clear the
 * in-flight slot so the next mount can retry without getting
 * stuck on a rejected promise.
 *
 * Mirrors the auth-gated pattern from `cache/broadcast-settings.ts`,
 * `cache/wallet.ts`, `cache/topup-bundle.ts`, and `cache/watchlist.ts`.
 *
 * Cache priming: `lib/auth.ts` calls `loadUserInformation()`
 * fire-and-forget at the end of each successful auth flow
 * (`registerUser`, `loginWithIdentifier`, `loginWithGoogle`) so
 * the post-login first render already has data — without the
 * priming call the hook would block on the first mount's network
 * round-trip. The call is best-effort: errors are swallowed at
 * the auth site because auth success is the primary signal and
 * the user info fetch is a "nice to have".
 */

import { api } from "../client";
import type { User } from "../types/users";

let cached: User | null = null;
let inflight: Promise<User> | null = null;

/**
 * Fetch the active user's profile with request-level dedup. Returns
 * the bare `User` (the backend wraps it in `{ user }`, but the cache
 * unwraps once at the network boundary so consumers see the
 * object directly).
 */
export function loadUserInformation(): Promise<User> {
  if (cached !== null) return Promise.resolve(cached);
  if (inflight !== null) return inflight;
  inflight = api
    .getUserInformation()
    .then((res) => {
      cached = res.user;
      return res.user;
    })
    .catch((err) => {
      inflight = null; // allow retry on next mount
      throw err;
    });
  return inflight;
}

/**
 * Drop the cached user profile so the next `loadUserInformation()`
 * refetches. Call after a successful user-profile mutation (phone
 * update, phone verify, profile edits, etc.) — the mutation request
 * functions intentionally don't invalidate on their own, so the
 * consumer / orchestration layer is responsible for clearing the
 * cache at the right point in their flow.
 *
 * Also notifies every subscriber registered via
 * `subscribeUserInformationInvalidate`, so mounted
 * `useGetUserInformation` instances auto-refresh on any mutation —
 * the consumer doesn't need to wire `refresh()` calls at each
 * mutation site.
 *
 * Matches the wallet / broadcast-settings pattern: the mutation
 * surface stays decoupled from the cache, the orchestration layer
 * (page / hook) decides when the cached snapshot is stale.
 */
export function invalidateUserInformation(): void {
  cached = null;
  inflight = null;
  listeners.forEach((l) => l());
}

/** Subscriber set — listeners are invoked (no args) on every
 *  cache invalidation so mounted read-hooks can re-fetch.
 *  Same shape as `cache/watchlist.ts` / `cache/broadcast-settings.ts`. */
type Listener = () => void;
const listeners = new Set<Listener>();

/** Register a listener for cache-invalidation events. Returns
 *  the unsubscribe function — call it on unmount to avoid leaks. */
export function subscribeUserInformationInvalidate(
  listener: Listener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
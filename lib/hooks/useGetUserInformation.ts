"use client";

import { useEffect, useState } from "react";
import type { User } from "@/lib/api";
import { getCurrentUser, writeJson } from "@/lib/auth";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import {
  invalidateUserInformation,
  loadUserInformation,
  subscribeUserInformationInvalidate,
} from "@/lib/api/cache/users";

/**
 * Data hook for `GET users/me`.
 *
 * Fetches the active user's full profile on mount: account fields
 * (id, email, username, name, googleId, isEmailVerified), phone
 * state (phoneNumber, phoneNumberVerifiedAt), and the lifecycle
 * timestamps (createdAt, updatedAt). Auth-gated — the backend
 * resolves the user from the auth header.
 *
 * Routes through `loadUserInformation()` (the single-slot
 * request-deduping cache wrapper) so React strict-mode double-
 * fires and concurrent mounts share one network round-trip via
 * the cache's `inflight` slot — no duplicate `GET users/me`
 * requests on rapid mount cycles.
 *
 * **Persists the fetched profile back to localStorage** so any
 * component reading via `useCurrentUser()` (which is backed by
 * `getCurrentUser()` → `localStorage`) sees the same fresh
 * server-authoritative fields — most importantly the phone
 * fields that the auth-flow responses don't carry and the
 * `isEmailVerified` / `updatedAt` flips. The merge preserves the
 * client-only session fields (`password` / `loggedInAt` /
 * `provider`) that the wire doesn't include — they're sourced
 * from the existing localStorage entry, not the API response.
 * `password` is the HTTP-Basic-auth credential used by
 * `getAuthHeader()` in `lib/api/client.ts`; dropping it would
 * 401 every subsequent authenticated call.
 *
 * The hook manages a local `User | null` state with a cancel-on-
 * unmount guard so a fast unmount doesn't setState on a stale
 * response.
 *
 * On error the hook returns `{ data: null, isLoading: false, error }`.
 * `data` is preserved across a transient retry so the previous
 * successful payload isn't wiped out by a follow-up failure.
 *
 * Returns:
 *   - `data`        — the fetched user, or `null` while loading
 *                     / on error.
 *   - `isLoading`   — `true` while the request is in flight.
 *   - `error`       — localised API error message, or `null`.
 *                     The hook extracts `.message` from the
 *                     `ApiError` shape so consumers don't have
 *                     to re-throw / re-cast.
 *   - `refresh`     — `() => void`. Drops the cache slot via
 *                     `invalidateUserInformation()` and re-fires
 *                     the effect so the next render hits the
 *                     wire. Useful when a phone-update endpoint
 *                     lands and the page wants to re-pull after
 *                     a mutation — pair with
 *                     `subscribeUserInformationInvalidate` once
 *                     the update hook exists.
 */
export function useGetUserInformation(): {
  data: User | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const [data, setData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // `refreshKey` increments on each `refresh()` call. Including
  // it in the effect's deps forces the effect to re-run, which
  // hits the (now-invalidated) cache slot and lands a fresh
  // payload. Without this, the effect would only re-run on
  // mount / unmount.
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => {
    invalidateUserInformation();
    setRefreshKey((k) => k + 1);
  };

  // Auto-refresh on any cache invalidation: when a mutation hook
  // (e.g. a future `useUpdatePhone` / `useVerifyPhone`) calls
  // `invalidateUserInformation()` on success, it notifies every
  // subscriber and bumps `refreshKey`, which re-runs the fetch
  // effect above. Consumers no longer need to call `refresh()`
  // themselves at every mutation site — the trigger is centralised
  // here. Mirrors the `useGetWatchlist` ↔ `invalidateWatchlist`
  // and `useGetBroadcastSettings` ↔ `invalidateBroadcastSettings`
  // subscriber patterns.
  useEffect(() => {
    return subscribeUserInformationInvalidate(() => {
      setRefreshKey((k) => k + 1);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    void loadUserInformation()
      .then((res) => {
        if (cancelled) return;
        setData(res);
        // Mirror the fresh profile into localStorage so
        // `useCurrentUser()` (which reads from localStorage) sees
        // the same server-authoritative fields — most importantly
        // the phone fields the auth-flow responses don't carry.
        //
        // Merge logic: the wire `User` is server-authoritative
        // (id / email / username / name / googleId /
        // isEmailVerified / phoneNumber / phoneNumberVerifiedAt /
        // createdAt / updatedAt), so it wins for those fields.
        // The three client-only session fields (`password`,
        // `loggedInAt`, `provider`) are NOT on the wire — we
        // copy them off the existing localStorage entry (if any)
        // so the Basic-auth credential + session metadata
        // survive the refresh. Falls back to `createdAt` /
        // undefined if there's no existing entry.
        const existing = getCurrentUser();
        const merged: User = {
          ...res,
          password: existing?.password,
          loggedInAt: existing?.loggedInAt ?? res.createdAt,
          provider: existing?.provider,
        };
        writeJson(STORAGE_KEYS.user, merged);
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          (err as { message?: string }).message ??
          "Gagal ngambil data pengguna";
        setError(message);
        // Leave `data` as-is on error — a previous successful
        // payload shouldn't be wiped out by a transient retry.
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { data, isLoading, error, refresh };
}
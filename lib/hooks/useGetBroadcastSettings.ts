"use client";

import { useEffect, useState } from "react";
import type { BroadcastSettings } from "@/lib/api";
import {
  invalidateBroadcastSettings,
  loadBroadcastSettings,
  subscribeBroadcastSettingsInvalidate,
} from "@/lib/api/cache";

/**
 * Data hook for `GET broadcast-settings`.
 *
 * Fetches the active user's broadcast / push-notification
 * settings on mount: the master switch (`is_enabled`) plus per-
 * slot opt-ins for morning, afternoon, and evening. Auth-gated
 * — the backend resolves the user from the auth header.
 *
 * Routes through `loadBroadcastSettings()` (the single-slot
 * request-deduping cache wrapper) so React strict-mode double-
 * fires and concurrent mounts share one network round-trip via
 * the cache's `inflight` slot — no duplicate `GET broadcast-
 * settings` requests on rapid mount cycles.
 *
 * The hook manages a local `BroadcastSettings | null` state with
 * a cancel-on-unmount guard so a fast unmount doesn't setState
 * on a stale response.
 *
 * On error the hook returns `{ data: null, isLoading: false, error }`.
 * `data` is preserved across a transient retry so the previous
 * successful payload isn't wiped out by a follow-up failure.
 *
 * Returns:
 *   - `data`        — the fetched settings, or `null` while
 *                     loading / on error.
 *   - `isLoading`   — `true` while the request is in flight.
 *   - `error`       — localised API error message, or `null`.
 *                     The hook extracts `.message` from the
 *                     `ApiError` shape so consumers don't have
 *                     to re-throw / re-cast.
 *   - `refresh`     — `() => void`. Drops the cache slot via
 *                     `invalidateBroadcastSettings()` and re-fires
 *                     the effect so the next render hits the
 *                     wire. Useful when an update endpoint lands
 *                     and the page wants to re-pull after a
 *                     mutation — pair with a `subscribeBroadcast-
 *                     SettingsInvalidate` bus once the update hook
 *                     exists.
 */
export function useGetBroadcastSettings(): {
  data: BroadcastSettings | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const [data, setData] = useState<BroadcastSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // `refreshKey` increments on each `refresh()` call. Including
  // it in the effect's deps forces the effect to re-run, which
  // hits the (now-invalidated) cache slot and lands a fresh
  // payload. Without this, the effect would only re-run on
  // mount / unmount.
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => {
    invalidateBroadcastSettings();
    setRefreshKey((k) => k + 1);
  };

  // Auto-refresh on any cache invalidation: when a mutation hook
  // (currently `useUpdateBroadcastSettings`) calls
  // `invalidateBroadcastSettings()` on success, it notifies every
  // subscriber and bumps `refreshKey`, which re-runs the fetch
  // effect above. Consumers no longer need to call `refresh()`
  // themselves at every mutation site — the trigger is centralised
  // here. Mirrors the `useGetWatchlist` ↔ `invalidateWatchlist`
  // subscriber pattern.
  useEffect(() => {
    return subscribeBroadcastSettingsInvalidate(() => {
      setRefreshKey((k) => k + 1);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    void loadBroadcastSettings()
      .then((res) => {
        if (cancelled) return;
        setData(res);
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          (err as { message?: string }).message ??
          "Gagal ngambil setelan broadcast";
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

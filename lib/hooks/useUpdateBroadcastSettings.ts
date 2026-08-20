"use client";

import { useCallback, useState } from "react";
import {
  api,
  type BroadcastSettings,
  type BroadcastSettingsRequest,
} from "@/lib/api";
import { invalidateBroadcastSettings } from "@/lib/api/cache";

/**
 * Mutation hook for `PUT broadcast-settings`. Mirrors
 * `useUpdateWatchlist` — exposes a callable `update(body)` rather
 * than auto-firing on mount, so the consumer decides when the
 * save lands (typically on click of a "Perbarui" button after the
 * user has finished editing).
 *
 * Returns the resolved `BroadcastSettings` (the freshly-saved
 * row, per the backend's contract) plus loading + error state
 * for the UI to bind to:
 *
 *   - `data`        — last successful saved row, or `null`.
 *   - `isLoading`   — true while the request is in flight; the
 *                     trigger control should be disabled.
 *   - `error`       — localised API error message, or `null`.
 *                     The hook extracts `.message` from the
 *                     `ApiError` shape so consumers don't have
 *                     to re-throw / re-cast.
 *   - `update`      — `(body) => Promise<{ ok: boolean; data: BroadcastSettings | null }>`.
 *                     Resolves with `ok: true` on success (the
 *                     saved row is in `data`) or `ok: false` on
 *                     failure — needed so callers can distinguish
 *                     failure from "saved but `data` happens to
 *                     be null" if the contract ever changes.
 *
 * On success the hook invalidates the broadcast-settings cache
 * so the next `loadBroadcastSettings()` refetches the up-to-
 * date row. Note: there is no subscriber bus for broadcast-
 * settings yet (unlike `useGetWatchlist`, which auto-refreshes
 * via `subscribeWatchlistInvalidate`); consumers that want
 * their UI to react to the saved state should update local
 * state on the `ok: true` branch.
 */
export function useUpdateBroadcastSettings(): {
  data: BroadcastSettings | null;
  isLoading: boolean;
  error: string | null;
  update: (
    body: BroadcastSettingsRequest,
  ) => Promise<{ ok: boolean; data: BroadcastSettings | null }>;
} {
  const [data, setData] = useState<BroadcastSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (
      body: BroadcastSettingsRequest,
    ): Promise<{ ok: boolean; data: BroadcastSettings | null }> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.updateBroadcastSettings(body);
        setData(res);
        invalidateBroadcastSettings();
        return { ok: true, data: res };
      } catch (err) {
        const message =
          (err as { message?: string }).message ??
          "Gagal update setelan broadcast";
        setError(message);
        return { ok: false, data: null };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { data, isLoading, error, update };
}

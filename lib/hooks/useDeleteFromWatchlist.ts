"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api";
import { invalidateWatchlist } from "@/lib/api/cache";
import type { WatchlistResponse } from "@/lib/api";
import { track, EVENTS } from "@/lib/analytics-events";

/**
 * Mutation hook for `DELETE watchlist`. Unlike the read-side
 * watchlist hook (`useGetWatchlist`) this one doesn't auto-fire
 * on mount — it exposes a `remove(ticker_code)` callable so the
 * consumer fires the mutation from a button click (or the
 * card's X button).
 *
 * Returns the resolved `WatchlistResponse` (the refreshed list
 * after the delete, per the backend's contract) plus loading +
 * error state for the UI to bind to:
 *
 *   - `data`        — last successful updated list, or `null`.
 *                     Survives across renders so card-level
 *                     "unmount on delete" logic can rely on the
 *                     next render of the parent grid.
 *   - `isLoading`   — true while the request is in flight; the
 *                     remove button should be disabled.
 *   - `error`       — localised API error message, or `null`.
 *                     The hook extracts `.message` from the
 *                     `ApiError` shape so consumers don't have
 *                     to re-throw / re-cast.
 *   - `remove`      — `(ticker_code) => Promise<{ ok: boolean; data: WatchlistResponse | null }>`.
 *                     Resolves with `ok: true` on success (with
 *                     the updated list when the backend returns
 *                     a body, or `data: null` on a 204 No Content
 *                     response) and `ok: false` on failure —
 *                     needed because the backend may legitimately
 *                     answer 204 and `data === null` no longer
 *                     means failure.
 *
 * On success the hook invalidates the watchlist cache, which
 * notifies every subscriber — mounted `useGetWatchlist`
 * instances auto-refresh via their subscription effect, so the
 * consumer doesn't have to wire `refresh()` calls at the
 * mutation site.
 */
export function useDeleteFromWatchlist(): {
  data: WatchlistResponse | null;
  isLoading: boolean;
  error: string | null;
  remove: (
    ticker_code: string,
  ) => Promise<{ ok: boolean; data: WatchlistResponse | null }>;
} {
  const [data, setData] = useState<WatchlistResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(
    async (
      ticker_code: string,
    ): Promise<{ ok: boolean; data: WatchlistResponse | null }> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.deleteWatchlist({ ticker_code });
        // `res` may be `null` on a 204 No Content — that's a
        // legitimate success, not a failure. The mutation
        // succeeded either way, so we invalidate the cache and
        // notify subscribers in both branches.
        setData(res);
        invalidateWatchlist();
        // Hook-layer is the SOLE source of `watchlist_remove`
        // events — components call `remove()` but must NOT also
        // fire this event (would double-count).
        track(EVENTS.watchlist_remove, { ticker: ticker_code });
        return { ok: true, data: res };
      } catch (err) {
        const message =
          (err as { message?: string }).message ??
          "Gagal hapus dari watchlist";
        setError(message);
        return { ok: false, data: null };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { data, isLoading, error, remove };
}

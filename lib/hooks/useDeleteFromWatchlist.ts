"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api";
import { invalidateWatchlist } from "@/lib/api/cache";
import type { WatchlistResponse } from "@/lib/api";

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
 *   - `isLoading`   — true while the request is in flight; the
 *                     remove button should be disabled.
 *   - `error`       — localised API error message, or `null`.
 *                     The hook extracts `.message` from the
 *                     `ApiError` shape so consumers don't have
 *                     to re-throw / re-cast.
 *   - `remove`      — `(ticker_code) => Promise<WatchlistResponse | null>`.
 *                     Resolves with the updated list on success
 *                     or `null` on failure (so callers can
 *                     `await` and branch without a try/catch).
 *
 * The hook invalidates the watchlist cache on success so the
 * next `useGetWatchlist().refresh()` (or fresh mount) lands
 * the up-to-date list. The consumer is responsible for calling
 * `refresh()` after the mutation resolves — this matches the
 * wallet top-up pattern (`useRequestTopup` doesn't refresh the
 * list itself; the page does).
 */
export function useDeleteFromWatchlist(): {
  data: WatchlistResponse | null;
  isLoading: boolean;
  error: string | null;
  remove: (ticker_code: string) => Promise<WatchlistResponse | null>;
} {
  const [data, setData] = useState<WatchlistResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(
    async (ticker_code: string): Promise<WatchlistResponse | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.deleteWatchlist({ ticker_code });
        setData(res);
        invalidateWatchlist();
        return res;
      } catch (err) {
        const message =
          (err as { message?: string }).message ??
          "Gagal hapus dari watchlist";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { data, isLoading, error, remove };
}
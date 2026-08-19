"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api";
import { invalidateWatchlist } from "@/lib/api/cache";

/**
 * Mutation hook for `POST watchlist`. Unlike the read-side
 * watchlist hook (`useGetWatchlist`) this one doesn't auto-fire
 * on mount — it exposes an `add(ticker_code, order)` callable
 * so the consumer fires the mutation from a button click.
 *
 * Returns the resolved `WatchlistItem` (the freshly-created row)
 * plus loading + error state for the UI to bind to:
 *
 *   - `data`        — last successful row, or `null`.
 *   - `isLoading`   — true while the request is in flight; the
 *                     submit button should be disabled.
 *   - `error`       — localised API error message, or `null`.
 *                     The hook extracts `.message` from the
 *                     `ApiError` shape so consumers don't have
 *                     to re-throw / re-cast.
 *   - `add`         — `(ticker_code, order) => Promise<WatchlistItem | null>`.
 *                     Resolves with the row on success or
 *                     `null` on failure (so callers can `await`
 *                     and branch without a try/catch).
 *
 * The hook invalidates the watchlist cache on success so the
 * next `useGetWatchlist().refresh()` (or fresh mount) lands
 * the up-to-date list. The consumer is responsible for calling
 * `refresh()` after the mutation resolves — this matches the
 * wallet top-up pattern (`useRequestTopup` doesn't refresh the
 * list itself; the page does).
 */
export function useAddToWatchlist(): {
  data: import("@/lib/api").WatchlistItem | null;
  isLoading: boolean;
  error: string | null;
  add: (
    ticker_code: string,
    order: number,
  ) => Promise<import("@/lib/api").WatchlistItem | null>;
} {
  const [data, setData] = useState<import("@/lib/api").WatchlistItem | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = useCallback(
    async (
      ticker_code: string,
      order: number,
    ): Promise<import("@/lib/api").WatchlistItem | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.addToWatchlist({ ticker_code, order });
        setData(res);
        invalidateWatchlist();
        return res;
      } catch (err) {
        const message =
          (err as { message?: string }).message ??
          "Gagal nambahin ke watchlist";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { data, isLoading, error, add };
}
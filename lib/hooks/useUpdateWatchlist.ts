"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api";
import { invalidateWatchlist } from "@/lib/api/cache";
import type { WatchlistItem } from "@/lib/api";
import { track, EVENTS } from "@/lib/analytics-events";

/**
 * Mutation hook for `PUT watchlist`. Mirrors `useAddToWatchlist`
 * — exposes a callable `update(ticker_code, order)` rather than
 * auto-firing on mount, so the consumer decides when the reorder
 * lands (typically on drop-end of a drag-to-reorder interaction).
 *
 * Returns the resolved `WatchlistItem` (the freshly-updated row)
 * plus loading + error state for the UI to bind to:
 *
 *   - `data`        — last successful row, or `null`.
 *   - `isLoading`   — true while the request is in flight; the
 *                     trigger control should be disabled.
 *   - `error`       — localised API error message, or `null`.
 *   - `update`      — `(ticker_code, order) => Promise<WatchlistItem | null>`.
 *                     Resolves with the row on success or
 *                     `null` on failure (so callers can `await`
 *                     and branch without a try/catch).
 *
 * On success the hook invalidates the watchlist cache, which
 * also notifies subscribers — every mounted `useGetWatchlist`
 * auto-refreshes via its subscription effect, so the consumer
 * doesn't have to wire `refresh()` calls at the mutation site.
 */
export function useUpdateWatchlist(): {
  data: WatchlistItem | null;
  isLoading: boolean;
  error: string | null;
  update: (
    ticker_code: string,
    order: number,
  ) => Promise<WatchlistItem | null>;
} {
  const [data, setData] = useState<WatchlistItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (
      ticker_code: string,
      order: number,
    ): Promise<WatchlistItem | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.updateWatchlist({ ticker_code, order });
        setData(res);
        invalidateWatchlist();
        // `moved_ticker` is the row that was just repositioned;
        // `count` is the post-reorder total. Stays at the hook
        // layer so every drag-to-reorder consumer (sidebar,
        // dialog, dedicated reorder page) reports the same
        // event shape.
        track(EVENTS.watchlist_reorder, {
          moved_ticker: ticker_code,
        });
        return res;
      } catch (err) {
        const message =
          (err as { message?: string }).message ??
          "Gagal update watchlist";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { data, isLoading, error, update };
}

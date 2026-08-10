"use client";

import { useCallback, useEffect, useState } from "react";
import type { WalletTransaction } from "@/lib/api";
import {
  invalidateTransactionHistory,
  loadTransactionHistory,
} from "@/lib/api/cache";

/**
 * Data hook for `GET wallet/transaction`.
 *
 * Wraps `loadTransactionHistory()` (the per-(limit, skip)
 * request-deduping cache wrapper) with React state +
 * cancel-on-unmount guard. Concurrent mounts share one network
 * round-trip via the cache module's `inflight` Map.
 *
 * The hook preserves the API's wire order — consumers that need
 * newest-first should sort the returned array by `created_at`
 * descending themselves (the backend doesn't guarantee an order
 * and we want the cache to be a faithful record of what the wire
 * returned).
 *
 * On error the hook returns `{ data: [], isLoading: false }` so
 * consumers can fall back to their empty-state without an extra
 * null-check. `loadTransactionHistory()` itself clears the
 * in-flight slot on rejection, so the next mount can retry.
 *
 * `refresh()` drops the (limit, skip) cache slot via
 * `invalidateTransactionHistory()` and re-fires the effect so
 * the next mount / effect-run hits the wire. Used after a
 * mutation (typically `POST wallet/topup`) so the list lands the
 * freshest invoice without waiting for the page to remount.
 *
 * @param limit How many transactions to fetch (default 10).
 * @param skip  How many to skip from the start (default 0).
 */
export function useGetTransactionHistory(
  limit = 10,
  skip = 0,
): {
  data: WalletTransaction[];
  isLoading: boolean;
  refresh: () => void;
} {
  const [data, setData] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // `refreshKey` increments on each `refresh()` call. Including
  // it in the effect's deps forces the effect to re-run, which
  // hits the (now-invalidated) cache slot and lands a fresh
  // payload. Without this, the effect would only re-run on
  // changes to `limit` / `skip`.
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    invalidateTransactionHistory(limit, skip);
    setRefreshKey((k) => k + 1);
  }, [limit, skip]);

  useEffect(() => {
    let cancelled = false;

    setData([]);
    setIsLoading(true);

    void loadTransactionHistory(limit, skip)
      .then((res) => {
        if (cancelled) return;
        setData(res.data);
      })
      .catch(() => {
        // Swallow — the consumer renders an empty state on error.
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [limit, skip, refreshKey]);

  return { data, isLoading, refresh };
}
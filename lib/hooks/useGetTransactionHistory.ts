"use client";

import { useEffect, useState } from "react";
import type { WalletTransaction } from "@/lib/api";
import { loadTransactionHistory } from "@/lib/api/cache";

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
 * @param limit How many transactions to fetch (default 10).
 * @param skip  How many to skip from the start (default 0).
 */
export function useGetTransactionHistory(
  limit = 10,
  skip = 0,
): { data: WalletTransaction[]; isLoading: boolean } {
  const [data, setData] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
  }, [limit, skip]);

  return { data, isLoading };
}
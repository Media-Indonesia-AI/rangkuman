"use client";

import { useCallback, useEffect, useState } from "react";
import type { Wallet } from "@/lib/api";
import { invalidateWallet, loadWallet } from "@/lib/api/cache";

/**
 * Data hook for `GET wallet`.
 *
 * Wraps `loadWallet()` (the single-slot request-deduping cache
 * wrapper) with React state + a cancel-on-unmount guard.
 * Concurrent mounts (React 18 strict-mode double-invoke) share
 * one network round-trip via the cache module's `inflight` slot.
 *
 * `lots[]` is FIFO from the server (oldest first) — consumers
 * that need the next-to-expire balance should read
 * `wallet.lots[0]?.expire_at` without re-sorting.
 *
 * On error the hook returns `{ data: null, isLoading: false }` so
 * consumers can render an empty/zero state without an extra
 * null-check. `loadWallet()` itself clears the in-flight slot on
 * rejection, so the next mount can retry.
 *
 * `refresh()` drops the wallet cache via `invalidateWallet()`
 * and re-fires the effect so the next call hits the wire. Used
 * after an external signal makes the cached payload stale —
 * most commonly an SSE-driven `payment-status-changed` event
 * that credits koin without a remount.
 */
export function useGetWallet(): {
  data: Wallet | null;
  isLoading: boolean;
  refresh: () => void;
} {
  const [data, setData] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // `refreshKey` increments on each `refresh()` call. Including
  // it in the effect's deps forces the effect to re-run, which
  // hits the (now-invalidated) cache slot and lands a fresh
  // payload. Mirrors the pattern in `useGetTransactionHistory`.
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    invalidateWallet();
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);

    void loadWallet()
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
  }, [refreshKey]);

  return { data, isLoading, refresh };
}
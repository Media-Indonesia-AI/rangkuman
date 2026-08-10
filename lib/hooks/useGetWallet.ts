"use client";

import { useEffect, useState } from "react";
import type { Wallet } from "@/lib/api";
import { loadWallet } from "@/lib/api/cache";

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
 */
export function useGetWallet(): {
  data: Wallet | null;
  isLoading: boolean;
} {
  const [data, setData] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setData(null);
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
  }, []);

  return { data, isLoading };
}
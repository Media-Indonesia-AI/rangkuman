"use client";

import { useCallback, useEffect, useState } from "react";
import type { WatchlistItem } from "@/lib/api";
import {
  invalidateWatchlist,
  loadWatchlist,
  subscribeWatchlistInvalidate,
} from "@/lib/api/cache";

/**
 * Data hook for `GET watchlist`.
 *
 * Wraps `loadWatchlist()` (the single-slot request-deduping
 * cache wrapper) with React state + cancel-on-unmount guard.
 * Concurrent mounts share one network round-trip via the
 * cache module's `inflight` slot.
 *
 * The hook returns the raw `WatchlistItem[]` from the wire
 * — consumers that need a stable display order should sort
 * by `order` ascending themselves (the backend doesn't
 * guarantee a wire order, and we want the cache to be a
 * faithful record of what the wire returned).
 *
 * On error the hook returns `{ items: [], isLoading: false }`
 * so consumers can fall back to their empty-state without an
 * extra null-check. `loadWatchlist()` itself clears the
 * in-flight slot on rejection, so the next mount can retry.
 *
 * `refresh()` drops the cache slot via `invalidateWatchlist()`
 * and re-fires the effect so the next mount / effect-run hits
 * the wire. Used after a mutation (add / remove / reorder) so
 * the list lands the freshest rows without waiting for the
 * page to remount.
 */
export function useGetWatchlist(): {
  items: WatchlistItem[];
  isLoading: boolean;
  refresh: () => void;
} {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // `refreshKey` increments on each `refresh()` call. Including
  // it in the effect's deps forces the effect to re-run, which
  // hits the (now-invalidated) cache slot and lands a fresh
  // payload. Without this, the effect would only re-run on
  // mount / unmount.
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    invalidateWatchlist();
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    setItems([]);
    setIsLoading(true);

    void loadWatchlist()
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
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

  // Auto-refresh on any cache invalidation: when a mutation hook
  // (add / update / delete) calls `invalidateWatchlist()` on success,
  // it notifies every subscriber and bumps `refreshKey`, which
  // re-runs the fetch effect above. Consumers no longer need to
  // call `refresh()` themselves at every mutation site — the
  // trigger is centralised here.
  useEffect(() => {
    return subscribeWatchlistInvalidate(() => {
      setRefreshKey((k) => k + 1);
    });
  }, []);

  return { items, isLoading, refresh };
}
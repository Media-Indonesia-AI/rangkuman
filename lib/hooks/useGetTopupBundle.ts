"use client";

import { useEffect, useState } from "react";
import type { TopupBundle } from "@/lib/api";
import { loadTopupBundle } from "@/lib/api/cache";

/**
 * Data hook for `GET wallet/topup/bundle`.
 *
 * Wraps `loadTopupBundle()` (the single-slot request-deduping
 * cache wrapper) with React state + a cancel-on-unmount guard.
 * Concurrent mounts (e.g. React 18 strict-mode double-invoke)
 * share one network round-trip via the cache module's `inflight`
 * slot; subsequent mounts after resolution return the same cached
 * response without hitting the wire.
 *
 * The catalogue is small (typically 3-6 bundles) and rarely
 * changes mid-session, so we sort by `sort` ascending on read —
 * the API may not always return sorted rows, and the
 * `<TopUpPage />` chips need a stable display order to highlight
 * the front bundle.
 *
 * On error the hook returns `{ data: [], isLoading: false }` so
 * consumers can fall back to their empty state without an extra
 * null-check — same convention as `useGetTickerListArticles`.
 */
export function useGetTopupBundle(): {
  data: TopupBundle[];
  isLoading: boolean;
} {
  const [data, setData] = useState<TopupBundle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setData([]);
    setIsLoading(true);

    void loadTopupBundle()
      .then((res) => {
        if (cancelled) return;
        // Sort by `sort` ascending so the API's "front" bundle
        // lands first regardless of the wire order. Spreads into
        // a new array so we don't mutate the cached payload.
        const sorted = [...res.data].sort((a, b) => a.sort - b.sort);
        setData(sorted);
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
"use client";

import { useEffect, useState } from "react";
import type { Sector } from "@/lib/api";
import { loadSectors } from "@/lib/api/cache";

/**
 * Data hook for `GET stocks/sectors`.
 *
 * Wraps `loadSectors()` (the single-slot, request-deduping cache
 * wrapper) with React state + a cancel-on-unmount guard. Two
 * concurrent mounts share one network round-trip via the cache
 * module's `inflight` promise. `peekSectors()` lets sibling
 * components read the cached value synchronously once it's
 * warmed.
 *
 * The hook returns the *unwrapped* `Sector[]` (not the wire
 * envelope) so consumers don't have to reach for `.data` on
 * every render. The cache module still holds the full
 * `SectorsResponse` so `peekSectors()` callers see the original
 * shape.
 *
 * On error the hook returns `data: null` so consumers can
 * render their graceful empty-state without an extra null check
 * beyond the existing "data is loading" path. `isLoading` flips
 * to `false` once the fetch settles either way.
 */
export function useSectors(limit = 3): {
  data: Sector[] | null;
  isLoading: boolean;
} {
  const [data, setData] = useState<Sector[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setIsLoading(true);

    void loadSectors(limit)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        // Swallow — caller renders its graceful empty state;
        // `data` stays `null` and the consumer treats that the
        // same as "still loading".
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { data, isLoading };
}

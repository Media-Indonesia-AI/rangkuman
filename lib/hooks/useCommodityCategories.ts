"use client";

import { useEffect, useState } from "react";
import type { CommodityCategory } from "@/lib/api/types/commodity-categories";
import { loadCommodityCategories } from "@/lib/api/cache";

/**
 * Data hook for `GET commodities/commodity-categories`.
 *
 * Wraps `loadCommodityCategories()` (the single-slot, request-
 * deduping cache wrapper) with React state + a cancel-on-unmount
 * guard. Two concurrent mounts share one network round-trip via
 * the cache module's `inflight` promise.
 *
 * The hook returns the *unwrapped* `CommodityCategory[]` (not
 * the wire envelope) so consumers don't have to reach for
 * `.data` on every render. The cache module still holds the
 * full `CommodityCategoriesResponse` so the calling site can
 * keep its shape stable if a future consumer needs the raw
 * envelope.
 *
 * On error the hook returns `data: null` so consumers can
 * render their graceful empty-state without an extra null check
 * beyond the existing "data is loading" path. `isLoading` flips
 * to `false` once the fetch settles either way.
 */
export function useCommodityCategories(): {
  data: CommodityCategory[] | null;
  isLoading: boolean;
} {
  const [data, setData] = useState<CommodityCategory[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setIsLoading(true);

    void loadCommodityCategories()
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
  }, []);

  return { data, isLoading };
}
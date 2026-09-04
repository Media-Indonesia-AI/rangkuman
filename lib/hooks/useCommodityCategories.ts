"use client";

import { useEffect, useState } from "react";
import type { ApiError } from "@/lib/api";
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
 * to `false` once the fetch settles either way. `status`
 * surfaces the HTTP status from `ApiError` so callers can
 * special-case `401` (endpoint requires auth) — typically to
 * swap in a login prompt — without losing the silent
 * "still loading / failed gracefully" default for other errors.
 */
export function useCommodityCategories(): {
  data: CommodityCategory[] | null;
  isLoading: boolean;
  /** HTTP status from the failing response, when the failure
   *  came from the API (vs. a thrown JS exception). Undefined
   *  while the request is still in flight or after a success. */
  status?: number;
} {
  const [data, setData] = useState<CommodityCategory[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<number | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setIsLoading(true);
    setStatus(undefined);

    void loadCommodityCategories()
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err: unknown) => {
        // Swallow — caller renders its graceful empty state;
        // `data` stays `null` and the consumer treats that the
        // same as "still loading". Capture the status so the
        // consumer can still tell a `401` apart from any other
        // failure (the only branch that needs a different UI
        // surface today — `<CommodityLoginPrompt />`).
        if (!cancelled) {
          const apiErr = err as ApiError;
          setStatus(apiErr?.status);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading, status };
}

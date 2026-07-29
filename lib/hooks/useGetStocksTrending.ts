"use client";

import { useCallback, useEffect, useState } from "react";
import { type StockTrendingItem } from "@/lib/api";
import { loadStocksTrending } from "@/lib/api/cache";
import { todayIsoDate } from "@/lib/api/client";

/**
 * Data hook for the "Paling banyak diberitakan" rail on `/saham`.
 * Wraps `loadStocksTrending()` (the request-deduping cache wrapper
 * for `GET stocks/stock/trending`) with React state + a
 * cancel-on-unmount guard.
 *
 * Concurrent mounts of the consumer (e.g. React 18 strict-mode
 * double-invoke, or two `<PalingBanyakDiberitakan />` instances on
 * the same page) share a single network round-trip — the second
 * call gets the same `Promise<StocksTrendingResponse>` back from
 * the `inflightStocksTrending` Map. After resolution, both callers
 * receive the same array.
 *
 * `date` defaults to today via `todayIsoDate()`; `page` and `limit`
 * match the API's own defaults (1 and 20). All three are part of
 * the dedup key — two mounts with different params each get their
 * own fetch.
 *
 * @param date  ISO date string `YYYY-MM-DD` (default today).
 * @param page  1-indexed page number (default 1).
 * @param limit Page size (default 20).
 */
export function useGetStocksTrending(
  date: string = todayIsoDate(),
  page = 1,
  limit = 20,
): {
  data: StockTrendingItem[];
  isLoading: boolean;
  refresh: () => void;
} {
  const [data, setData] = useState<StockTrendingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setData([]);
    setIsLoading(true);

    void loadStocksTrending(date, page, limit)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        // Swallow — the widget renders a graceful empty state on error.
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date, page, limit, refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  return { data, isLoading, refresh };
}

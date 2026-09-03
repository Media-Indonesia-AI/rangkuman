"use client";

import { useCallback, useEffect, useState } from "react";
import { type StockTrendingItem } from "@/lib/api";
import { loadStocksTrending } from "@/lib/api/cache";
import { hariIniIso } from "../util/formatDate";

/**
 * Data hook for the "Paling banyak diberitakan" rail on `/saham`
 * and the `/trending` page. Wraps `loadStocksTrending()` (the
 * request-deduping cache wrapper for `GET stocks/stock/trending`)
 * with React state + a cancel-on-unmount guard.
 *
 * Concurrent mounts of the consumer (e.g. React 18 strict-mode
 * double-invoke, or two `<PalingBanyakDiberitakan />` instances on
 * the same page) share a single network round-trip — the second
 * call gets the same `Promise<StocksTrendingResponse>` back from
 * the inflight Map. After resolution, both callers receive the
 * same array.
 *
 * `date` defaults to today via `hariIniIso()`; `page` and `limit`
 * match the API's own defaults (1 and 20). All three are part of
 * the dedup key — two mounts with different params each get their
 * own fetch.
 *
 * ─── Why the default date is frozen once per mount ──────────────
 *
 * The hook used to declare `date: string = hariIniIso()`. JS
 * evaluates default-parameter expressions **on every call**, not
 * once — so every render produced a fresh ISO string. Under
 * React 18 strict-mode (double-invoke) and HMR fast-refresh the
 * effect's `[date, …]` dep array saw a "changed" date every time
 * and re-fired, leaving `data` permanently empty. The same pattern
 * is used by the bare-mount `effectiveDate` fallback on `/saham`.
 *
 * The freeze applies **only to the auto-generated default**; an
 * explicit `date` prop (e.g. the DatePicker's value on `/saham`)
 * must flow through live so a date pick triggers a refetch.
 *
 * @param date  ISO date string `YYYY-MM-DD` (default today, frozen
 *              once per mount).
 * @param page  1-indexed page number (default 1).
 * @param limit Page size (default 20).
 */
export function useGetStocksTrending(
  date?: string,
  page = 1,
  limit = 20,
): {
  data: StockTrendingItem[];
  isLoading: boolean;
  refresh: () => void;
  /** ISO date (`YYYY-MM-DD`) actually used by the fetch —
   *  frozen once per mount via `useState(() => hariIniIso())`,
   *  or the explicit `date` prop when the caller supplied one.
   *  Consumers that need to attach it to per-row GA4 events
   *  (e.g. trending item click) should read this instead of
   *  recomputing today locally — the hook's freeze keeps it
   *  stable across re-renders. */
  effectiveDate: string;
} {
  // Freeze the *default* only — `useState(() => hariIniIso())`
  // runs once at mount. An explicit `date` prop is used as-is so
  // the caller (DatePicker) can drive refetches.
  const [defaultDate] = useState(() => hariIniIso());
  const effectiveDate = date ?? defaultDate;

  const [data, setData] = useState<StockTrendingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setData([]);
    setIsLoading(true);

    void loadStocksTrending(effectiveDate, page, limit)
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
  }, [effectiveDate, page, limit, refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  return { data, isLoading, refresh, effectiveDate };
}

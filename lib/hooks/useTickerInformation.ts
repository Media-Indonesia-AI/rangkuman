"use client";

import { useEffect, useState } from "react";
import type { TickerInformation } from "@/lib/api";
import { loadTickerInformation } from "@/lib/api/cache";
import { todayIsoDate } from "../api/client";
import { hariIniIso } from "../util/formatDate";

/**
 * Data hook for `GET stocks/ticker-information/{ticker}`.
 *
 * Wraps `loadTickerInformation()` (the per-ticker request-deduping
 * cache wrapper) with React state + a cancel-on-unmount guard. Two
 * mounts of the same (ticker, date) pair share one network round-trip
 * via the cache module's `inflight` Map; switching either the ticker
 * or the recap day triggers a fresh fetch.
 *
 * State resets on every `ticker` *or* `date` change so the widget
 * never renders stale data from a previous pair while the new fetch
 * is in flight — important on `/stock/[kode]/[recapDate]` where the
 * date picker navigates between recap days in place. The ticker-only
 * reset is enough for `/stock/[kode]` → `/stock/[kode]`; the
 * date-aware reset is needed for `/stock/X/2026-07-30` →
 * `/stock/X/2026-07-29`.
 *
 * On error the hook returns `data: null` so consumers can fall
 * back to their placeholder rendering without an extra null check
 * beyond the existing "data is loading" path. `isLoading` flips
 * to `false` once the fetch settles either way.
 *
 * @param ticker  Ticker code, e.g. `"ANTM"`. Uppercased inside
 *                `loadTickerInformation`, so callers can pass any
 *                case.
 * @param date    ISO date (`YYYY-MM-DD`) for the recap day to
 *                fetch. Defaults to `todayIsoDate()` so callers
 *                without a recap date segment in the URL still
 *                land on today's snapshot. Callers that have a
 *                date segment pass it through verbatim.
 */
export function useTickerInformation(
  ticker: string,
  date: string = hariIniIso(),
): { data: TickerInformation | null; isLoading: boolean } {
  const [data, setData] = useState<TickerInformation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Reset on either dep change so a fast ticker *or* date switch
    // doesn't briefly show the previous pair's data alongside the
    // new loading state. Without this, on `/stock/X/2026-07-30`
    // → `/stock/X/2026-07-29` the panel would keep rendering
    // `2026-07-30`'s payload while `2026-07-29` is in flight.
    setData(null);
    setIsLoading(true);

    void loadTickerInformation(ticker, date)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        // Swallow — widget renders its graceful placeholder; `data`
        // stays `null` and the consumer treats that the same as
        // "still loading".
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ticker, date]);

  return { data, isLoading };
}

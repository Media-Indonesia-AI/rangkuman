"use client";

import { useEffect, useState } from "react";
import { type TickerItem } from "@/lib/api";
import { loadTickers, peekTickers } from "@/lib/api/cache";

/**
 * Data hook for `GET stocks/ticker`.
 *
 * Wraps `loadTickers()` (the request-deduping cache wrapper) with
 * React state. Initial state is seeded from `peekTickers()` so a
 * remount after another instance has already fetched renders with
 * the data on first paint instead of flashing an empty ticker.
 *
 * Errors are swallowed — the consumer (e.g. `<TopTicker />`) keeps
 * its mock-catalog fallback for any failure path (auth, network,
 * server error, malformed response). The hook surface stays
 * minimal: an array, empty while loading or after an error.
 */
export function useTickers(): TickerItem[] {
  const [data, setData] = useState<TickerItem[]>(
    () => peekTickers()?.data ?? [],
  );

  useEffect(() => {
    let cancelled = false;
    void loadTickers()
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        // Swallow — the consumer's mock fallback owns the empty case.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}

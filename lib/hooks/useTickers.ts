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
 * the data on first paint instead of flashing an empty ticker;
 * `isLoading` follows the same peek — it starts `false` once the
 * cache is warm.
 *
 * Both `isLoading` and the resolved `data` settle after the first
 * response — success or failure — so callers can use the flag to
 * gate a reveal animation (see `<TopTicker />` for the canonical
 * "hide while loading, fade-up on success" pattern). A stuck
 * loading state would otherwise block the widget from ever
 * appearing; the `.finally` clears it regardless of outcome.
 *
 * Errors are swallowed — the consumer (e.g. `<TopTicker />`) keeps
 * its mock-catalog fallback for the empty-data path. The hook
 * surface stays minimal: a `{ data, isLoading }` tuple — empty
 * array + `isLoading: false` while offline.
 */
export function useTickers(): { data: TickerItem[]; isLoading: boolean } {
  const cached = peekTickers();
  const [data, setData] = useState<TickerItem[]>(cached?.data ?? []);
  const [isLoading, setIsLoading] = useState<boolean>(cached === null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    void loadTickers()
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        // Swallow — the consumer owns the empty case.
      })
      .finally(() => {
        // Always clear the loading flag, success or failure,
        // so the widget isn't gated forever on a stuck request.
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading };
}

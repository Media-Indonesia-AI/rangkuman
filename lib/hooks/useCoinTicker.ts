"use client";

import { useEffect, useState } from "react";
import { type CoinTickerItem } from "@/lib/api";
import { loadCoinTicker, peekCoinTicker } from "@/lib/api/cache";

/**
 * Data hook for `GET coin/ticker/`.
 *
 * Wraps `loadCoinTicker(limit)` (the limit-keyed request-deduping
 * cache wrapper) with React state. Initial state is seeded from
 * `peekCoinTicker(limit)` so a remount after another instance has
 * already fetched renders with the data on first paint instead of
 * flashing empty; `isLoading` follows the same peek — it starts
 * `false` once the cache is warm.
 *
 * Both `isLoading` and the resolved `data` settle after the first
 * response — success or failure — so callers can use the flag to
 * gate a reveal animation (see `<TopTicker />` for the canonical
 * "hide while loading, fade-up on success" pattern). A stuck
 * loading state would otherwise block the widget from ever
 * appearing; the `.finally` clears it regardless of outcome.
 *
 * Errors are swallowed — the hook surface stays minimal: a
 * `{ data, isLoading }` tuple, empty array + `isLoading: false`
 * after a failed fetch. There is no mock fallback on the crypto
 * side after the `lib/mock/crypto` cleanup — the cache wrapper
 * does the offline-tolerance job.
 *
 * @param limit Page size forwarded to `getCoinTicker` (default 30).
 */
export function useCoinTicker(
  limit = 30,
): { data: CoinTickerItem[]; isLoading: boolean } {
  const cached = peekCoinTicker(limit);
  const [data, setData] = useState<CoinTickerItem[]>(cached ?? []);
  const [isLoading, setIsLoading] = useState<boolean>(cached === null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    void loadCoinTicker(limit)
      .then((res) => {
        if (!cancelled) setData(res);
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
  }, [limit]);

  return { data, isLoading };
}

"use client";

import { useEffect, useState } from "react";
import { type CoinTickerItem } from "@/lib/api";
import { loadCoinTicker, peekCoinTicker } from "@/lib/api/cache";

/**
 * Data hook for `GET coin/ticker/`.
 *
 * Wraps `loadCoinTicker(limit)` (the request-deduping cache wrapper)
 * with React state. Initial state is seeded from `peekCoinTicker()`
 * so a remount after another instance has already fetched renders
 * with the data on first paint instead of flashing empty.
 *
 * Errors are swallowed — the hook surface stays minimal: an array,
 * empty while loading or after an error. The crypto branch in
 * `<TopTicker />` renders nothing in the empty case (no mock fallback
 * after the `lib/mock/crypto` cleanup).
 *
 * Dedup rationale: under React 18 StrictMode the effect runs
 * mount → unmount → mount, and without a cache wrapper each
 * invocation fired a fresh `api.getCoinTicker` request. The
 * limit-keyed cache now collapses concurrent / StrictMode
 * double-mounts onto a single network round-trip per limit,
 * matching the pattern established by `loadTickers` /
 * `loadCoinTopTickers`.
 *
 * @param limit Page size forwarded to `getCoinTicker` (default 30).
 */
export function useCoinTicker(limit = 30): CoinTickerItem[] {
  const [data, setData] = useState<CoinTickerItem[]>(
    () => peekCoinTicker(limit) ?? [],
  );

  useEffect(() => {
    let cancelled = false;
    void loadCoinTicker(limit)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        // Swallow — the consumer owns the empty case.
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return data;
}

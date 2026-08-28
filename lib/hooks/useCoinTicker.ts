"use client";

import { useEffect, useState } from "react";
import { api, type CoinTickerItem } from "@/lib/api";

/**
 * Data hook for `GET coin/ticker/`.
 *
 * Wraps `api.getCoinTicker(limit)` with React state and a
 * cancel-on-unmount guard. The hook surface stays minimal — an
 * array, empty while loading or after an error — so consumers can
 * fall back to their own mock catalog without extra null checks.
 *
 * The endpoint isn't wrapped in a request-dedup cache module yet
 * (only `loadTickers` is), so this hook goes straight through
 * `api.getCoinTicker`. Concurrent mounts will each issue their
 * own request — fine for the current TopTicker use case, can be
 * promoted to a cache wrapper later if multiple subscribers start
 * hitting the endpoint on the same render path.
 *
 * @param limit Page size forwarded to `getCoinTicker` (default 30).
 */
export function useCoinTicker(limit = 30): CoinTickerItem[] {
  const [data, setData] = useState<CoinTickerItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    void api
      .getCoinTicker(limit)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        // Swallow — the consumer's mock fallback owns the empty case.
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return data;
}

"use client";

/**
 * Row-resolution hook for `TopTicker`.
 *
 * Lives in its own hook so the orchestrator stays focused on
 * wiring data → component and the hydration-safe shuffle has a
 * single owner.
 *
 * The shuffle deserves a comment: the initial paint must be
 * **deterministic** so React's server-rendered HTML and the
 * client's first render agree — a non-deterministic first paint
 * triggers a hydration mismatch warning. The lazy initializer
 * runs once at mount with the same inputs on the server and the
 * client (mock fallback until the live `useEffect` resolves), so
 * both see the same concat. After mount, when live data lands or
 * the label changes, the effect re-shuffles on the client only.
 */
import { useEffect, useMemo, useState } from "react";
import { useTickers } from "@/lib/hooks/useTickers";
import { useCoinTicker } from "@/lib/hooks/useCoinTicker";
import type { TickerRow } from "./types";
import {
  COMBINED_RANDOM_LIMIT,
  coinTickerToEntry,
  mockCoinRows,
  mockStockRows,
  shuffle,
  tickerToEntry,
} from "./tickerData";

/**
 * Returns the row set the visitor actually sees, after picking the
 * branch (`saham` / `crypto` / combined) and applying the
 * hydration-safe shuffle.
 *
 * @param effectiveLabel Resolved label: `"saham"` / `"crypto"` /
 *                       anything else (including `undefined`)
 *                       routes to the combined branch.
 */
export function useTopTickerRows(effectiveLabel: string | undefined): TickerRow[] {
  // Both feed hooks are called unconditionally so the combined
  // branch has both lists ready when the user lands on a
  // non-specific label.
  const apiStocks = useTickers();
  const apiCoins = useCoinTicker();

  // Memoize the resolved source so the downstream shuffle
  // doesn't fire on every parent re-render — `apiStocks.map(...)`
  // produces a fresh array each call.
  const stockSource: TickerRow[] = useMemo(
    () =>
      apiStocks.length > 0 ? apiStocks.map(tickerToEntry) : mockStockRows,
    [apiStocks],
  );

  const cryptoSource: TickerRow[] = useMemo(
    () => (apiCoins.length > 0 ? apiCoins.map(coinTickerToEntry) : mockCoinRows),
    [apiCoins],
  );

  // Initial state is a deterministic concat (no `Math.random()`) —
  // the lazy initializer runs exactly once at mount, with the same
  // inputs on the server and the client's first render, so both
  // agree on the first paint (avoids the React hydration mismatch
  // that a non-deterministic shuffle would cause).
  const [rows, setRows] = useState<TickerRow[]>(() => {
    if (effectiveLabel === "saham") return stockSource;
    if (effectiveLabel === "crypto") return cryptoSource;
    return [
      ...stockSource.slice(0, COMBINED_RANDOM_LIMIT),
      ...cryptoSource.slice(0, COMBINED_RANDOM_LIMIT),
    ];
  });

  // Post-mount shuffle — only runs on the client, so the
  // server-rendered HTML stays in sync with the client's first
  // render. When the source feeds update (live data lands, label
  // changes) we recompute from the new sources and re-shuffle the
  // combined branch.
  useEffect(() => {
    if (effectiveLabel === "saham") {
      setRows(stockSource);
      return;
    }
    if (effectiveLabel === "crypto") {
      setRows(cryptoSource);
      return;
    }
    const stockPick = shuffle(stockSource).slice(0, COMBINED_RANDOM_LIMIT);
    const cryptoPick = shuffle(cryptoSource).slice(0, COMBINED_RANDOM_LIMIT);
    setRows(shuffle([...stockPick, ...cryptoPick]));
  }, [effectiveLabel, stockSource, cryptoSource]);

  return rows;
}

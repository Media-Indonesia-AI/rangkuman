"use client";

/**
 * Row-resolution hook for `TopTicker`.
 *
 * Lives in its own hook so the orchestrator stays focused on
 * wiring data → component and the branch-dispatch logic has a
 * single owner.
 *
 * Branch behavior:
 *   - `"saham"`           → every row in `stockSource`.
 *   - `"crypto"`          → every row in `cryptoSource`.
 *   - anything else       → first 10 of each side, then merged
 *                           into a single list via Fisher–Yates
 *                           shuffle so the marquee shows stocks
 *                           and crypto interleaved rather than
 *                           "stocks then crypto".
 *
 * Both source feeds expose their own `{ data, isLoading }` shape
 * (see `useTickers` / `useCoinTicker`). The `isLoading` flag this
 * hook surfaces is the OR across whichever feeds the active branch
 * actually consumes — the orchestrator renders nothing while any
 * required feed is in flight, and reveals the populated marquee
 * with an `animate-fade-up` keyframe once they all settle. The
 * mock catalog remains the fallback for the empty-success case
 * (a 200 with no rows) so the stocks branch never collapses to a
 * blank strip after a successful fetch.
 *
 * Per-source slice keeps the wire order untouched; the shuffle
 * runs only on the cross-list merge. The shuffle is also
 * delayed to a `useEffect` so the lazy initializer produces a
 * deterministic first paint that matches the server HTML (no
 * hydration mismatch).
 */
import { useEffect, useMemo, useState } from "react";
import { useTickers } from "@/lib/hooks/useTickers";
import { useCoinTicker } from "@/lib/hooks/useCoinTicker";
import type { TickerRow } from "./types";
import {
  TOP_N_PER_SIDE,
  coinTickerToEntry,
  mockStockRows,
  shuffle,
  tickerToEntry,
} from "./tickerData";

/**
 * Returns the row set the visitor actually sees plus a loading
 * flag the orchestrator reads to hide the widget during the
 * network round-trip and trigger the reveal animation on success.
 *
 * @param effectiveLabel Resolved label: `"saham"` / `"crypto"` /
 *                       anything else (including `undefined`)
 *                       routes to the combined branch.
 */
export function useTopTickerRows(effectiveLabel: string | undefined): {
  rows: TickerRow[];
  isLoading: boolean;
} {
  // Both feed hooks are called unconditionally so the combined
  // branch has both lists ready when the user lands on a
  // non-specific label. Each returns its own `{ data, isLoading }`
  // — we collapse them to the unified `{ rows, isLoading }` shape
  // the orchestrator consumes.
  const { data: apiStocks, isLoading: stocksLoading } = useTickers();
  const { data: apiCoins, isLoading: coinsLoading } = useCoinTicker();

  // Memoize the resolved source so the downstream slice doesn't
  // churn on every parent re-render — `apiStocks.map(...)`
  // produces a fresh array each call. Mock fallback only kicks in
  // when the live feed is empty *after* it has loaded — the
  // orchestrator's loading gate hides the widget earlier, so the
  // mock never flashes during the in-flight phase.
  const stockSource: TickerRow[] = useMemo(
    () =>
      apiStocks.length > 0 ? apiStocks.map(tickerToEntry) : mockStockRows,
    [apiStocks],
  );

  // Crypto branch: no mock fallback now that `lib/mock/crypto`
  // is gone — the marquee renders nothing while the backend
  // load is in flight (or after an error), matching the
  // backend-first contract every other widget already follows.
  const cryptoSource: TickerRow[] = useMemo(
    () => apiCoins.map(coinTickerToEntry),
    [apiCoins],
  );

  // Lazy initializer stays deterministic (plain slice + concat,
  // no `Math.random()`) so the server render and the client's
  // first render agree on the same first paint. The cross-list
  // shuffle fires post-mount only — see the effect below.
  const [rows, setRows] = useState<TickerRow[]>(() => {
    if (effectiveLabel === "saham") return stockSource;
    if (effectiveLabel === "crypto") return cryptoSource;
    return [
      ...stockSource.slice(0, TOP_N_PER_SIDE),
      ...cryptoSource.slice(0, TOP_N_PER_SIDE),
    ];
  });

  useEffect(() => {
    if (effectiveLabel === "saham") {
      setRows(stockSource);
      return;
    }
    if (effectiveLabel === "crypto") {
      setRows(cryptoSource);
      return;
    }
    // Combined branch: take the top-N per side (slice keeps each
    // source's own order), then Fisher–Yates the merged list so
    // stocks and crypto interleave on screen.
    setRows(
      shuffle([
        ...stockSource.slice(0, TOP_N_PER_SIDE),
        ...cryptoSource.slice(0, TOP_N_PER_SIDE),
      ]),
    );
  }, [effectiveLabel, stockSource, cryptoSource]);

  // Loading gate is `OR` across whichever feeds the active branch
  // actually consumes — a `"saham"` branch doesn't gate on the
  // crypto feed (and vice versa) so the widget can reveal once
  // the stock ticker has responded even if the coin ticker is
  // still pending or has errored.
  const isLoading =
    effectiveLabel === "crypto"
      ? coinsLoading
      : effectiveLabel === "saham"
        ? stocksLoading
        : stocksLoading || coinsLoading;

  return { rows, isLoading };
}

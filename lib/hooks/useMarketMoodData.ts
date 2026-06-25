"use client";

import { useEffect, useState } from "react";
import type {
  CompositeChartPoint,
  ExchangeRate,
  ForeignStocksResponse,
  InterestRate,
} from "@/lib/api";
import {
  loadCompositeChart,
  loadExchangeRate,
  loadForeignStocks,
  loadInterestRate,
} from "@/lib/api/cache";

/**
 * Loading-flag bundle for the four live data sources.
 * A flag is `true` only during the strict in-flight window between
 * mount and first response (success or error). It's `false` while
 * the data is still null after a fetch error, so consumers should
 * check the data itself for the "have we got anything yet" signal
 * and use this flag purely for shimmer / spinner UX.
 */
export interface LoadingFlags {
  biRate: boolean;
  exchangeRate: boolean;
  foreignFlow: boolean;
  compositeChart: boolean;
}

export interface UseMarketMoodDataResult {
  biRate: InterestRate | null;
  exchangeRate: ExchangeRate | null;
  foreignFlow: ForeignStocksResponse | null;
  compositeChart: CompositeChartPoint[] | null;
  /** Per-source loading flags. `true` while the matching fetch is in
   *  flight, `false` once the fetch has settled (success or error). */
  isLoading: LoadingFlags;
}

/**
 * Centralized data fetching for the four live data sources that
 * drive the Market Mood strip:
 *
 *   - `loadInterestRate`  → `biRate`
 *   - `loadExchangeRate`  → `exchangeRate`
 *   - `loadForeignStocks` → `foreignFlow`
 *   - `loadCompositeChart` → `compositeChart`
 *
 * All four are deduped via [lib/api/cache.ts] so concurrent mounts
 * share one round-trip per (date, base, range) tuple. The matching
 * `isLoading.*` flag is flipped to `false` once the promise settles,
 * success or error — that's the shimmer window the render layer cares
 * about.
 *
 * The single `useEffect` cancels in-flight resolvers on unmount via
 * the standard `cancelled` flag pattern, so a remounted component
 * can't set state on a torn-down instance.
 *
 * Adding a fifth data source: add one `useState` pair, one `.then`
 * branch, one `.catch` branch. No new mental model.
 */
export function useMarketMoodData(): UseMarketMoodDataResult {
  const [biRate, setBiRate] = useState<InterestRate | null>(null);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [foreignFlow, setForeignFlow] = useState<ForeignStocksResponse | null>(
    null,
  );
  const [compositeChart, setCompositeChart] = useState<
    CompositeChartPoint[] | null
  >(null);

  // Start true — every cell flashes shimmer until its first response.
  const [isBiRateLoading, setIsBiRateLoading] = useState(true);
  const [isExchangeRateLoading, setIsExchangeRateLoading] = useState(true);
  const [isForeignFlowLoading, setIsForeignFlowLoading] = useState(true);
  const [isIHSGLoading, setIsIHSGLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void loadInterestRate()
      .then((data) => {
        if (!cancelled) {
          setBiRate(data);
          setIsBiRateLoading(false);
        }
      })
      .catch(() => {
        // Mock bi-rate widget stays put as the fallback.
        if (!cancelled) setIsBiRateLoading(false);
      });

    void loadExchangeRate()
      .then((res) => {
        // Response is wrapped in `{ data: [snapshot] }`; the snapshot is
        // a single object keyed by currency code.
        const snapshot = res.data[0];
        if (!cancelled) {
          setExchangeRate(snapshot ?? null);
          setIsExchangeRateLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsExchangeRateLoading(false);
      });

    void loadForeignStocks()
      .then((data) => {
        if (!cancelled) {
          setForeignFlow(data);
          setIsForeignFlowLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsForeignFlowLoading(false);
      });

    void loadCompositeChart()
      .then((data) => {
        if (!cancelled) {
          setCompositeChart(data);
          setIsIHSGLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsIHSGLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    biRate,
    exchangeRate,
    foreignFlow,
    compositeChart,
    isLoading: {
      biRate: isBiRateLoading,
      exchangeRate: isExchangeRateLoading,
      foreignFlow: isForeignFlowLoading,
      compositeChart: isIHSGLoading,
    },
  };
}
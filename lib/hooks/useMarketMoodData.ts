"use client";

import { useEffect, useState } from "react";
import type {
  CompositeChartPoint,
  ExchangeRateChartResponse,
  ForeignStocksResponse,
  InterestRate,
  MarketMood,
} from "@/lib/api";
import {
  loadCompositeChart,
  loadExchangeRate,
  loadForeignStocks,
  loadInterestRate,
  loadMarketMood,
} from "@/lib/api/cache";

/**
 * Loading-flag bundle for the live data sources.
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
  mood: boolean;
}

export interface UseMarketMoodDataResult {
  biRate: InterestRate | null;
  exchangeRate: ExchangeRateChartResponse | null;
  foreignFlow: ForeignStocksResponse | null;
  /** Effective date the foreign-flow payload actually represents —
   *  may differ from the caller's requested date when the cache
   *  wrapper walked back a day on a 503 response. `null` while the
   *  fetch is in flight or after a failed fetch (no successful
   *  response → no effective date to surface). The Market Mood
   *  strip uses this to label the Foreign Flow widget so the
   *  shown date matches the data, not just the request. */
  foreignFlowDate: string | null;
  compositeChart: CompositeChartPoint[] | null;
  /** Composite market-mood snapshot (score, label, narrative, and the
   *  aggregated market data behind it). `null` while in flight or on
   *  a failed fetch — same shape as the granular sources above. */
  mood: MarketMood | null;
  /** Per-source loading flags. `true` while the matching fetch is in
   *  flight, `false` once the fetch has settled (success or error). */
  isLoading: LoadingFlags;
}

/**
 * Centralized data fetching for the live data sources that drive the
 * Market Mood strip:
 *
 *   - `loadInterestRate`  → `biRate`
 *   - `loadExchangeRate`  → `exchangeRate`
 *   - `loadForeignStocks` → `foreignFlow`
 *   - `loadCompositeChart` → `compositeChart`
 *   - `loadMarketMood`    → `mood` (composite snapshot — score, label,
 *                                       narrative, and aggregated
 *                                       market data)
 *
 * All five are deduped via [lib/api/cache] so concurrent mounts share
 * one round-trip per (date, base, range) tuple. The matching
 * `isLoading.*` flag is flipped to `false` once the promise settles,
 * success or error — that's the shimmer window the render layer cares
 * about.
 *
 * The single `useEffect` cancels in-flight resolvers on unmount via
 * the standard `cancelled` flag pattern, so a remounted component
 * can't set state on a torn-down instance.
 */
export function useMarketMoodData(): UseMarketMoodDataResult {
  const [biRate, setBiRate] = useState<InterestRate | null>(null);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateChartResponse | null>(
    null,
  );
  const [foreignFlow, setForeignFlow] = useState<ForeignStocksResponse | null>(
    null,
  );
  const [foreignFlowDate, setForeignFlowDate] = useState<string | null>(null);
  const [compositeChart, setCompositeChart] = useState<
    CompositeChartPoint[] | null
  >(null);
  const [mood, setMood] = useState<MarketMood | null>(null);

  // Start true — every cell flashes shimmer until its first response.
  const [isBiRateLoading, setIsBiRateLoading] = useState(true);
  const [isExchangeRateLoading, setIsExchangeRateLoading] = useState(true);
  const [isForeignFlowLoading, setIsForeignFlowLoading] = useState(true);
  const [isIHSGLoading, setIsIHSGLoading] = useState(true);
  const [isMoodLoading, setIsMoodLoading] = useState(true);

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
      .then((data) => {
        // Response is wrapped in `{ data: [{ date, rate }, ...] }`.
        // mergeUsdIdr reads `res.data` and uses the last point for the
        // live value and the full list for the sparkline.
        if (!cancelled) {
          setExchangeRate(data);
          setIsExchangeRateLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsExchangeRateLoading(false);
      });

    void loadForeignStocks()
      .then(({ data, effectiveDate }) => {
        if (!cancelled) {
          setForeignFlow(data);
          setForeignFlowDate(effectiveDate);
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

    void loadMarketMood()
      .then((data) => {
        if (!cancelled) {
          setMood(data);
          setIsMoodLoading(false);
        }
      })
      .catch(() => {
        // Silent — the strip falls back to the prop-driven label/summary.
        if (!cancelled) setIsMoodLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    biRate,
    exchangeRate,
    foreignFlow,
    foreignFlowDate,
    compositeChart,
    mood,
    isLoading: {
      biRate: isBiRateLoading,
      exchangeRate: isExchangeRateLoading,
      foreignFlow: isForeignFlowLoading,
      compositeChart: isIHSGLoading,
      mood: isMoodLoading,
    },
  };
}

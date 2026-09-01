"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiError, CoinHistoricalPoint } from "@/lib/api";
import { loadCoinHistorical } from "@/lib/api/cache";

/**
 * Load state for `useCoinHistorical`. A discriminated union
 * so consumers can render loading / ready / error without
 * extra null checks. The `status` on the error branch lets
 * callers special-case `401` (endpoint requires auth) vs. a
 * real failure — same shape `useCoinCategories` uses for the
 * other coin-domain hook.
 */
export type CoinHistoricalState =
  | { kind: "loading" }
  | {
      kind: "ready";
      /** The time-series points returned for this
       *  (ticker, period) — already sorted chronologically by
       *  the backend. */
      points: CoinHistoricalPoint[];
    }
  | { kind: "error"; message: string; status?: number };

/**
 * Data hook for `GET coin/{ticker}/historical/?period=...`.
 *
 * Wraps `loadCoinHistorical(ticker, period)` (the
 * `${ticker}|${period}` keyed request-deduping cache wrapper)
 * with React state. Two mounts of the same pair share one
 * network round-trip via the cache module's `inflight` Map;
 * changing either param triggers a fresh fetch and resets the
 * hook state so the chart never flashes the previous series
 * while the new one loads.
 *
 * A monotonically increasing run id guards against a stale
 * in-flight response overwriting state from a newer fetch
 * (param change, retry) or landing after unmount.
 *
 * Errors are surfaced (not swallowed) so the section can show
 * a retry affordance; `refetch` re-runs the request on demand.
 *
 * @param ticker  Wire ticker code (e.g. `"btc"`). Lowercased
 *                inside `loadCoinHistorical`, so callers can
 *                pass any case.
 * @param period  Time-window code (default `"1D"`).
 */
export function useCoinHistorical(
  ticker: string,
  period = "1D",
): {
  state: CoinHistoricalState;
  refetch: () => void;
} {
  const [state, setState] = useState<CoinHistoricalState>({
    kind: "loading",
  });
  const runIdRef = useRef(0);

  const fetchOnce = useCallback(() => {
    const runId = ++runIdRef.current;
    setState({ kind: "loading" });
    void loadCoinHistorical(ticker, period)
      .then((res) => {
        if (runId !== runIdRef.current) return;
        setState({ kind: "ready", points: res });
      })
      .catch((err) => {
        if (runId !== runIdRef.current) return;
        const apiErr = err as ApiError;
        setState({
          kind: "error",
          message: apiErr?.message ?? "",
          status: apiErr?.status,
        });
      });
  }, [ticker, period]);

  // Refetch on mount and whenever the (ticker, period) pair
  // changes (different key → must re-issue). Invalidate any
  // in-flight response on unmount / re-run.
  useEffect(() => {
    fetchOnce();
    return () => {
      runIdRef.current++;
    };
  }, [fetchOnce]);

  return { state, refetch: fetchOnce };
}

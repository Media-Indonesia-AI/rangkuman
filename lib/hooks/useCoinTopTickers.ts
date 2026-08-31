"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiError, CoinTickerItem } from "@/lib/api";
import { loadCoinTopTickers } from "@/lib/api/cache";
import { useCurrentUser } from "@/lib/hooks/useAuth";

/**
 * Load state for `useCoinTopTickers`. A discriminated union so
 * consumers can render loading / ready / error without extra null
 * checks. The `status` on the error branch lets callers
 * special-case `401` (endpoint requires auth) vs. a real failure.
 */
export type CoinTopTickersState =
  | { kind: "loading" }
  | {
      kind: "ready";
      /** Coins with the biggest positive 24h change. */
      gainers: CoinTickerItem[];
      /** Coins with the biggest negative 24h change. */
      losers: CoinTickerItem[];
    }
  | { kind: "error"; message: string; status?: number };

/**
 * Data hook for `GET coin/top-tickers`.
 *
 * Wraps `loadCoinTopTickers(limit)` (the limit-keyed request-deduping
 * cache wrapper) with React state and refetches whenever the user
 * logs in / out — the endpoint is auth-gated, so a login should
 * surface the real list where a logged-out mount saw a `401`.
 *
 * The response is split by the `type` discriminator on each group
 * (`"top-gainer"` / `"top-looser"`) into the typed `gainers` /
 * `losers` fields so consumers don't repeat the lookup. Either
 * group may be empty on a quiet session, but the group itself is
 * always present.
 *
 * A monotonically increasing run id guards against a stale in-flight
 * response overwriting state from a newer fetch (limit change,
 * retry, login) or landing after unmount.
 *
 * Errors are surfaced (not swallowed) so the section can show a
 * retry affordance; `refetch` re-runs the request on demand.
 *
 * @param limit How many coins per group to request (default 6 —
 *              matches `getCoinTopTickers`'s default).
 */
export function useCoinTopTickers(limit = 6): {
  state: CoinTopTickersState;
  refetch: () => void;
} {
  const user = useCurrentUser();
  const [state, setState] = useState<CoinTopTickersState>({ kind: "loading" });
  const runIdRef = useRef(0);

  const fetchOnce = useCallback(() => {
    const runId = ++runIdRef.current;
    setState({ kind: "loading" });
    void loadCoinTopTickers(limit)
      .then((res) => {
        if (runId !== runIdRef.current) return;
        const gainers =
          res.data.find((g) => g.type === "top-gainer")?.coins ?? [];
        const losers =
          res.data.find((g) => g.type === "top-looser")?.coins ?? [];
        setState({ kind: "ready", gainers, losers });
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
  }, [limit]);

  // Refetch on mount and whenever the user logs in / out.
  useEffect(() => {
    fetchOnce();
    // Invalidate any in-flight response on unmount / re-run.
    return () => {
      runIdRef.current++;
    };
  }, [user, fetchOnce]);

  return { state, refetch: fetchOnce };
}

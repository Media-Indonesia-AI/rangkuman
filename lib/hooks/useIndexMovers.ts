"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type ApiError, type IndexMoverItem } from "@/lib/api";
import { loadIndexMover } from "@/lib/api/cache";
import { useCurrentUser } from "@/lib/hooks/useAuth";

/**
 * Load state for `useIndexMovers`. A discriminated union so consumers
 * can render loading / ready / error without extra null checks. The
 * `status` on the error branch lets callers special-case `401`
 * (endpoint requires auth) vs. a real failure.
 */
export type IndexMoversState =
  | { kind: "loading" }
  | {
      kind: "ready";
      /** Stocks whose index contribution is positive (top side). */
      leading: IndexMoverItem[];
      /** Stocks whose index contribution is negative (bottom side). */
      lagging: IndexMoverItem[];
    }
  | { kind: "error"; message: string; status?: number };

/**
 * Data hook for `GET stocks/index-mover`.
 *
 * Wraps `loadIndexMover(limit)` (the limit-keyed request-deduping cache
 * wrapper) with React state and refetches whenever the user logs in /
 * out — the endpoint is auth-gated, so a login should surface the real
 * list where a logged-out mount saw a `401`.
 *
 * A monotonically increasing run id guards against a stale in-flight
 * response overwriting state from a newer fetch (limit change, retry,
 * login) or landing after unmount.
 *
 * Errors are surfaced (not swallowed) so the strip can show a retry
 * affordance; `refetch` re-runs the request on demand.
 *
 * @param limit How many movers to request (default 6).
 */
export function useIndexMovers(limit = 6): {
  state: IndexMoversState;
  refetch: () => void;
} {
  const user = useCurrentUser();
  const [state, setState] = useState<IndexMoversState>({ kind: "loading" });
  const runIdRef = useRef(0);

  const fetchOnce = useCallback(() => {
    const runId = ++runIdRef.current;
    setState({ kind: "loading" });
    void loadIndexMover(limit)
      .then((res) => {
        if (runId === runIdRef.current) {
          setState({
            kind: "ready",
            leading: res.leading,
            lagging: res.lagging,
          });
        }
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

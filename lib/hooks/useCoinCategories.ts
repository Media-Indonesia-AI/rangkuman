"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiError, CoinCategory } from "@/lib/api";
import { loadCoinCategories } from "@/lib/api/cache";
import { useCurrentUser } from "@/lib/hooks/useAuth";

/**
 * Load state for `useCoinCategories`. A discriminated union so
 * consumers can render loading / ready / error without extra null
 * checks.
 *
 * Every variant carries the `skip` the fetch was issued for. The
 * hook's `state` lags behind a `skip` change until its own fetch
 * settles — during that window it keeps returning the previous
 * page's data. Without the `skip` tag a "load more" consumer can't
 * tell a stale page from a fresh one and would happily re-apply
 * the previous page's rows to the new page (or, with the dedupe
 * guard we use, skip the new page entirely). Tagging the state
 * with `skip` lets consumers short-circuit on the stale window.
 */
export type CoinCategoriesState =
  | { kind: "loading"; skip: number }
  | {
      kind: "ready";
      skip: number;
      /** The page of categories returned for this `limit` / `skip`. */
      categories: CoinCategory[];
    }
  | { kind: "error"; skip: number; message: string; status?: number };

/**
 * Data hook for `GET coin-category`.
 *
 * Wraps `loadCoinCategories(limit, skip)` (the `${limit}-${skip}`
 * keyed request-deduping cache wrapper) with React state and
 * refetches whenever the user logs in / out — the endpoint is
 * auth-gated, so a login should surface the real list where a
 * logged-out mount saw a `401`.
 *
 * A monotonically increasing run id guards against a stale
 * in-flight response overwriting state from a newer fetch (page
 * change, retry, login) or landing after unmount.
 *
 * Errors are surfaced (not swallowed) so the section can show a
 * retry affordance; `refetch` re-runs the request on demand.
 *
 * @param limit Page size — how many categories per request
 *              (default 10, matches `getCoinCategories`'s default).
 * @param skip  Offset into the category list (default 0 — first page).
 */
export function useCoinCategories(limit = 10, skip = 0): {
  state: CoinCategoriesState;
  refetch: () => void;
} {
  const user = useCurrentUser();
  const [state, setState] = useState<CoinCategoriesState>({
    kind: "loading",
    skip,
  });
  const runIdRef = useRef(0);

  const fetchOnce = useCallback(() => {
    const runId = ++runIdRef.current;
    setState({ kind: "loading", skip });
    void loadCoinCategories(limit, skip)
      .then((res) => {
        if (runId !== runIdRef.current) return;
        setState({ kind: "ready", skip, categories: res.data });
      })
      .catch((err) => {
        if (runId !== runIdRef.current) return;
        const apiErr = err as ApiError;
        setState({
          kind: "error",
          skip,
          message: apiErr?.message ?? "",
          status: apiErr?.status,
        });
      });
  }, [limit, skip]);

  // Refetch on mount and whenever the user logs in / out, or the
  // page parameters change (different limit / skip → different cache
  // key → must re-issue).
  useEffect(() => {
    fetchOnce();
    // Invalidate any in-flight response on unmount / re-run.
    return () => {
      runIdRef.current++;
    };
  }, [user, fetchOnce]);

  return { state, refetch: fetchOnce };
}

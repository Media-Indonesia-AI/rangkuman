"use client";

import { useEffect, useState } from "react";
import { api, type ApiError, type StockSearchItem } from "@/lib/api";

interface UseStocksSearchResult {
  data: StockSearchItem[];
  isLoading: boolean;
  error: Error | null;
  /** HTTP status from the failing response, when the failure
   *  came from the API (vs. a thrown JS exception). Callers
   *  can use this to special-case auth-gated errors (e.g.
   *  `401` → surface a login prompt). */
  status?: number;
}

/** Default message when the transport throws an error without
 *  one of its own. Kept here so the wire-shape strings aren't
 *  scattered across consumer components. */
const FALLBACK_ERROR_MESSAGE = "Gagal mencari saham. Coba lagi.";

/**
 * Debounced stock search for `GET stocks/search`.
 *
 * Empty queries do not issue a request. Results reset whenever the query
 * changes so suggestions from the previous term are never shown under a
 * newer input value.
 */
export function useStocksSearch(
  query: string,
  limit = 20,
): UseStocksSearchResult {
  const [data, setData] = useState<StockSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<number | undefined>(undefined);

  useEffect(() => {
    const q = query.trim();
    let cancelled = false;

    setData([]);
    setError(null);
    setStatus(undefined);
    if (!q) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = window.setTimeout(() => {
      void api
        .getStocksSearch(q, limit)
        .then((response) => {
          if (!cancelled) setData(response.data);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          // The transport throws `ApiError` (`{ status, message,
          // body }`) on non-2xx and on network failures, so the
          // cast always succeeds. We surface the wire message
          // when present and keep the `status` so the consumer
          // can branch on auth-gated failures (401) separately
          // from generic ones.
          const apiErr = err as ApiError;
          setData([]);
          setError(
            new Error(apiErr?.message ?? FALLBACK_ERROR_MESSAGE),
          );
          setStatus(apiErr?.status);
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [query, limit]);

  return { data, isLoading, error, status };
}

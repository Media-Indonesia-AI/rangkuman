"use client";

import { useEffect, useState } from "react";
import { api, type StockSearchItem } from "@/lib/api";

interface UseStocksSearchResult {
  data: StockSearchItem[];
  isLoading: boolean;
  error: Error | null;
}

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

  useEffect(() => {
    const q = query.trim();
    let cancelled = false;

    setData([]);
    setError(null);
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
          if (!cancelled) {
            setData([]);
            setError(
              err instanceof Error
                ? err
                : new Error("Gagal mencari saham. Coba lagi."),
            );
          }
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

  return { data, isLoading, error };
}

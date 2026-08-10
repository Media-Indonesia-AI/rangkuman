"use client";

import { useCallback, useState } from "react";
import { api, type TopupRequest, type WalletTransaction } from "@/lib/api";

/**
 * Mutation hook for `POST wallet/topup`. Unlike the read-side
 * wallet hooks (`useGetWallet`, `useGetTopupBundle`, …) this one
 * doesn't auto-fire on mount — it exposes a `request(body)`
 * callable so the consumer fires the mutation from a button
 * click (or wherever the user intent originates).
 *
 * Returns the resolved `WalletTransaction` (the freshly-created
 * invoice) plus loading + error state for the UI to bind to:
 *
 *   - `data`        — last successful invoice, or `null`.
 *                     Survives across renders so the QR card
 *                     stays visible while the user pays.
 *   - `isLoading`   — true while the request is in flight; the
 *                     submit button should be disabled.
 *   - `error`       — localised API error message, or `null`.
 *                     The hook extracts `.message` from the
 *                     `ApiError` shape so consumers don't have
 *                     to re-throw / re-cast.
 *   - `request`     — `(body) => Promise<WalletTransaction | null>`.
 *                     Resolves with the invoice on success or
 *                     `null` on failure (so callers can `await`
 *                     and branch without a try/catch).
 *
 * Body shape is the XOR union `TopupRequest` — exactly one of
 * `amount` (custom IDR-valued top-up outside the catalogue,
 * sent without PPN) or `bundle_code` (curated bundle picked
 * from `GET wallet/topup/bundle`). TypeScript narrows per
 * branch.
 *
 * The hook is intentionally single-flight — calling `request`
 * while a previous one is still in flight overwrites `data`
 * / `error` from the new request. Realistically the submit
 * button is disabled during `isLoading`, so this only matters
 * if a consumer wires two callers in parallel.
 */
export function useRequestTopup(): {
  data: WalletTransaction | null;
  isLoading: boolean;
  error: string | null;
  request: (body: TopupRequest) => Promise<WalletTransaction | null>;
} {
  const [data, setData] = useState<WalletTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async (body: TopupRequest): Promise<WalletTransaction | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.doReqTopup(body);
        setData(res.data);
        return res.data;
      } catch (err) {
        const message =
          (err as { message?: string }).message ?? "Top-up gagal";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { data, isLoading, error, request };
}
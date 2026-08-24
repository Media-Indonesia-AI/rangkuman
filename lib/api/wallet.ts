import { request } from "./client";
import type {
  TopupBundlesResponse,
  TopupRequest,
  WalletResponse,
  WalletTransactionHistoryResponse,
  WalletTransactionResponse,
} from "./types/wallet";

/** `GET wallet/topup/bundle` — curated top-up catalogue. Render rows in `sort` ascending. */
export function getTopupBundle(): Promise<TopupBundlesResponse> {
  return request<TopupBundlesResponse>("wallet/topup/bundle/", {
    method: "GET",
  });
}

/** `GET wallet` — active user's wallet. `balance` is server-aggregated; `lots[]` is FIFO. Auth-gated. */
export function getWallet(): Promise<WalletResponse> {
  return request<WalletResponse>("wallet/", {
    method: "GET",
  });
}

/**
 * `GET wallet/transaction` — paginated top-up invoice history for
 * the active user. Auth-gated. Render rows newest-first; the API
 * doesn't guarantee a sort order so the cache layer preserves
 * whatever the wire returned.
 */
export function getTransactionHistory(
  limit = 10,
  skip = 0,
): Promise<WalletTransactionHistoryResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    skip: String(skip),
  });
  return request<WalletTransactionHistoryResponse>(
    `wallet/transaction/?${params.toString()}`,
    { method: "GET" },
  );
}

/**
 * `POST wallet/topup` — create a top-up invoice. Auth-gated.
 *
 * Body is an XOR union — exactly one of `amount` (custom
 * IDR-valued top-up outside the catalogue) or `bundle_code`
 * (a curated bundle picked from `GET wallet/topup/bundle`).
 * The XOR is enforced at the type level (see `TopupRequest`),
 * so the wire always matches the user's UI selection: picking
 * a chip sends `bundle_code`, typing a koin count sends
 * `amount = koin * Rp/koin_rate`.
 *
 * Returns the freshly-created invoice (`WalletTransaction`)
 * with the gateway's `payment_url` (base64 PNG QR) and
 * `payment_ref` for the handoff — same shape as the rows in
 * `GET wallet/transaction`, just a single-object envelope.
 */
export function doReqTopup(body: TopupRequest): Promise<WalletTransactionResponse> {
  return request<WalletTransactionResponse>("wallet/topup/", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Build the relative URL path for the wallet-top-up SSE stream.
 *
 * Path: `wallet/topup/stream/{payment_ref}` — `payment_ref` is a
 * path segment matching the REST-style route the upstream
 * exposes. No query params and no auth header; the upstream
 * identifies the invoice from the path alone. Prepend
 * `API_BASE_URL` from `@/lib/api/client` and hand the result to
 * `new EventSource(...)`. Returns the path only (no
 * `API_BASE_URL` prefix) so the caller stays in control of where
 * the SSE socket lives — same convention as
 * `doReqTopup("wallet/topup", ...)`, which `request<T>()` then
 * prefixes.
 *
 * @param paymentRef  The invoice's `payment_ref` from the active
 *                    `WalletTransaction` (the same string
 *                    `doReqTopup` returns). Path-encoded via
 *                    `encodeURIComponent` so non-UUID
 *                    `payment_ref`s still travel safely.
 */
export function getWalletTopupStreamPath(paymentRef: string): string {
  return `wallet/topup/stream/${encodeURIComponent(paymentRef)}/`;
}

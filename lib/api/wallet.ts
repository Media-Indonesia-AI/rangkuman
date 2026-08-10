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
  return request<TopupBundlesResponse>("wallet/topup/bundle", {
    method: "GET",
  });
}

/** `GET wallet` — active user's wallet. `balance` is server-aggregated; `lots[]` is FIFO. Auth-gated. */
export function getWallet(): Promise<WalletResponse> {
  return request<WalletResponse>("wallet", {
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
    `wallet/transaction?${params.toString()}`,
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
  return request<WalletTransactionResponse>("wallet/topup", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

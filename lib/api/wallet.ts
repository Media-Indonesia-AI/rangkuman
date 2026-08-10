import { request } from "./client";
import type {
  TopupBundlesResponse,
  WalletResponse,
  WalletTransactionHistoryResponse,
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

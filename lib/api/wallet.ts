import { request } from "./client";
import type { TopupBundlesResponse, WalletResponse } from "./types/wallet";

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

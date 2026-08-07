/**
 * Wallet-domain API endpoints.
 *
 * Hits `wallet/*` — currently just the top-up bundle catalogue
 * surfaced on the `/profile/top-up/` page. Composed into the
 * top-level `api` object in `./client` so existing call sites
 * (`api.getTopupBundle()`) keep working.
 *
 * The split between this file and the other domain modules
 * (`./stocks`, `./headline`, `./market`, `./auth`) mirrors the
 * backend route grouping — every `wallet/*` route lives here.
 */

import { request } from "./client";
import type { TopupBundlesResponse } from "./types/wallet";

/**
 * Fetch the curated top-up bundle catalogue.
 *
 * Hits `GET wallet/topup/bundle`. No pagination today — the
 * catalogue is a small fixed list (typically 3-6 bundles: A / B
 * / C …) the wallet API owns, so the response is a flat array.
 *
 * Returned `TopupBundle` rows carry `id`, `code`, `name`,
 * `coin_amount`, `price`, and `sort` — render them in `sort`
 * ascending so the API's "front" bundle lands first.
 *
 * Called from `<TopUpPage />` once per mount. The wallet API
 * doesn't expose per-user pricing today, so the response is the
 * same for every visitor; no auth gating needed at this layer
 * (the auth header is still attached by `request()`).
 */
export function getTopupBundle(): Promise<TopupBundlesResponse> {
  return request<TopupBundlesResponse>("wallet/topup/bundle", {
    method: "GET",
  });
}
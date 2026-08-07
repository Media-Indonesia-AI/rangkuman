/**
 * Request-level cache for `GET wallet/topup/bundle`.
 *
 * Single-slot cache — the catalogue is small (typically 3-6
 * bundles: A / B / C …) and rarely changes mid-session. Concurrent
 * mounts share one network round-trip via the `inflight` slot.
 * Errors clear the in-flight slot so the next mount can retry.
 */

import { api } from "../client";
import type { TopupBundlesResponse } from "../types/wallet";

let cached: TopupBundlesResponse | null = null;
let inflight: Promise<TopupBundlesResponse> | null = null;

/**
 * Fetch the curated top-up bundle catalogue with request-level
 * dedup. Returns `{ data: TopupBundle[] }` in the order the API
 * ships them — the caller is expected to sort by `sort` ascending
 * since the API may not always return sorted rows.
 *
 * Same envelope (`{ data: TopupBundle[] }`) as
 * `TopStocksResponse` / `TickersResponse` so consumer code follows
 * the same shape conventions. Pricing is owned by the wallet
 * backend; this layer doesn't apply any tax / markup math.
 */
export function loadTopupBundle(): Promise<TopupBundlesResponse> {
  if (cached !== null) return Promise.resolve(cached);
  if (inflight !== null) return inflight;
  inflight = api
    .getTopupBundle()
    .then((res) => {
      cached = res;
      return res;
    })
    .catch((err) => {
      inflight = null; // allow retry on next mount
      throw err;
    });
  return inflight;
}
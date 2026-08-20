/**
 * Request-level cache for `GET wallet`.
 *
 * Single-slot cache — the wallet payload is user-scoped (resolved
 * server-side from the auth header), small, and changes only on
 * top-up / consume events. Concurrent mounts share one network
 * round-trip via the `inflight` slot. Errors clear the in-flight
 * slot so the next mount can retry without getting stuck on a
 * rejected promise.
 */

import { api } from "../client";
import type { WalletResponse } from "../types/wallet";

let cached: WalletResponse | null = null;
let inflight: Promise<WalletResponse> | null = null;

/**
 * Fetch the active user's wallet with request-level dedup.
 * Returns `{ data: Wallet }` — a single-object envelope (the
 * wallet endpoint resolves to one wallet per active user, not
 * an array).
 *
 * Caller is responsible for any per-lot transformation; this
 * layer just ships the wire payload. Auth-gated — the endpoint
 * rejects with no session, so callers should gate the call on
 * the session check before invoking.
 */
export function loadWallet(): Promise<WalletResponse> {
  if (cached !== null) return Promise.resolve(cached);
  if (inflight !== null) return inflight;
  inflight = api
    .getWallet()
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

/**
 * Drop the wallet cache and any in-flight request so the next
 * `loadWallet()` call hits the wire. Mirrors
 * `invalidateTransactionHistory` — used after mutations or
 * external events (e.g. an SSE-driven payment-status change)
 * that should make the wallet stale.
 */
export function invalidateWallet(): void {
  cached = null;
  inflight = null;
}

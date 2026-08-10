/**
 * Request-level cache for `GET wallet/transaction`.
 *
 * Per-(limit, skip) cache — same shape as the stories-list cache:
 * isolated `Map`s so tuples that happen to share keys with other
 * endpoints still hit their own slot. Concurrent mounts share one
 * network round-trip via the `inflight` slot. Errors clear the
 * in-flight slot so the next mount can retry without getting
 * stuck on a rejected promise.
 */

import { api } from "../client";
import type { WalletTransactionHistoryResponse } from "../types/wallet";

const cached = new Map<string, WalletTransactionHistoryResponse>();
const inflight = new Map<string, Promise<WalletTransactionHistoryResponse>>();

function key(limit: number, skip: number): string {
  return `${limit}|${skip}`;
}

/**
 * Fetch the active user's top-up invoice history for a
 * (limit, skip) page. Auth-gated. The cache preserves the wire
 * order — callers that need a stable display order should sort
 * at the consumer layer (typically newest-first by `created_at`).
 */
export function loadTransactionHistory(
  limit = 10,
  skip = 0,
): Promise<WalletTransactionHistoryResponse> {
  const k = key(limit, skip);
  const hit = cached.get(k);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(k);
  if (pending) return pending;
  const promise = api
    .getTransactionHistory(limit, skip)
    .then((res) => {
      cached.set(k, res);
      return res;
    })
    .catch((err) => {
      inflight.delete(k); // allow retry on next mount
      throw err;
    });
  inflight.set(k, promise);
  return promise;
}
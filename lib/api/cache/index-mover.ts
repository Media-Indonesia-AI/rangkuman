/**
 * Request-level cache for `GET stocks/index-mover`.
 *
 * Keyed by `limit` — different limits are distinct snapshots, so each
 * gets its own cached value and in-flight promise. Concurrent mounts
 * for the same limit share one network round-trip; subsequent mounts
 * return the cached value instantly. Errors clear the in-flight slot
 * so the next mount can retry.
 */

import { api } from "../client";
import type { IndexMoverResponse } from "../types/stocks";

const cached = new Map<number, IndexMoverResponse>();
const inflight = new Map<number, Promise<IndexMoverResponse>>();

export function loadIndexMover(limit = 10): Promise<IndexMoverResponse> {
  const hit = cached.get(limit);
  if (hit !== undefined) return Promise.resolve(hit);
  const pending = inflight.get(limit);
  if (pending !== undefined) return pending;
  const req = api
    .getIndexMover(limit)
    .then((res) => {
      cached.set(limit, res);
      inflight.delete(limit);
      return res;
    })
    .catch((err) => {
      inflight.delete(limit); // allow retry on next mount
      throw err;
    });
  inflight.set(limit, req);
  return req;
}

/**
 * Request-level cache for `GET stocks/sectors`.
 *
 * **Per-limit cache** — the sector endpoint takes a `?limit=`
 * query param that controls how many stocks the backend includes
 * per `leading_stocks` / `lagging_stocks` bucket. The home page
 * uses a small limit (default `3`, so 3 + 3 = 6 stocks per
 * sector for a compact card grid); the sector-detail page uses
 * a larger limit (e.g. `10`) so the "Top leading" / "Top
 * lagging" sections can show more constituents. A single-slot
 * cache would shadow the second call with the first one's
 * payload, so we key both `cached` and `inflight` by `limit`
 * and let each `limit` value dedup independently.
 *
 * `inflight` clears on resolve (success populates `cached`) and
 * on reject (lets the next mount retry).
 */

import { api } from "../client";
import type { SectorsResponse } from "../types/sectors";

/** Resolved payloads, keyed by the `?limit=` value they were
 *  fetched with. */
const cached = new Map<number, SectorsResponse>();
/** Pending fetches, keyed by the same `?limit=` value, so two
 *  concurrent mounts with the same limit share one round-trip. */
const inflight = new Map<number, Promise<SectorsResponse>>();

export function loadSectors(limit = 3): Promise<SectorsResponse> {
  const existing = cached.get(limit);
  if (existing) return Promise.resolve(existing);

  const pending = inflight.get(limit);
  if (pending) return pending;

  const promise = api
    .getSectors(limit)
    .then((res) => {
      cached.set(limit, res);
      inflight.delete(limit);
      return res;
    })
    .catch((err) => {
      inflight.delete(limit); // allow retry on next mount
      throw err;
    });
  inflight.set(limit, promise);
  return promise;
}
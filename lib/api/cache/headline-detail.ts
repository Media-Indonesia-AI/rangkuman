/**
 * Request-level cache for `GET headlines/{id}`.
 *
 * Per-`id` cache — different IDs get different slots. Concurrent and
 * subsequent callers for the same ID share one network round-trip.
 * Errors clear the in-flight slot so the next mount can retry.
 */

import { api } from "../client";
import type { HeadlineDetail } from "../types/headline";

const cached = new Map<string, HeadlineDetail>();
const inflight = new Map<string, Promise<HeadlineDetail>>();

/**
 * Fetch a single headline's full detail (with related stories) by
 * ID, with request-level dedup.
 *
 * @param id Headline ID (e.g. mongo-style hash from a list response).
 */
export function loadHeadlineById(
  id: string,
): Promise<HeadlineDetail> {
  const hit = cached.get(id);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(id);
  if (pending) return pending;
  const promise = api
    .getHeadlineById(id)
    .then((res) => {
      cached.set(id, res);
      return res;
    })
    .catch((err) => {
      inflight.delete(id); // allow retry on next mount
      throw err;
    });
  inflight.set(id, promise);
  return promise;
}

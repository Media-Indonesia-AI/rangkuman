/**
 * Request-level cache for `GET stocks/sectors`.
 *
 * Single-slot cache — the sector list is global (not per-ticker)
 * and rarely changes mid-session. Concurrent mounts share one
 * network round-trip. Errors clear the in-flight slot so the
 * next mount can retry.
 *
 * `peekSectors()` reads the currently-cached value without
 * triggering a fetch — useful for code paths that want the
 * list synchronously (e.g. sector-name lookups from a
 * per-ticker page) and can fall back to `null` if it's not
 * warmed yet.
 */

import { api } from "../client";
import type { SectorsResponse } from "../types/sectors";

let cached: SectorsResponse | null = null;
let inflight: Promise<SectorsResponse> | null = null;

/** Read the currently cached sector list without triggering a fetch. */
export function peekSectors(): SectorsResponse | null {
  return cached;
}

export function loadSectors(): Promise<SectorsResponse> {
  if (cached !== null) return Promise.resolve(cached);
  if (inflight !== null) return inflight;
  inflight = api
    .getSectors()
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

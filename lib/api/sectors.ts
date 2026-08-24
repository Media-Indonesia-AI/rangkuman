/**
 * Sector-domain API endpoint.
 *
 * Hits `/stocks/sectors` and returns the full sector list with
 * embedded constituent samples. Kept in its own module (rather
 * than folded into `stocks.ts`) because:
 *   - The wire shape is a sector-bucketed aggregate, not a
 *     per-ticker record like every other `/stocks/*` endpoint.
 *   - The cache key shape is different (single-slot — the
 *     sector list is global, not per-ticker).
 *   - Consumers that only need sector data shouldn't pull in
 *     the per-ticker request module.
 *
 * Re-exported into the top-level `api` object in `./client` so
 * existing call sites can keep using `api.getSectors()`.
 */

import { request } from "./client";
import type { SectorsResponse } from "./types/sectors";

/**
 * Fetch the full sector list with each sector's OHLC-light
 * summary (prev / open / hi / low / last / change) and a
 * sample of constituent stocks. See `Sector` and
 * `SectorStock` for field semantics.
 *
 * The response is unwrapped here (the wire format is
 * `{ data: Sector[] }`) — call sites receive `Sector[]`
 * directly. See `SectorsResponse` for the raw wire shape.
 */
export function getSectors(): Promise<SectorsResponse> {
  return request<SectorsResponse>("stocks/sectors/", { method: "GET" });
}

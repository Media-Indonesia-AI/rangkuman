/**
 * Broadcast / push-notification settings endpoint.
 *
 * Hits `/broadcast-settings`. Auth-gated — the backend resolves the
 * active user from the auth header and returns that user's row.
 * Re-exported as `api.getBroadcastSettings()` via `./client` so
 * existing call sites stay consistent.
 */

import { request } from "./client";
import type { BroadcastSettings } from "./types/broadcast-settings";

/**
 * Fetch the active user's broadcast settings — the master switch
 * (`is_enabled`) plus per-slot opt-ins for morning, afternoon, and
 * evening. The response is the raw `BroadcastSettings` object —
 * the backend does not wrap it in `{ data: ... }`, matching the
 * watchlist wire shape (see `lib/api/types/watchlist.ts`).
 */
export function getBroadcastSettings(): Promise<BroadcastSettings> {
  return request<BroadcastSettings>("broadcast-settings", {
    method: "GET",
  });
}

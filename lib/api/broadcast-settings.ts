/**
 * Broadcast / push-notification settings endpoint.
 *
 * Hits `/broadcast-settings`. Auth-gated — the backend resolves the
 * active user from the auth header and returns that user's row.
 * Re-exported as `api.getBroadcastSettings()` and
 * `api.updateBroadcastSettings()` via `./client` so existing call
 * sites stay consistent.
 */

import { request } from "./client";
import type {
  BroadcastSettings,
  BroadcastSettingsRequest,
} from "./types/broadcast-settings";

/**
 * Fetch the active user's broadcast settings — the master switch
 * (`is_enabled`) plus per-slot opt-ins for morning, afternoon, and
 * evening. The response is the raw `BroadcastSettings` object —
 * the backend does not wrap it in `{ data: ... }`, matching the
 * watchlist wire shape (see `lib/api/types/watchlist.ts`).
 */
export function getBroadcastSettings(): Promise<BroadcastSettings> {
  return request<BroadcastSettings>("broadcast-settings/", {
    method: "GET",
  });
}

/**
 * Replace the active user's broadcast settings. `body` carries the
 * four toggles in their post-edit state — the backend writes the
 * full row, so this is a PUT (not a PATCH).
 *
 * Returns the updated `BroadcastSettings` (raw, not wrapped in an
 * envelope) so the caller can mirror the saved state into their
 * local UI without a follow-up GET. Same caller-side cache-
 * invalidation contract as the watchlist mutations:
 * `invalidateBroadcastSettings()` from `@/lib/api/cache` after a
 * successful PUT so the next `loadBroadcastSettings()` refetches
 * the up-to-date row.
 *
 * Auth-gated — the user is resolved from the auth header.
 */
export function updateBroadcastSettings(
  body: BroadcastSettingsRequest,
): Promise<BroadcastSettings> {
  return request<BroadcastSettings>("broadcast-settings/", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

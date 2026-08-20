/**
 * Types for the `/broadcast-settings` endpoint.
 *
 * Auth-gated, user-scoped notification preferences. The response is
 * the raw object (no `{ data: ... }` envelope) — the backend returns
 * the flags directly, matching the watchlist wire shape. See
 * `../broadcast-settings.ts` for the request function.
 */

/**
 * Active user's broadcast / push-notification settings, returned by
 * `GET broadcast-settings`.
 *
 *   - `is_enabled`           — master switch. When `false`, every
 *                              `notified_*` flag is ignored and no
 *                              broadcasts are sent.
 *   - `notified_morning`     — opted in to the morning slot.
 *   - `notified_afternoon`   — opted in to the afternoon slot.
 *   - `notified_evening`     — opted in to the evening slot.
 *
 * Each field is an independent boolean — the UI binds them to
 * toggles. The settings are user-scoped (resolved from the auth
 * header on the backend), so a single GET returns the active
 * user's row.
 */
export interface BroadcastSettings {
  /** Master switch — gates every `notified_*` flag below. */
  is_enabled: boolean;
  /** Subscribed to the morning broadcast slot. */
  notified_morning: boolean;
  /** Subscribed to the afternoon broadcast slot. */
  notified_afternoon: boolean;
  /** Subscribed to the evening broadcast slot. */
  notified_evening: boolean;
}

/**
 * Request body for `PUT broadcast-settings` — the four toggles
 * the user is allowed to flip. Structurally identical to
 * `BroadcastSettings` so a full PUT is always a round-trip
 * replacement of the user's row. Extracted as a distinct type so
 * future per-field updates can narrow the contract without
 * breaking the read-side type.
 */
export interface BroadcastSettingsRequest {
  /** Master switch — gates every `notified_*` flag below. */
  is_enabled: boolean;
  /** Subscribed to the morning broadcast slot. */
  notified_morning: boolean;
  /** Subscribed to the afternoon broadcast slot. */
  notified_afternoon: boolean;
  /** Subscribed to the evening broadcast slot. */
  notified_evening: boolean;
}

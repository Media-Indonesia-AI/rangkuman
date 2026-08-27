/**
 * Centralized GA4 event-name registry + typed `track()` helper.
 *
 * ─── Why this file exists ────────────────────────────────────────
 *
 * Event names that get misspelled in GA reports silently fragment
 * the dashboard — `'login'` vs `'sign_in'` vs `'Login'` show up as
 * three different rows in the Events report. Centralizing the
 * strings here means a typo is a TypeScript error, not a silent
 * tracking loss.
 *
 * Callers import `EVENTS` + `track` from this module instead of
 * `event` from `lib/analytics`. The lint rule of thumb:
 *
 *     grep -rE 'from\s+"@?/lib/analytics"' app components lib
 *
 * …should return no hits other than `GoogleAnalytics`'s pageview
 * bootstrapper and re-exports. Anywhere a custom event fires,
 * it MUST funnel through `track()` so the name comes from
 * `EVENTS.<key>`.
 *
 * ─── Why not Zod / a schema library ─────────────────────────────
 *
 * Hand-typed payloads + the runtime `string | number | boolean`
 * envelope inside `lib/analytics.ts` is plenty for the surface
 * area we ship today (~30 events). Adding a schema-validation
 * library for one PR is over-engineering — bring it in only if
 * we start adding events with nested objects or required fields
 * that drift between callers.
 *
 * ─── Why `track()` accepts an `options` bag ──────────────────────
 *
 * Lets callers pass `{ transport: "beacon" }` for events that
 * fire immediately before `window.location.assign` (login,
 * register, logout) — GA4 routes those via `navigator.sendBeacon`
 * so the hit survives the unload race. Default behaviour
 * unchanged: in-page events still use the default `image`
 * transport. See `lib/analytics.ts` for the underlying merge.
 */

import { event } from "./analytics";

// ── Event-name registry ──────────────────────────────────────────
//
// `as const` so each entry is a literal type — `EVENTS.login` is
// `"login"`, not `string`. Keeps autocomplete useful and means
// the `EventName` union below is exhaustive over the keys.

export const EVENTS = {
  // Auth
  login: "login",
  login_failed: "login_failed",
  register: "register",
  register_failed: "register_failed",
  logout: "logout",
  one_tap_dismissed: "one_tap_dismissed",

  // Watchlist
  watchlist_add: "watchlist_add",
  watchlist_add_blocked_at_limit: "watchlist_add_blocked_at_limit",
  watchlist_remove: "watchlist_remove",
  watchlist_reorder: "watchlist_reorder",

  // Share
  share_open: "share_open",
  share_copy_link: "share_copy_link",
  share_copy_failed: "share_copy_failed",
  share_whatsapp: "share_whatsapp",
  share_telegram: "share_telegram",

  // Search
  search_submit: "search_submit",
  search_result_select: "search_result_select",

  // OTP / Phone / Broadcast
  otp_request: "otp_request",
  otp_request_failed: "otp_request_failed",
  otp_resend: "otp_resend",
  otp_verify_success: "otp_verify_success",
  otp_verify_failed: "otp_verify_failed",
  phone_number_updated: "phone_number_updated",
  broadcast_toggled: "broadcast_toggled",
  broadcast_settings_saved: "broadcast_settings_saved",

  // Wallet / Topup
  topup_start: "topup_start",
  topup_start_failed: "topup_start_failed",
  topup_success: "topup_success",
  topup_expired: "topup_expired",
  topup_failed: "topup_failed",

  // Errors / Friction
  guest_gate_cta: "guest_gate_cta",
  feature_not_implemented: "feature_not_implemented",
  newsletter_pill_dismissed: "newsletter_pill_dismissed",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

/** Param envelope — matches `event()`'s accepted shape in
 *  `lib/analytics.ts`. Kept loose on purpose: events evolve in
 *  payload shape over time and a strict per-event type would
 *  balloon this file. GA4 accepts arbitrary params per event. */
export type EventParams = Record<string, string | number | boolean>;

/**
 * Typed wrapper around `event()` that constrains the `name`
 * argument to the registered event names and forwards `options`
 * (including `transport: "beacon"`) to the underlying call.
 *
 * No-op safe when GA is disabled or gtag hasn't loaded —
 * `event()` in `lib/analytics.ts` three-guards that.
 */
export function track(
  name: EventName,
  params?: EventParams,
  options?: { transport?: "beacon" | "image" | "xhr" },
): void {
  event(name, params, options);
}

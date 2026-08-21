/**
 * Pure helpers for the Google One Tap dismissal flow on `/login`.
 *
 * Kept out of the page component so the reason-filter logic lives
 * in one place — easy to read, easy to test, and not interleaved
 * with React state plumbing. The page imports the pure helpers
 * here and the `useGoogleOneTap` hook in `./useGoogleOneTap`.
 */

import type { PromptMomentNotification } from "@react-oauth/google";

/**
 * Returns `true` when the notification reflects a user-initiated
 * opt-out (X button, tap outside), so the 30-day dismissal flag
 * in localStorage should be persisted and the prompt suppressed
 * on the next visit.
 *
 * Reasons we treat as **opt-out** (persist the timestamp):
 *
 *   - `isDismissedMoment()` with a reason other than
 *     `cancel_called` / `credential_returned`. The X button and
 *     the account-switcher menu both surface as dismissed
 *     moments; the in-flight success (`credential_returned`) and
 *     our own `cancel()` calls (`cancel_called`) are excluded so
 *     they don't accidentally reset the opt-out.
 *   - `isSkippedMoment()` with reason `tap_outside` or
 *     `user_cancel`. `auto_cancel` and `issuing_failed` are
 *     transient — we'd rather show the prompt again next visit
 *     than lock the user out.
 *
 * Anything else (e.g. transient `auto_cancel`, library-internal
 * skipped moments): don't persist.
 */
export function shouldPersistOneTapDismissal(
  notification: PromptMomentNotification,
): boolean {
  if (notification.isDismissedMoment()) {
    const reason = notification.getDismissedReason();
    return reason !== "cancel_called" && reason !== "credential_returned";
  }
  if (notification.isSkippedMoment()) {
    const reason = notification.getSkippedReason();
    return reason === "tap_outside" || reason === "user_cancel";
  }
  return false;
}

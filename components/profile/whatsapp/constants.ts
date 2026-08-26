/**
 * Shared types + constants for the WhatsApp-profile widgets.
 *
 * Lives in its own module (no JSX) so both the page-level
 * orchestrator (for typing the `frequencies` state) and the
 * `FrequencyCard` widget (for rendering the checkbox list) can
 * import without pulling each other in. `frequenciesFromSettings`
 * is the single normalisation helper used by both the initial-GET
 * hydration effect and the PUT-response mirroring effect in the
 * page — extracting it here kills the duplicated 4-line
 * Set-building block.
 */

import type { BroadcastSettings } from "@/lib/api";

/** Allowed time-of-day slots the user can opt into. Mirrors
 *  the `FREQUENCY` constant below but extracted as a type so
 *  the `useState` declaration + the toggle helper can share the
 *  same union. */
export type FrequencyId = "pagi" | "siang" | "sore";

/** Frequency options — exposed as a small list so the terminology
 *  stays consistent across the UI. The user picks one OR MORE
 *  of the time-of-day slots the brief is delivered at: pagi
 *  (morning brief), siang (midday update), sore (end-of-day
 *  recap). Checkboxes replace the previous radio so the user
 *  can subscribe to multiple slots in one go. `off` is implicit
 *  in the toggle — when the toggle is off, the saved set is
 *  preserved on the client but no message is sent. */
export const FREQUENCY: ReadonlyArray<{
  id: FrequencyId;
  label: string;
  description: string;
}> = [
  {
    id: "pagi",
    label: "Pagi",
    description: "Ringkasan pagi, sekitar jam 07.00 WIB.",
  },
  {
    id: "siang",
    label: "Siang",
    description: "Update siang, sekitar jam 12.00 WIB.",
  },
  {
    id: "sore",
    label: "Sore",
    description: "Ringkasan sore, sekitar jam 17.00 WIB.",
  },
];

/** Build a `Set<FrequencyId>` from any object carrying the three
 *  per-slot boolean flags. Accepts the wider `BroadcastSettings`
 *  type so callers don't have to narrow before passing; the
 *  function only reads the three boolean fields.
 *
 *  Used by the page's hydration effects:
 *    - initial-GET hydration (from `useGetBroadcastSettings`)
 *    - PUT-response mirroring (from `useUpdateBroadcastSettings`)
 */
export function frequenciesFromSettings(settings: {
  notified_morning: boolean;
  notified_afternoon: boolean;
  notified_evening: boolean;
}): Set<FrequencyId> {
  const next = new Set<FrequencyId>();
  if (settings.notified_morning) next.add("pagi");
  if (settings.notified_afternoon) next.add("siang");
  if (settings.notified_evening) next.add("sore");
  return next;
}

/** Strip the phone-formatting prefix off a digit string so two
 *  equivalent numbers (`+62XXXXXXXXXX`, `62XXXXXXXXXX`,
 *  `0XXXXXXXXXX`, bare `XXXXXXXXXX`) collapse to the same
 *  canonical local-digit form. The input is already digit-only
 *  (the `PhoneNumberCard` strips non-digits on type), so this
 *  just peels off leading `+`, `62`, and `0`. Used by the page's
 *  phone dirty check — the saved wire number and the user's
 *  typed number feed through this before comparison so any
 *  prefix form matches.
 */
export function normalizeLocalPhone(s: string): string {
  return s.replace(/^\+/, "").replace(/^62/, "").replace(/^0/, "");
}

/** Content-equality between two sets — `true` when both carry
 *  the same elements regardless of insertion order or reference
 *  identity. Standard size-match + every-element-in-b check.
 *  Used by the broadcast-settings dirty check to compare the
 *  user's selected frequency set against the saved baseline. */
export function setsContainSameItems<T>(
  a: ReadonlySet<T>,
  b: ReadonlySet<T>,
): boolean {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

/** Result of `validateIndonesianPhone` — `ok` is `true` when
 *  the digits represent a valid Indonesian mobile number. On
 *  failure `reason` carries a short Indonesian message suitable
 *  for inline display under the field. */
export interface PhoneValidation {
  ok: boolean;
  reason?: string;
}

/** Indonesian-mobile validator. The card renders a `🇮🇩 +62`
 *  prefix widget, so the user only ever types the local-digit
 *  portion. The full wire form is `+62` followed by 9–12 digits
 *  starting with `8` (mobile prefix). This helper checks the
 *  digit string against that contract and returns a UI-shaped
 *  reason on failure.
 *
 *  Rules (in evaluation order):
 *    1. Empty → `"Nomor wajib diisi."` (the helper text on the
 *       field says "Nomor WhatsApp kamu", so this name aligns).
 *    2. Leading digit ≠ `8` → `"Awalan harus 8."` Indonesian
 *       mobile numbers start with `8` (e.g. `812…`, `813…`,
 *       `852…`); `+62` landline-style (`2x`, `6x`) is rejected.
 *    3. Length outside 9–12 → `"Nomor harus 9–12 digit."`
 *
 *  Used by both `PhoneNumberCard` (for the inline red helper
 *  text on every keystroke) and `usePhoneForm` (to gate the
 *  `saveDisabled` flag). Single source of truth. */
export function validateIndonesianPhone(digits: string): PhoneValidation {
  if (!digits) return { ok: false, reason: "Nomor wajib diisi." };
  if (digits[0] !== "8") return { ok: false, reason: "Awalan harus 8." };
  if (digits.length < 9 || digits.length > 12) {
    return { ok: false, reason: "Nomor harus 9–12 digit." };
  }
  return { ok: true };
}

/** Re-export so the page can keep the `BroadcastSettings` import
 *  scoped to this module — only widgets that need the type reach
 *  into `@/lib/api` directly. (The `BroadcastSettings` type is
 *  used here as a parameter contravariance — see above.) */
export type { BroadcastSettings };
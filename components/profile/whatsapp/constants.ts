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

/** Re-export so the page can keep the `BroadcastSettings` import
 *  scoped to this module — only widgets that need the type reach
 *  into `@/lib/api` directly. (The `BroadcastSettings` type is
 *  used here as a parameter contravariance — see above.) */
export type { BroadcastSettings };
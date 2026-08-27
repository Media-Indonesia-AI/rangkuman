"use client";

import { useCallback, useState } from "react";
import {
  api,
  type UpdatePhoneRequest,
  type User,
} from "@/lib/api";
import { invalidateUserInformation } from "@/lib/api/cache/users";

/**
 * Mutation hook for `POST users/me/phone/` — sets the active user's
 * phone number to a new value, which kicks off the OTP step.
 * Pairs with `useVerifyPhone` to complete verification.
 *
 * The hook normalises `body.phoneNumber` to E.164
 * (`+62XXXXXXXXXX`) before sending — the input field carries local
 * digits only (e.g. `81234567890`, `081234567890`,
 * `6281234567890`, or `+6281234567890` if pasted), and the
 * backend expects the full country-code form. The prefix is
 * always `+62` (Indonesian mobile), matching the static prefix
 * widget in `PhoneNumberCard`. Any leading `+`, `62`, or `0` is
 * stripped first so paste variants don't get double-prefixed.
 *
 * Mirrors `useUpdateBroadcastSettings` — exposes a callable
 * `update(body)` rather than auto-firing on mount, so the consumer
 * decides when the save lands (typically on click of the inline
 * `UpdateWhatsappButton` after the user finishes editing).
 *
 * Returns the resolved `User` (the freshly-mutated row) plus
 * loading + error state for the UI to bind to:
 *
 *   - `data`        — last successful saved row, or `null`.
 *   - `isLoading`   — true while the request is in flight; the
 *                     trigger control should be disabled.
 *   - `error`       — localised API error message, or `null`.
 *                     The hook extracts `.message` from the
 *                     `ApiError` shape so consumers don't have to
 *                     re-throw / re-cast.
 *   - `update`      — `(body) => Promise<{ ok: boolean; data: User | null }>`.
 *                     Resolves with `ok: true` on success (the
 *                     updated row is in `data`) or `ok: false` on
 *                     failure — needed so callers can distinguish
 *                     failure from "saved but `data` happens to be
 *                     null" if the backend ever changes the
 *                     contract (e.g. returns `{ ok: true }` with
 *                     no body).
 *
 * On success the hook invalidates the user-information cache,
 * which also notifies subscribers — every mounted
 * `useGetUserInformation` auto-refreshes via its subscription
 * effect, so the consumer doesn't have to wire `refresh()` calls
 * at the mutation site. This is the same pattern as the
 * `useUpdateBroadcastSettings` ↔ `useGetBroadcastSettings` pair.
 *
 * Note on the wire response: `POST users/me/phone/` may still
 * report `phoneNumber: null` at this stage — the verified number
 * is only committed after the OTP verify step. UI should display
 * the candidate number the user just typed, not the response
 * field. The `useGetUserInformation` re-fetch that follows the
 * invalidation picks up whatever the server's current view of
 * the user is.
 */
export function useUpdatePhone(): {
  data: User | null;
  isLoading: boolean;
  error: string | null;
  update: (
    body: UpdatePhoneRequest,
  ) => Promise<{ ok: boolean; data: User | null }>;
} {
  const [data, setData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (
      body: UpdatePhoneRequest,
    ): Promise<{ ok: boolean; data: User | null }> => {
      setIsLoading(true);
      setError(null);
      try {
        // Canonicalise to E.164 `+62XXXXXXXXXX`. Strip any
        // leading `+`, `62`, or `0` so paste variants collapse
        // to the same local digits, then prepend `+62` once.
        // This mirrors `normalizeLocalPhone` in reverse — same
        // strip chain, just re-prefixed for the wire.
        const digits = body.phone_number
          .replace(/^\+/, "")
          .replace(/^62/, "")
          .replace(/^0/, "");
        const res = await api.updatePhone({ phone_number: `+62${digits}` });
        setData(res);
        invalidateUserInformation();
        return { ok: true, data: res };
      } catch (err) {
        const message =
          (err as { message?: string }).message ??
          "Gagal update nomor WhatsApp";
        setError(message);
        return { ok: false, data: null };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { data, isLoading, error, update };
}

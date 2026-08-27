"use client";

import { useCallback, useState } from "react";
import {
  api,
  type User,
  type VerifyPhoneRequest,
} from "@/lib/api";
import { invalidateUserInformation } from "@/lib/api/cache/users";

/**
 * Mutation hook for `POST users/me/phone/verify/` — submits the
 * 6-digit OTP the user received via SMS after `useReqOtp()` and
 * commits the verified number to the active user's record.
 * Final step of the phone-verification flow:
 *
 *   1. `useUpdatePhone`   — set candidate number
 *   2. `useReqOtp`        — send the SMS
 *   3. `useVerifyPhone`   — submit the code (this hook)
 *
 * Mirrors `useUpdatePhone` / `useReqOtp` — exposes a callable
 * `verify(body)` rather than auto-firing on mount, so the
 * consumer decides when the code lands (typically auto-submit
 * on the 6th digit of the OTP input). Returns the resolved
 * `User` (with `phoneNumber` populated and
 * `phoneNumberVerifiedAt` set) plus loading + error state.
 *
 *   - `data`        — last successful verified row, or `null`.
 *   - `isLoading`   — true while the request is in flight; the
 *                     OTP input should disable submit / show
 *                     "Memverifikasi…".
 *   - `error`       — localised API error message, or `null`.
 *                     Most common cause is a wrong / expired
 *                     code (HTTP 400). The hook extracts
 *                     `.message` from the `ApiError` shape so
 *                     consumers can render the error inline
 *                     without re-throwing.
 *   - `verify`      — `(body) => Promise<{ ok: boolean; data: User | null }>`.
 *                     Resolves with `ok: true` on success (the
 *                     verified row is in `data`) or `ok: false`
 *                     on failure.
 *
 * On success the hook invalidates the user-information cache,
 * which notifies every subscriber and bumps `useGetUserInformation`
 * → `user.phoneNumberVerifiedAt` flips from `null` to an ISO
 * timestamp. The OTP widget reads that field and unmounts
 * itself, dropping the user back into the regular edit flow.
 * Mirrors the `useUpdatePhone` → `useGetUserInformation`
 * invalidation pattern.
 */
export function useVerifyPhone(): {
  data: User | null;
  isLoading: boolean;
  error: string | null;
  verify: (
    body: VerifyPhoneRequest,
  ) => Promise<{ ok: boolean; data: User | null }>;
} {
  const [data, setData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = useCallback(
    async (
      body: VerifyPhoneRequest,
    ): Promise<{ ok: boolean; data: User | null }> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.verifyPhone(body);
        setData(res);
        invalidateUserInformation();
        return { ok: true, data: res };
      } catch (err) {
        const message =
          (err as { message?: string }).message ??
          "Kode OTP salah atau udah kadaluarsa.";
        setError(message);
        return { ok: false, data: null };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { data, isLoading, error, verify };
}

"use client";

import { useCallback, useState } from "react";
import { api, type ReqOtpResponse } from "@/lib/api";

/**
 * Mutation hook for `POST users/me/otp/` — asks the backend to
 * send a fresh OTP to the phone number currently on the user's
 * record. No request body — the phone is resolved from the active
 * user, and the endpoint is rate-limited server-side (typical
 * back-off on retry is a few seconds).
 *
 * Mirrors `useUpdateBroadcastSettings` / `useUpdatePhone` —
 * exposes a callable `req()` rather than auto-firing on mount, so
 * the consumer decides when the SMS lands (typically on click of
 * a "Kirim ulang kode" / "Kirim OTP" button after the user has
 * typed a candidate phone number).
 *
 * Returns the resolved `ReqOtpResponse` plus loading + error
 * state for the UI to bind to:
 *
 *   - `data`        — last successful response (`{ message }`),
 *                     or `null`. The `message` is the server's
 *                     localised confirmation (e.g. `"OTP sent to
 *                     +62…"`) — surface it as a toast / status
 *                     banner so the user knows the SMS was
 *                     dispatched.
 *   - `isLoading`   — true while the request is in flight; the
 *                     trigger control should be disabled and its
 *                     label swapped to "Mengirim…".
 *   - `error`       — localised API error message, or `null`.
 *                     The hook extracts `.message` from the
 *                     `ApiError` shape so consumers don't have to
 *                     re-throw / re-cast. Most common cause is
 *                     rate-limiting — a 429 surfaces here.
 *   - `req`         — `() => Promise<{ ok: boolean; data: ReqOtpResponse | null }>`.
 *                     Resolves with `ok: true` on success (the
 *                     confirmation is in `data`) or `ok: false`
 *                     on failure.
 *
 * No cache to invalidate — the endpoint doesn't mutate user-info
 * state, it just triggers an SMS. Consumers that need to know
 * about the OTP landing should pair this with `useVerifyPhone`,
 * which actually commits the verified number to the user record.
 */
export function useReqOtp(): {
  data: ReqOtpResponse | null;
  isLoading: boolean;
  error: string | null;
  req: () => Promise<{ ok: boolean; data: ReqOtpResponse | null }>;
} {
  const [data, setData] = useState<ReqOtpResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const req = useCallback(async (): Promise<{
    ok: boolean;
    data: ReqOtpResponse | null;
  }> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.reqOtp();
      setData(res);
      return { ok: true, data: res };
    } catch (err) {
      const message =
        (err as { message?: string }).message ??
        "Gagal kirim kode OTP";
      setError(message);
      return { ok: false, data: null };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, req };
}

/**
 * User profile + phone-number verification endpoints.
 *
 * Hits `/users/me/*`. Auth-gated — the backend resolves the active
 * user from the auth header. Re-exported as
 * `api.getUserInformation()`, `api.updatePhone()`,
 * `api.reqOtp()`, and `api.verifyPhone()` via `./client` so
 * existing call sites (`api.getUserInformation()`) keep working.
 *
 * Phone-verification flow:
 *   1. `POST users/me/phone/` with the new number (`updatePhone`)
 *      — sets the candidate number on the user record.
 *   2. `POST users/me/otp/` (`reqOtp`) — asks the backend to send
 *      a fresh OTP SMS to the number on file.
 *   3. `POST users/me/phone/verify/` with the 6-digit code
 *      (`verifyPhone`) — confirms the OTP. On success the response
 *      carries the updated `User` with `phoneNumber` populated
 *      and `phoneNumberVerifiedAt` set.
 *
 * Note on `updatePhone`'s response: the backend may still report
 * `phoneNumber: null` at this stage (the verified number is only
 * committed after step 3). UI should display the candidate number
 * the user just typed, not the response field.
 */

import { request } from "./client";
import type {
  ReqOtpResponse,
  UpdatePhoneRequest,
  User,
  UserInformationResponse,
  VerifyPhoneRequest,
} from "./types/users";

/**
 * `GET users/me/` — full profile of the active user. Auth-gated;
 * the user is resolved from the auth header.
 *
 * Wrapped in `{ user }` per the backend's envelope convention —
 * distinct from the phone endpoints, which return the bare `User`.
 * Use this for the account-settings page where the full state
 * (timestamps, email-verified flag, phone-verified flag) is
 * needed.
 */
export function getUserInformation(): Promise<UserInformationResponse> {
  return request<UserInformationResponse>("users/me/", {
    method: "GET",
  });
}

/**
 * `POST users/me/phone/` — set the active user's phone number to
 * the value in `body.phoneNumber`. Triggers the OTP step; pair
 * with `verifyPhone()` to complete verification.
 *
 * Returns the raw `User` (no envelope) so the caller can mirror
 * the server-side state into local UI without a follow-up GET.
 */
export function updatePhone(body: UpdatePhoneRequest): Promise<User> {
  return request<User>("users/me/phone/", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * `POST users/me/otp/` — ask the backend to send a fresh OTP to
 * the phone number currently on the user's record. No request
 * body — the phone is resolved from the active user, and the
 * endpoint is rate-limited server-side.
 *
 * Returns the server's `message` (e.g. `"OTP sent to +62…"`),
 * suitable for surfacing as a toast / status banner.
 */
export function reqOtp(): Promise<ReqOtpResponse> {
  return request<ReqOtpResponse>("users/me/phone/otp/", {
    method: "POST",
  });
}

/**
 * `POST users/me/phone/verify/` — submit the OTP code the user
 * received via SMS. On success the response carries the updated
 * `User` with `phoneNumber` populated and `phoneNumberVerifiedAt`
 * set to the verification timestamp.
 *
 * Backend returns the bare `User` (no envelope), matching
 * `updatePhone()`. A 400 indicates the code is wrong / expired;
 * UI should re-prompt rather than retry silently.
 */
export function verifyPhone(body: VerifyPhoneRequest): Promise<User> {
  return request<User>("users/me/phone/verify/", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
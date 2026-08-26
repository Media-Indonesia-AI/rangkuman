/**
 * Types for the `/users/me/*` endpoints — active-user profile
 * reads and phone-number verification flow.
 *
 * The `User` shape here is the full server-side representation of
 * an account, including phone-number state for the OTP verification
 * flow. It is intentionally distinct from `RegisterResponseUser`
 * in `./auth.ts`, which is the narrower shape returned at
 * register/login (the phone fields didn't exist when those flows
 * shipped, and adding them to `RegisterResponseUser` would force a
 * type change at every existing call site).
 *
 * Consumed by `../users.ts` (request functions) and downstream
 * UI (account settings, phone-verification sheet, etc).
 */

/**
 * The active user's full profile, returned by `GET users/me/`,
 * `POST users/me/phone/`, and `POST users/me/phone/verify/`.
 *
 *   - `id`                       — opaque user id from the backend
 *                                 (mongo-style hash).
 *   - `email`, `username`, `name` — registration fields.
 *   - `googleId`                 — Google `sub` claim, or `null`
 *                                 for email/password accounts.
 *   - `isEmailVerified`          — whether the email has been
 *                                 verified (separate from phone
 *                                 verification).
 *   - `phoneNumber`              — the phone number on file, or
 *                                 `null` if not yet set / cleared.
 *                                 Note: even after `POST
 *                                 users/me/phone/` sets a new
 *                                 number, the response may still
 *                                 report `phoneNumber: null` until
 *                                 verification completes — the
 *                                 backend only commits the
 *                                 verified number to the user
 *                                 record.
 *   - `phoneNumberVerifiedAt`    — ISO timestamp of when the
 *                                 phone was verified, or `null`
 *                                 if not yet verified.
 *   - `createdAt`, `updatedAt`   — ISO timestamps of account
 *                                 creation and last mutation.
 */
export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  googleId: string | null;
  isEmailVerified: boolean;
  phoneNumber: string | null;
  phoneNumberVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Wire format for `GET users/me/` — the user payload wrapped in a
 * single-object `{ user }` envelope (distinct from the bare `User`
 * returned by the phone endpoints, which the backend hands back
 * unwrapped). Matches the `RegisterResponse` envelope shape from
 * `./auth.ts`.
 */
export interface UserInformationResponse {
  user: User;
}

/**
 * Request body for `POST users/me/phone/` — the new phone number
 * to set on the active user's record. E.164-formatted, e.g.
 * `"+6281234567890"` (country code + national number, no spaces
 * or punctuation). The backend accepts the value as-is and
 * triggers an OTP to be sent to it.
 */
export interface UpdatePhoneRequest {
  phoneNumber: string;
}

/**
 * Request body for `POST users/me/phone/verify/` — the 6-digit OTP
 * the user received via SMS after `POST users/me/phone/`. Strings
 * are accepted as the wire format to avoid losing leading zeros or
 * country-code prefixes if the backend ever extends the code
 * space; consumers should `String(code).trim()` before submit.
 */
export interface VerifyPhoneRequest {
  code: string;
}

/**
 * Wire format for `POST users/me/otp/` — a generic success
 * envelope carrying the server's `message` (e.g. `"OTP sent to
 * +62…"`). The OTP itself is delivered out-of-band via SMS; the
 * front-end only needs the message for toast / status display.
 */
export interface ReqOtpResponse {
  message: string;
}
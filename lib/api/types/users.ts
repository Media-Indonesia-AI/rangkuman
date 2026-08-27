/**
 * Types for the `/users/me/*` endpoints — active-user profile
 * reads and phone-number verification flow.
 *
 * `User` is the canonical user/account type for the whole app —
 * the wire shape from the backend, plus three client-only session
 * fields (`password`, `loggedInAt`, `provider`) that `lib/auth.ts`
 * writes into localStorage at login/register. The session fields
 * are optional because the wire response doesn't include them;
 * `useCurrentUser` (which reads from localStorage) returns them
 * populated, while `useGetUserInformation` (which reads the wire)
 * returns them `undefined`. Consumers that need the session fields
 * (e.g. `/profile/`) should narrow to `User & { loggedInAt: string;
 * provider: "email" | "google" }` or fall back defensively.
 *
 * Consumed by `../users.ts` (request functions), `lib/auth.ts`
 * (session helpers), `lib/hooks/useAuth.ts` (`useCurrentUser`),
 * `lib/hooks/useGetUserInformation.ts` (cache-driven hook), and
 * downstream UI (account settings, phone-verification sheet,
 * `/profile/`).
 */

/**
 * The canonical user/account type — wire shape from
 * `GET users/me/`, `POST users/me/phone/`, and
 * `POST users/me/phone/verify/`, plus optional session fields
 * populated by `lib/auth.ts` on login/register.
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
 *                                 Optional — only present on
 *                                 endpoints that surface phone
 *                                 state (`GET users/me/`,
 *                                 `POST users/me/phone/`,
 *                                 `POST users/me/phone/verify/`).
 *                                 Not on `POST /auth/register` /
 *                                 `POST /auth/login` /
 *                                 `POST /auth/google` — those
 *                                 endpoints predate the phone
 *                                 flow and don't return phone
 *                                 fields. Note: even after `POST
 *                                 users/me/phone/` sets a new
 *                                 number, the response may still
 *                                 report `phoneNumber: null` until
 *                                 verification completes — the
 *                                 backend only commits the
 *                                 verified number to the user
 *                                 record.
 *   - `phoneNumberVerifiedAt`    — ISO timestamp of when the
 *                                 phone was verified, or `null`
 *                                 if not yet verified. Same
 *                                 optionality as `phoneNumber`.
 *   - `createdAt`, `updatedAt`   — ISO timestamps of account
 *                                 creation and last mutation.
 *   - `password`                 — client-only. The plaintext
 *                                 password used to build HTTP Basic
 *                                 auth on subsequent requests
 *                                 (`getAuthHeader()` in
 *                                 `lib/api/client.ts`). `undefined`
 *                                 for Google sessions (their
 *                                 password slot is the `sub` claim
 *                                 via `googleId`). Never returned by
 *                                 the wire — only present on the
 *                                 localStorage session object.
 *   - `loggedInAt`               — client-only. ISO timestamp of
 *                                 when the session was created.
 *                                 Surfaced as "Member sejak" in
 *                                 `/profile/`. Never returned by
 *                                 the wire.
 *   - `provider`                 — client-only. `"email"` or
 *                                 `"google"` — which auth flow
 *                                 produced this session. Surfaced
 *                                 as the "Provider" row in
 *                                 `/profile/`. Never returned by
 *                                 the wire.
 */
export interface User {
  id?: string;
  email: string;
  username: string;
  name: string;
  googleId?: string | null;
  isEmailVerified?: boolean;
  /** Wire-optional — see field doc above for endpoint coverage. */
  phoneNumber?: string | null;
  /** Wire-optional — see field doc above for endpoint coverage. */
  phoneNumberVerifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  /** Client-only — HTTP Basic auth credential. See field doc above. */
  password?: string;
  /** Client-only — ISO timestamp of session creation. */
  loggedInAt?: string;
  /** Client-only — `"email"` | `"google"`, set at login time. */
  provider?: "email" | "google";
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
  phone_number: string;
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
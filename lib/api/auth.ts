/**
 * Auth-domain API endpoints.
 *
 * Hits `/auth/*`. Re-exports are composed into the top-level `api`
 * object in `./client` so existing call sites (`api.register(...)`,
 * `api.login(...)`) keep working.
 */

import { request } from "./client";
import type {
  GoogleLoginResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
} from "./types/auth";

export function register(
  body: RegisterRequest,
): Promise<RegisterResponse> {
  return request<RegisterResponse>("auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function login(
  body: LoginRequest,
): Promise<RegisterResponse> {
  return request<RegisterResponse>("auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Trade a Google-issued JWT id_token (delivered directly to the
 * browser by the GSI script via `@react-oauth/google`'s
 * `<GoogleLogin />` `onSuccess` callback) for the same
 * `RegisterResponse` envelope used by `/auth/login` and
 * `/auth/register`. The backend verifies the credential against
 * Google's JWKS, upserts the user (create-on-first-login), and
 * returns the same shape the email flows return so
 * `loginWithGoogle()` in `lib/auth.ts` can build a `MockUser` and
 * persist it via the shared `writeJson` plumbing.
 */
export function googleLogin(
  idToken: string,
): Promise<GoogleLoginResponse> {
  return request<GoogleLoginResponse>("auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}
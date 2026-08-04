/**
 * Auth-domain API endpoints.
 *
 * Hits `/auth/*`. Re-exports are composed into the top-level `api`
 * object in `./client` so existing call sites (`api.register(...)`,
 * `api.login(...)`) keep working.
 */

import { request } from "./client";
import type {
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
 * Trade a one-time Google OAuth token (delivered by the backend in
 * the `/auth/google/callback` redirect) for the same envelope used
 * by `/auth/login` and `/auth/register`. Consumed by the
 * `/auth/callback` page when the backend ships only a token in the
 * URL — the page hits this endpoint, builds a `MockUser` from the
 * response, persists it via `writeJson`, then hard-navigates to
 * the post-auth destination.
 *
 * If the backend instead ships a base64-encoded session/user in
 * the URL, the callback page prefers that path and never calls
 * this endpoint. Kept as a fallback in case the response shape
 * differs once we probe it.
 */
export function googleSession(token: string): Promise<RegisterResponse> {
  return request<RegisterResponse>(
    `auth/google/session?token=${encodeURIComponent(token)}`,
    { method: "GET" },
  );
}
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
} from "./types";

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
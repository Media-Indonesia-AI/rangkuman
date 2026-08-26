/**
 * Types for `/auth/*` endpoints — register and login.
 *
 * The wire shape uses the canonical `User` type from `./users.ts`
 * (formerly the narrower `RegisterResponseUser`, which was a strict
 * subset — `User` adds optional phone fields that the auth endpoints
 * don't return yet). `RegisterResponse` / `GoogleLoginResponse` /
 * `LoginRequest` / `RegisterRequest` all live here.
 *
 * Consumed by `../auth.ts` (request functions) and `lib/auth.ts`
 * (auth state helpers).
 */

import type { User } from "./users";

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  /** Either the user's email or username. The server resolves which one it is. */
  identifier: string;
  password: string;
}

/**
 * `/auth/register` and `/auth/login` envelope — the user (canonical
 * `User`, with phone fields omitted because those endpoints predate
 * the phone flow), plus a one-time `setupToken` for the verified-
 * email bootstrap and a server message.
 */
export interface RegisterResponse {
  user: User;
  setupToken: string;
  message: string;
}

/**
 * `/auth/google/verify` envelope — `{ user, message }` with no
 * `setupToken` (Google users have no password to set up).
 */
export interface GoogleLoginResponse {
  user: User;
  message: string;
}
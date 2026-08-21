/**
 * Types for `/auth/*` endpoints — register and login.
 * Consumed by `../auth.ts` (request functions) and `lib/auth.ts`
 * (auth state helpers).
 */

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

export interface RegisterResponseUser {
  id: string;
  email: string;
  username: string;
  name: string;
  googleId: string | null;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterResponse {
  user: RegisterResponseUser;
  setupToken: string;
  message: string;
}

/** `/auth/google/verify` envelope — `{ user, message }` with no
 *  `setupToken` (Google users have no password to set up). */
export interface GoogleLoginResponse {
  user: RegisterResponseUser;
  message: string;
}
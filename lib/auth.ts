/**
 * Auth + watchlist — backed by the remote API (lib/api.ts) for register.
 * Watchlist stays local (no backend yet).
 * The active session is persisted to localStorage so it survives reloads.
 */

import { api, type ApiError, type RegisterResponse } from "./api";
import { AUTH_PREV_PATH_KEY } from "@/components/PathnameTracker";

// Exported because `app/auth/callback/page.tsx` (Google OAuth
// landing route) also writes the session through `writeJson` after
// completing the OAuth dance. Keeping these as the canonical
// storage keys lets the email flow and the Google flow share one
// persistence path (and one listener-bus fan-out).
export const USER_KEY = "beritainvestor:user";
export const SETUP_TOKEN_KEY = "beritainvestor:setupToken";
const WATCHLIST_KEY = "beritainvestor:watchlist";
const MAX_WATCHLIST = 10;

/**
 * Pick the URL the auth flow should send the user to after a
 * successful login or registration. Three sources, in priority
 * order:
 *
 *  1. Explicit `?next=<path>` query parameter — links that
 *     want to override the default (e.g. a deep-link email
 *     "finish setting up your account" flow).
 *  2. The most recent non-auth pathname captured by
 *     `<PathnameTracker />` in the root layout — i.e. the page
 *     the user was on before they clicked "Login" / "Daftar".
 *     This is the common case: the user is reading `/saham`,
 *     clicks "Masuk", authenticates, and lands back on `/saham`
 *     instead of being dropped on the home page.
 *  3. `"/"` (Beranda) as the final fallback.
 *
 * The returned path is always validated — must be a relative
 * URL (starts with `/`), must not be protocol-relative
 * (`//evil.com/...`), and must not point back at the auth pages
 * themselves. This blocks open-redirect attacks where an attacker
 * crafts a link like `/login?next=//evil.example.com` and the
 * post-auth push dutifully follows it.
 *
 * Also reads `?next=` first when present so direct navigation
 * to `/login?next=/watchlist` still works without going through
 * a "previous page" capture.
 */
export function getAuthRedirectTarget(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
): string {
  const fromQuery = searchParams.get("next");
  if (fromQuery && isSafeRedirectPath(fromQuery)) return fromQuery;

  try {
    const fromStorage = sessionStorage.getItem(AUTH_PREV_PATH_KEY);
    if (fromStorage && isSafeRedirectPath(fromStorage)) return fromStorage;
  } catch {
    // sessionStorage disabled — fall through to "/".
  }

  return "/";
}

/** Validate a post-auth redirect target. Rejects anything that
 *  isn't a clean in-app relative path — see `getAuthRedirectTarget`
 *  for the threat model.
 *
 *  Note: `next.config.js` has `trailingSlash: true`, so Next.js
 *  canonicalizes `/login` → `/login/`, `/saham/BBRI` → `/saham/BBRI/`,
 *  etc. We strip the trailing slash before the auth-page check so
 *  `/login/` (the form's actual URL) is also recognized as an auth
 *  surface — otherwise a logged-in submit would no-op back onto the
 *  same URL instead of navigating away. */
function isSafeRedirectPath(path: string): boolean {
  if (!path.startsWith("/")) return false;
  // `//host/path` is a protocol-relative URL — opens a window
  // for an open-redirect via a crafted `?next=//evil.example.com`.
  if (path.startsWith("//")) return false;
  // Strip trailing slash for the auth-page comparison only —
  // `"/login/"` and `"/login"` both refer to the same route under
  // `trailingSlash: true`. Anything else (query string, hash) is
  // preserved.
  const normalized = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  // Don't bounce the user straight back to the auth surface
  // they just authenticated on.
  if (normalized === "/login" || normalized === "/daftar") return false;
  return true;
}

/** Readonly variant of `URLSearchParams` for environments where
 *  `useSearchParams()` returns a frozen instance. Functionally
 *  identical to the standard constructor — `get` works the same. */
type ReadonlyURLSearchParams = {
  get(key: string): string | null;
};

export interface MockUser {
  /** Server-assigned user id (MongoDB-style). Empty for legacy local sessions. */
  id?: string;
  email: string;
  username: string;
  name: string;
  /** Plaintext password — kept so we can build HTTP Basic auth on every request.
   *  Demo-only: the real app would use HTTP-only session cookies. */
  password?: string;
  /** ISO timestamp of when the session was created. */
  loggedInAt: string;
  /** Provider used at sign-in: "email" | "google". */
  provider: "email" | "google";
  /** Whether the user has verified their email (from server). */
  isEmailVerified?: boolean;
}

export interface WatchlistSnapshot {
  codes: string[];          // stock tickers, oldest-added first
  /** ISO timestamp of last mutation. */
  updatedAt: string;
}

/** Read JSON from localStorage safely (SSR no-op). */
function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Write JSON to localStorage safely. Exported so external flows
 * (e.g. `app/auth/callback/page.tsx` for Google OAuth) can persist
 * a session the same way `registerUser` / `loginWithIdentifier`
 * do — keeping a single persistence path for email and Google
 * auth, and ensuring the in-process listener bus wakes
 * `useCurrentUser` synchronously.
 */
export function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    // Tell other tabs / hook subscribers that storage changed.
    window.dispatchEvent(
      new CustomEvent("beritainvestor:storage", { detail: { key } }),
    );
    // Wake in-process subscribers (useCurrentUser, useWatchlist) so they
    // re-read storage synchronously instead of waiting for a window event
    // that may not fire in the same tab.
    listeners.forEach((fn) => fn());
  } catch {
    // Quota exceeded / storage disabled — fail silently.
  }
}

function removeKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
    window.dispatchEvent(
      new CustomEvent("beritainvestor:storage", { detail: { key } }),
    );
    listeners.forEach((fn) => fn());
  } catch {
    /* noop */
  }
}

/** RFC-5322-lite: at least one char, "@", at least one char, ".", at least one char. No whitespace. */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── AUTH ─────────────────────────────────────────────────────────

export function getCurrentUser(): MockUser | null {
  return readJson<MockUser>(USER_KEY);
}

export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}

/**
 * Login against the remote API. `identifier` can be either email or username —
 * the server resolves which one it is.
 * - Validates locally first.
 * - POSTs to `auth/login`.
 * - On success, persists the returned user as the active session AND saves the
 *   setupToken (Basic Auth on subsequent requests).
 * - Throws on validation failure or API error.
 */
export async function loginWithIdentifier(
  identifier: string,
  password: string,
): Promise<MockUser> {
  const id = identifier.trim();
  const pw = password;

  if (!id) throw new Error("Email atau username wajib diisi");
  if (!pw || pw.length < 6) throw new Error("Password minimal 6 karakter");
  if (/\s/.test(pw)) throw new Error("Password tidak boleh mengandung spasi");
  if (pw.length > 128) throw new Error("Password maksimal 128 karakter");

  let response: RegisterResponse;
  try {
    response = await api.login({ identifier: id, password: pw });
  } catch (err) {
    const apiErr = err as ApiError;
    if (apiErr?.status === 401) {
      throw new Error("Email/username atau password salah");
    }
    if (apiErr?.status === 400) {
      throw new Error(apiErr.message || "Data login tidak valid");
    }
    throw new Error(apiErr?.message ?? "Gagal terhubung ke server");
  }

  const session: MockUser = {
    id: response.user.id,
    email: response.user.email,
    username: response.user.username,
    name: response.user.name,
    password: pw, // keep around for HTTP Basic auth on subsequent requests
    loggedInAt: response.user.createdAt,
    provider: "email",
    isEmailVerified: response.user.isEmailVerified,
  };
  writeJson(USER_KEY, session);
  if (response.setupToken) writeJson(SETUP_TOKEN_KEY, response.setupToken);
  return session;
}

/**
 * Initiates the Google sign-in flow by navigating the browser to the
 * backend's `/auth/google` entrypoint. From there the backend takes
 * over — it 302-redirects to Google's consent screen, exchanges the
 * code on Google's callback, and finally 302-redirects back to our
 * frontend `/auth/callback` page (handled by
 * `app/auth/callback/page.tsx`) with session data for that page to
 * persist.
 *
 * Returns `void` because the page is being navigated away from; the
 * caller (the "Lanjutkan dengan Google" button) doesn't await a
 * result. The actual session-write happens in the callback route.
 *
 * No new npm dependencies are needed — the existing `request()`
 * client in `lib/api/client.ts` and `writeJson` /
 * `useCurrentUser()` chain handle the post-callback side, mirroring
 * what `loginWithIdentifier` (above) does for email sign-in.
 */
export function loginWithGoogle(): void {
  if (typeof window === "undefined") return;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  // `base` already ends with `/api/` (see .env.development), so
  // concatenation is straightforward.
  window.location.assign(`${base}auth/google`);
}

/**
 * Register a new account against the remote API.
 * - Validates locally first (instant feedback).
 * - POSTs to `auth/register`.
 * - On success, persists the returned user as the active session AND saves the
 *   setupToken for subsequent HTTP Basic Auth requests.
 * - Throws on validation failure or API error.
 */
export async function registerUser(input: {
  username: string;
  name: string;
  email: string;
  password: string;
}): Promise<MockUser> {
  const username = input.username.trim();
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  // ---- Local validation (mirrors the form's client checks) ----
  if (!username) throw new Error("Username wajib diisi");
  if (/\s/.test(username)) throw new Error("Username tidak boleh mengandung spasi");
  if (username.length < 6) throw new Error("Username minimal 6 karakter");
  if (username.length > 32) throw new Error("Username maksimal 32 karakter");
  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
    throw new Error("Username hanya boleh huruf, angka, _ . -");
  }
  if (!name) throw new Error("Nama wajib diisi");
  if (/\s/.test(email)) throw new Error("Email tidak boleh mengandung spasi");
  if (!isValidEmail(email)) throw new Error("Format email tidak valid");
  if (/\s/.test(password)) throw new Error("Password tidak boleh mengandung spasi");
  if (!password || password.length < 6) {
    throw new Error("Password minimal 6 karakter");
  }
  if (password.length > 128) {
    throw new Error("Password maksimal 128 karakter");
  }

  // ---- Remote call ----
  let response: RegisterResponse;
  try {
    response = await api.register({ email, username, password, name });
  } catch (err) {
    const apiErr = err as ApiError;
    // Map known status codes to friendlier messages.
    if (apiErr?.status === 409) {
      throw new Error("Username atau email sudah terdaftar");
    }
    if (apiErr?.status === 400) {
      throw new Error(apiErr.message || "Data pendaftaran tidak valid");
    }
    throw new Error(apiErr?.message ?? "Gagal terhubung ke server");
  }

  // ---- Persist session + setupToken ----
  const session: MockUser = {
    id: response.user.id,
    email: response.user.email,
    username: response.user.username,
    name: response.user.name,
    password, // keep around for HTTP Basic auth on subsequent requests
    loggedInAt: response.user.createdAt,
    provider: "email",
    isEmailVerified: response.user.isEmailVerified,
  };
  writeJson(USER_KEY, session);
  writeJson(SETUP_TOKEN_KEY, response.setupToken);
  return session;
}

export function logout(): void {
  removeKey(USER_KEY);
  removeKey(SETUP_TOKEN_KEY);
}

/** Read the one-time setupToken returned by `POST /auth/register`. */
export function getSetupToken(): string | null {
  return readJson<string>(SETUP_TOKEN_KEY);
}

// ─── WATCHLIST ───────────────────────────────────────────────────

export function getWatchlist(): WatchlistSnapshot {
  const stored = readJson<WatchlistSnapshot>(WATCHLIST_KEY);
  if (stored && Array.isArray(stored.codes)) return stored;
  return { codes: [], updatedAt: new Date(0).toISOString() };
}

export function watchlistAdd(kode: string): { ok: boolean; reason?: string } {
  const upper = kode.toUpperCase();
  const snap = getWatchlist();
  if (snap.codes.includes(upper)) {
    return { ok: false, reason: "Saham sudah ada di watchlist" };
  }
  if (snap.codes.length >= MAX_WATCHLIST) {
    return { ok: false, reason: `Maksimal ${MAX_WATCHLIST} saham (free tier)` };
  }
  const next: WatchlistSnapshot = {
    codes: [...snap.codes, upper],
    updatedAt: new Date().toISOString(),
  };
  writeJson(WATCHLIST_KEY, next);
  return { ok: true };
}

export function watchlistRemove(kode: string): void {
  const upper = kode.toUpperCase();
  const snap = getWatchlist();
  if (!snap.codes.includes(upper)) return;
  const next: WatchlistSnapshot = {
    codes: snap.codes.filter((c) => c !== upper),
    updatedAt: new Date().toISOString(),
  };
  writeJson(WATCHLIST_KEY, next);
}

export function watchlistToggle(kode: string): { added: boolean; reason?: string } {
  const upper = kode.toUpperCase();
  if (getWatchlist().codes.includes(upper)) {
    watchlistRemove(upper);
    return { added: false };
  }
  const res = watchlistAdd(upper);
  return { added: res.ok, reason: res.reason };
}

export function isInWatchlist(kode: string): boolean {
  return getWatchlist().codes.includes(kode.toUpperCase());
}

export const WATCHLIST_LIMIT = MAX_WATCHLIST;

// ─── SUBSCRIBERS ─────────────────────────────────────────────────

/** Lightweight event bus for cross-component sync. */
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
/**
 * Auth + watchlist — backed by the remote API (lib/api.ts) for register.
 * Watchlist stays local (no backend yet).
 * The active session is persisted to localStorage so it survives reloads.
 */

import { api, type ApiError, type RegisterResponse } from "./api";

const USER_KEY = "beritainvestor:user";
const SETUP_TOKEN_KEY = "beritainvestor:setupToken";
const WATCHLIST_KEY = "beritainvestor:watchlist";
const MAX_WATCHLIST = 10;

export interface MockUser {
  /** Server-assigned user id (MongoDB-style). Empty for legacy local sessions. */
  id?: string;
  email: string;
  username: string;
  name: string;
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

/** Write JSON to localStorage safely. */
function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    // Tell other tabs / hook subscribers that storage changed.
    window.dispatchEvent(
      new CustomEvent("beritainvestor:storage", { detail: { key } }),
    );
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
    loggedInAt: response.user.createdAt,
    provider: "email",
    isEmailVerified: response.user.isEmailVerified,
  };
  writeJson(USER_KEY, session);
  if (response.setupToken) writeJson(SETUP_TOKEN_KEY, response.setupToken);
  return session;
}

/** Demo Google login (mock) — preserves the prior one-click sign-in. */
export function loginWithGoogle(): MockUser {
  const user: MockUser = {
    email: "investor.berita@gmail.com",
    username: "investor.berita",
    name: "Investor Berita",
    loggedInAt: new Date().toISOString(),
    provider: "google",
  };
  writeJson(USER_KEY, user);
  return user;
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
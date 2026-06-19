/**
 * Mock auth + watchlist — all client-side, persisted to localStorage.
 * No backend; do NOT use in production. The session is just a JSON blob.
 */

const USER_KEY = "beritainvestor:user";
const WATCHLIST_KEY = "beritainvestor:watchlist";
const MAX_WATCHLIST = 10;

export interface MockUser {
  email: string;
  name: string;
  /** ISO timestamp of when the session was created. */
  loggedInAt: string;
  /** Provider used at sign-in: "email" | "google". */
  provider: "email" | "google";
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
    window.dispatchEvent(new CustomEvent("beritainvestor:storage", { detail: { key } }));
  } catch {
    // Quota exceeded / storage disabled — fail silently.
  }
}

function removeKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent("beritainvestor:storage", { detail: { key } }));
  } catch {
    /* noop */
  }
}

// ─── AUTH ─────────────────────────────────────────────────────────

export function getCurrentUser(): MockUser | null {
  return readJson<MockUser>(USER_KEY);
}

export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}

export function loginWithEmail(email: string, _password: string): MockUser {
  // Pretend to validate. In reality any non-empty email + password works.
  if (!email || !email.includes("@")) {
    throw new Error("Email tidak valid");
  }
  if (!_password || _password.length < 4) {
    throw new Error("Password minimal 4 karakter");
  }
  const user: MockUser = {
    email,
    name: email.split("@")[0],
    loggedInAt: new Date().toISOString(),
    provider: "email",
  };
  writeJson(USER_KEY, user);
  return user;
}

export function loginWithGoogle(): MockUser {
  // Pretend to do an OAuth round-trip and come back authenticated.
  const user: MockUser = {
    email: "investor.berita@gmail.com",
    name: "Investor Berita",
    loggedInAt: new Date().toISOString(),
    provider: "google",
  };
  writeJson(USER_KEY, user);
  return user;
}

export function logout(): void {
  removeKey(USER_KEY);
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

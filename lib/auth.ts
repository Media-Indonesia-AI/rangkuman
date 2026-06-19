/**
 * Mock auth + watchlist — all client-side, persisted to localStorage.
 * No backend; do NOT use in production. The session is just a JSON blob.
 */

const USER_KEY = "beritainvestor:user";
const USERS_KEY = "beritainvestor:users";
const WATCHLIST_KEY = "beritainvestor:watchlist";
const MAX_WATCHLIST = 10;

export interface MockUser {
  email: string;
  username: string;
  name: string;
  /** ISO timestamp of when the session was created. */
  loggedInAt: string;
  /** Provider used at sign-in: "email" | "google". */
  provider: "email" | "google";
}

/** Stored credential record (kept separately from the active session). */
interface RegisteredUser {
  username: string;
  name: string;
  email: string;
  password: string;
  registeredAt: string;
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
  // Validate credentials against the registered users store.
  if (!email || !email.includes("@")) {
    throw new Error("Email tidak valid");
  }
  if (!_password || _password.length < 6) {
    throw new Error("Password minimal 6 karakter");
  }
  const registered = readJson<RegisteredUser[]>(USERS_KEY) ?? [];
  const match = registered.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
  // Demo: if no registered user exists, accept anyway (preserves demo-mode login).
  const user: MockUser = {
    email,
    username: match?.username ?? email.split("@")[0],
    name: match?.name ?? email.split("@")[0],
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
    username: "investor.berita",
    name: "Investor Berita",
    loggedInAt: new Date().toISOString(),
    provider: "google",
  };
  writeJson(USER_KEY, user);
  return user;
}

export function registerUser(input: {
  username: string;
  name: string;
  email: string;
  password: string;
}): MockUser {
  const username = input.username.trim();
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

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

  const existing = readJson<RegisteredUser[]>(USERS_KEY) ?? [];
  if (existing.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error("Username sudah dipakai");
  }
  if (existing.some((u) => u.email.toLowerCase() === email)) {
    throw new Error("Email sudah terdaftar");
  }

  const record: RegisteredUser = {
    username,
    name,
    email,
    password,
    registeredAt: new Date().toISOString(),
  };
  writeJson(USERS_KEY, [...existing, record]);

  const session: MockUser = {
    email,
    username,
    name,
    loggedInAt: new Date().toISOString(),
    provider: "email",
  };
  writeJson(USER_KEY, session);
  return session;
}

export function logout(): void {
  removeKey(USER_KEY);
}

/** RFC-5322-lite: at least one char, "@", at least one char, ".", at least one char. No whitespace. */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

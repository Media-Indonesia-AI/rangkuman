/**
 * Base HTTP transport for the Berita Investor API.
 *
 * Everything below this is the wire-level plumbing — base URL, auth
 * header, the generic `request<T>` wrapper, and the typed `ApiError`
 * it throws on non-2xx responses. Endpoint logic lives in category
 * modules:
 *
 *   - `./auth`    — register, login
 *   - `./stocks`  — getTopStocks, getTickers, getForeignStocks
 *   - `./market`  — getInterestRate, getExchangeRate
 *
 * The `api` object at the bottom composes those into one namespace so
 * existing call sites (`api.getTopStocks()`, etc.) keep working.
 */

import { login, register } from "./auth";
import { getExchangeRate, getInterestRate } from "./market";
import {
  getCompositeChart,
  getForeignStocks,
  getTickers,
  getTopStocks,
} from "./stocks";
import type { ApiError } from "./types/error";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://145.79.8.90:3007/v1/";

/**
 * Build the HTTP Basic auth header from the active session stored in
 * localStorage. The session object is written by `lib/auth.ts` on
 * register/login and includes the plaintext password — required because
 * the backend's auth scheme is `Authorization: Basic base64(email:password)`.
 *
 * Safe to call on the server — returns {} (no auth header).
 */
function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem("beritainvestor:user");
    if (!raw) return {};
    const session = JSON.parse(raw) as {
      email?: string;
      password?: string;
    };
    if (!session.email || !session.password) return {};
    const credentials = `${session.email}:${session.password}`;
    const encoded =
      typeof btoa === "function"
        ? btoa(credentials)
        : Buffer.from(credentials, "utf-8").toString("base64");
    return { Authorization: `Basic ${encoded}` };
  } catch {
    return {};
  }
}

/**
 * Low-level fetch wrapper used by every endpoint module. Exported so
 * category modules (`./auth`, `./stocks`, `./market`) can build
 * requests without duplicating auth header / error normalization.
 */
export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getAuthHeader(),
        ...(init.headers ?? {}),
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal terhubung ke server";
    throw { status: 0, message: `Network error: ${message}` } satisfies ApiError;
  }

  if (!res.ok) {
    let body: unknown;
    let message = `Request failed with status ${res.status}`;
    try {
      body = await res.json();
      const m = (body as { message?: string; error?: string }).message
        ?? (body as { error?: string }).error;
      if (m) message = m;
    } catch {
      /* non-JSON body — keep generic message */
    }
    throw { status: res.status, message, body } satisfies ApiError;
  }

  return (await res.json()) as T;
}

/** Local-tz today in `YYYY-MM-DD` — used as the default date param. */
export function todayIsoDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Composite API namespace. Auth + stocks + market endpoints, all
 * reached through the same `request<T>` transport above.
 */
export const api = {
  // Auth
  register,
  login,
  // Stocks
  getTopStocks,
  getTickers,
  getForeignStocks,
  getCompositeChart,
  // Market
  getInterestRate,
  getExchangeRate,
};
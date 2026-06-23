/**
 * Tiny fetch wrapper for the Berita Investor API.
 * All endpoints are namespaced under BASE_URL.
 *
 * In Next.js, NEXT_PUBLIC_* vars are inlined into the browser bundle at
 * build time and also available at runtime via process.env.
 */

import type {
  ApiError,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  TickersResponse,
  TopStocksResponse,
} from "./types";

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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
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

export const api = {
  register(body: RegisterRequest): Promise<RegisterResponse> {
    return request<RegisterResponse>("auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  login(body: LoginRequest): Promise<RegisterResponse> {
    return request<RegisterResponse>("auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  /** Fetch top gainers and top loosers. `limit` controls how many per group (default 5). */
  getTopStocks(limit = 5): Promise<TopStocksResponse> {
    const params = new URLSearchParams({ limit: String(limit) });
    return request<TopStocksResponse>(
      `stocks/top-stocks?${params.toString()}`,
      { method: "GET" },
    );
  },
  /** Fetch the full ticker catalog with latest price and day change. */
  getTickers(): Promise<TickersResponse> {
    return request<TickersResponse>("stocks/ticker", { method: "GET" });
  },
};

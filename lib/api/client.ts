/**
 * Tiny fetch wrapper for the Berita Investor API.
 * All endpoints are namespaced under BASE_URL.
 *
 * In Next.js, NEXT_PUBLIC_* vars are inlined into the browser bundle at
 * build time and also available at runtime via process.env.
 */

import type {
  ApiError,
  ExchangeRateResponse,
  InterestRate,
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
  /**
   * Fetch the BI Rate snapshot for a given date.
   * @param date ISO date string `YYYY-MM-DD`. Defaults to today (local TZ).
   */
  getInterestRate(date?: string): Promise<InterestRate> {
    const params = new URLSearchParams({ date: date ?? todayIsoDate() });
    return request<InterestRate>(
      `interest-rate?${params.toString()}`,
      { method: "GET" },
    );
  },
  /**
   * Fetch the latest exchange-rate snapshot. `base` is the base currency
   * code passed as a query param (defaults to `"idr"`). The response is
   * wrapped in `{ data: [snapshot] }` — read the first element to get
   * the per-currency rates.
   */
  getExchangeRate(base = "idr"): Promise<ExchangeRateResponse> {
    const params = new URLSearchParams({ currency: base });
    return request<ExchangeRateResponse>(
      `exchange-rate?${params.toString()}`,
      { method: "GET" },
    );
  },
};

/** Local-tz today in `YYYY-MM-DD` — used as the default `date` query param. */
function todayIsoDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

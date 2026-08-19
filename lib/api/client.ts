/**
 * Base HTTP transport for the Berita Investor API.
 *
 * Everything below this is the wire-level plumbing — base URL, auth
 * header, the generic `request<T>` wrapper, and the typed `ApiError`
 * it throws on non-2xx responses. Endpoint logic lives in category
 * modules:
 *
 *   - `./auth`     — register, login
 *   - `./stocks`   — getTopStocks, getTickers, getForeignStocks
 *   - `./market`   — getInterestRate, getExchangeRate
 *   - `./headline` — getTrendingStories, getHeadlines, getHeadlineById
 *   - `./story`    — getListStory
 *   - `./topic`    — getTopic
 *
 * The `api` object at the bottom composes those into one namespace so
 * existing call sites (`api.getTopStocks()`, etc.) keep working.
 */

import { login, register } from "./auth";
import {
  getHeadlineById,
  getHeadlines,
  getHeadlinesLast7Days,
  getMultiDateStories,
  getTrendingStories,
} from "./headline";
import { getExchangeRate, getInterestRate, getMarketMood } from "./market";
import { getCommodityCategories, getCommodityHistorical } from "./commodity";
import { getSectors } from "./sectors";
import {
  getCompositeChart,
  getForeignStocks,
  getIndexMover,
  getKeyMetrics,
  getStockHistorical,
  getStocksSearch,
  getStocksTrending,
  getTickerInformation,
  getTickerListArticles,
  getTickers,
  getTopStocks,
} from "./stocks";
import { getListStory } from "./story";
import { getTopic } from "./topic";
import { doReqTopup, getTopupBundle, getTransactionHistory, getWallet } from "./wallet";
import { addToWatchlist, deleteWatchlist, getWatchlist, updateWatchlist } from "./watchlist";
import type { ApiError } from "./types/error";
import { STORAGE_KEYS } from "@/lib/storageKeys";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1/";

/**
 * Pick the API base URL for an outbound request based on the runtime
 * environment.
 *
 * - **Client** → uses the public `NEXT_PUBLIC_API_BASE_URL` (or the
 *   `/api/v1/` fallback), resolved against the page origin by the
 *   browser. The Next.js middleware (`middleware.ts`) catches the
 *   `/api/*` prefix and forwards to `API_BACKEND_URL`, injecting the
 *   shared `X-Token` secret. This avoids exposing the backend host /
 *   token to the browser and skips CORS preflight.
 *
 * - **Server** → bypasses the middleware entirely and calls
 *   `API_BACKEND_URL` directly with the shared token. The server-side
 *   path matters for `generateMetadata()` (which runs in a Node
 *   fetch context, not a browser) — the relative `/api/v1/` URL
 *   would otherwise hit nginx in production, and nginx has no proxy
 *   for `/api/` (it only serves the static `.next/standalone/`
 *   output), so the fetch would 404. Calling the backend directly
 *   also avoids the double-hop (Next.js → middleware → backend).
 */
function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    const backend = process.env.API_BACKEND_URL;
    if (backend) return `${backend.replace(/\/+$/, "")}/v1/`;
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1/";
}

/**
 * Server-only header that authenticates the server-to-backend hop.
 * The browser never sees this — client requests go through the
 * middleware, which adds the same header. Returns `{}` on the
 * client (where `process.env.API_INTERNAL_TOKEN` is also undefined
 * since it's not `NEXT_PUBLIC_*`).
 */
function getInternalTokenHeader(): Record<string, string> {
  if (typeof window !== "undefined") return {};
  const token = process.env.API_INTERNAL_TOKEN;
  return token ? { "X-Token": token } : {};
}

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
    const raw = window.localStorage.getItem(STORAGE_KEYS.user);
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
  const url = `${getApiBaseUrl()}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getInternalTokenHeader(),
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

  // 204 No Content — RFC 7231: no body, so don't try to parse
  // JSON. Return `null` cast to T; callers handling endpoints that
  // may legitimately return 204 (e.g. `DELETE watchlist`) should
  // declare their return type as `T | null` and check the success
  // signal the mutation hook provides (not the body's presence).
  if (res.status === 204) {
    return null as T;
  }

  return (await res.json()) as T;
}

/**
 * Re-exported from `@/lib/util/formatDate` so existing call sites
 * (default date params in endpoint modules, hook defaults, etc.) keep
 * importing it from here without churn. The implementation lives with
 * the other date helpers now; behaviour is unchanged from the previous
 * in-place definition here.
 */
export { todayIsoDate } from "@/lib/util/formatDate";

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
  getIndexMover,
  getTickerInformation,
  getTickerListArticles,
  getKeyMetrics,
  getStockHistorical,
  getStocksSearch,
  getStocksTrending,
  getForeignStocks,
  getCompositeChart,
  // Market
  getInterestRate,
  getExchangeRate,
  getMarketMood,
  // Sectors
  getSectors,
  getCommodityCategories,
  getCommodityHistorical,
  // Headline
  getTrendingStories,
  getHeadlines,
  getHeadlineById,
  getHeadlinesLast7Days,
  getMultiDateStories,
  // Story
  getListStory,
  // Topic
  getTopic,
  // Wallet
  getTopupBundle,
  getWallet,
  getTransactionHistory,
  doReqTopup,
  // Watchlist
  getWatchlist,
  addToWatchlist,
  updateWatchlist,
  deleteWatchlist,
};
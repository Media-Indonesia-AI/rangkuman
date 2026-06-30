/**
 * Request-level cache + in-flight dedup for shared API calls.
 *
 * Multiple components on the same page (e.g. `LeftSidebar` and
 * `MobileTopMovers` on `/saham`, or any other combination) would
 * otherwise fire the same request several times per page load — once
 * per mount, doubled again by `reactStrictMode` in dev. Sharing a
 * single fetch via module-level state collapses it down to one network
 * round-trip.
 *
 * Only successful responses are cached. Errors clear the in-flight
 * slot so the next mount can retry.
 */

import { api } from "./client";
import type {
  ExchangeRateChartResponse,
  InterestRate,
} from "./types/market";
import type {
  CompositeChartResponse,
  ForeignStocksResponse,
  TickersResponse,
  TopStocksResponse,
} from "./types/stocks";
import type { TrendingStoriesResponse } from "./types/story";

let cachedTopStocks: TopStocksResponse | null = null;
let inflightTopStocks: Promise<TopStocksResponse> | null = null;

export function loadTopStocks(): Promise<TopStocksResponse> {
  if (cachedTopStocks !== null) return Promise.resolve(cachedTopStocks);
  if (inflightTopStocks !== null) return inflightTopStocks;
  inflightTopStocks = api
    .getTopStocks()
    .then((res) => {
      cachedTopStocks = res;
      return res;
    })
    .catch((err) => {
      inflightTopStocks = null; // allow retry on next mount
      throw err;
    });
  return inflightTopStocks;
}

let cachedTickers: TickersResponse | null = null;
let inflightTickers: Promise<TickersResponse> | null = null;

/** Read the currently cached ticker list without triggering a fetch. */
export function peekTickers(): TickersResponse | null {
  return cachedTickers;
}

export function loadTickers(): Promise<TickersResponse> {
  if (cachedTickers !== null) return Promise.resolve(cachedTickers);
  if (inflightTickers !== null) return inflightTickers;
  inflightTickers = api
    .getTickers()
    .then((res) => {
      cachedTickers = res;
      return res;
    })
    .catch((err) => {
      inflightTickers = null; // allow retry on next mount
      throw err;
    });
  return inflightTickers;
}

// ─── INTEREST RATE ──────────────────────────────────────────────

/** Per-date cache for `getInterestRate`. Different dates get different slots. */
const cachedInterestRates = new Map<string, InterestRate>();
const inflightInterestRates = new Map<string, Promise<InterestRate>>();

/** Local-tz today in `YYYY-MM-DD` — default date when caller passes none. */
function todayIsoDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Fetch the BI Rate snapshot for a given date, with request-level dedup.
 * Concurrent and subsequent callers for the same date share one network
 * round-trip. Only successful responses are cached; errors clear the
 * in-flight slot so the next mount can retry.
 *
 * @param date ISO date string `YYYY-MM-DD`. Defaults to today (local TZ).
 */
export function loadInterestRate(date?: string): Promise<InterestRate> {
  const d = date ?? todayIsoDate();
  const cached = cachedInterestRates.get(d);
  if (cached) return Promise.resolve(cached);
  const inflight = inflightInterestRates.get(d);
  if (inflight) return inflight;
  const promise = api
    .getInterestRate(d)
    .then((res) => {
      cachedInterestRates.set(d, res);
      return res;
    })
    .catch((err) => {
      inflightInterestRates.delete(d); // allow retry on next mount
      throw err;
    });
  inflightInterestRates.set(d, promise);
  return promise;
}

// ─── EXCHANGE RATE ──────────────────────────────────────────────

/** Per-(initialCurrency, exchange) cache for `getExchangeRate`. Different
 *  currency pairs get different slots; concurrent calls for the same pair
 *  share one network round-trip. */
const cachedExchangeRates = new Map<string, ExchangeRateChartResponse>();
const inflightExchangeRates = new Map<
  string,
  Promise<ExchangeRateChartResponse>
>();

/** Cache key for a given currency pair. */
function exchangeRateKey(initialCurrency: string, exchange: string): string {
  return `${initialCurrency}|${exchange}`;
}

/**
 * Fetch the historical exchange-rate series for a currency pair, with
 * request-level dedup. Concurrent and subsequent callers for the same
 * pair share one network round-trip. Only successful responses are
 * cached; errors clear the in-flight slot so the next mount can retry.
 *
 * @param initialCurrency Base currency code (default `"idr"`).
 * @param exchange       Counter currency code (default `"usd"`).
 *                       The response is a time series of `{ date, rate }`
 *                       points — see `ExchangeRateChartResponse`.
 */
export function loadExchangeRate(
  initialCurrency = "idr",
  exchange = "usd",
): Promise<ExchangeRateChartResponse> {
  const key = exchangeRateKey(initialCurrency, exchange);
  const cached = cachedExchangeRates.get(key);
  if (cached) return Promise.resolve(cached);
  const inflight = inflightExchangeRates.get(key);
  if (inflight) return inflight;
  const promise = api
    .getExchangeRate(initialCurrency, exchange)
    .then((res) => {
      cachedExchangeRates.set(key, res);
      return res;
    })
    .catch((err) => {
      inflightExchangeRates.delete(key); // allow retry on next mount
      throw err;
    });
  inflightExchangeRates.set(key, promise);
  return promise;
}

// ─── FOREIGN FLOW ──────────────────────────────────────────────

/** Per-(startDate,endDate) cache for `getForeignStocks`. Different
 *  ranges get different slots; concurrent calls for the same range
 *  share one network round-trip. */
const cachedForeignStocks = new Map<string, ForeignStocksResponse>();
const inflightForeignStocks = new Map<string, Promise<ForeignStocksResponse>>();

/** Cache key for a given date range. Empty range = "default (today only)". */
function foreignStocksKey(startDate?: string, endDate?: string): string {
  return `${startDate ?? ""}|${endDate ?? ""}`;
}

/** Shift an ISO date string (`YYYY-MM-DD`) by `days`, local-tz. */
function shiftIsoDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** How many days we walk back looking for a non-503 response before giving up. */
const MAX_FALLBACK_ATTEMPTS = 5;

/**
 * Fetch with automatic 1-day date-shift fallback. The API returns 503
 * when it has no data for the most recent session yet (typical before
 * market close on the latest trading day). On 503 we shift both
 * `startDate` and `endDate` back by 1 day and retry, up to
 * `MAX_FALLBACK_ATTEMPTS` times.
 *
 * `undefined` start/end dates are normalized to today up-front (using
 * the same `todayIsoDate()` helper as the underlying client) so the
 * shift has a concrete base — otherwise the first 503 would re-send
 * the same `undefined` dates, which the client would re-resolve to
 * "today" again, defeating the fallback.
 */
function fetchForeignStocksWithFallback(
  startDate?: string,
  endDate?: string,
  attempt = 0,
): Promise<ForeignStocksResponse> {
  const effectiveStart = startDate ?? todayIsoDate();
  const effectiveEnd = endDate ?? todayIsoDate();
  const s = shiftIsoDate(effectiveStart, -attempt);
  const e = shiftIsoDate(effectiveEnd, -attempt);
  return api.getForeignStocks(s, e).catch((err: { status?: number }) => {
    if (err?.status === 503 && attempt < MAX_FALLBACK_ATTEMPTS) {
      return fetchForeignStocksWithFallback(
        startDate,
        endDate,
        attempt + 1,
      );
    }
    throw err;
  });
}

// ─── COMPOSITE CHART ──────────────────────────────────────────

/** Per-period cache for `getCompositeChart`. Different periods get
 *  different slots; concurrent calls for the same period share one
 *  network round-trip. */
const cachedCompositeCharts = new Map<string, CompositeChartResponse>();
const inflightCompositeCharts = new Map<
  string,
  Promise<CompositeChartResponse>
>();

/**
 * Fetch the composite-chart price series for a given period, with
 * request-level dedup. Concurrent and subsequent callers for the
 * same period share one network round-trip. Only successful responses
 * are cached; errors clear the in-flight slot so the next mount can
 * retry.
 *
 * @param period Time-window code (default `"1D"`). Exact accepted
 *               values are determined by the backend.
 */
export function loadCompositeChart(
  period = "1D",
): Promise<CompositeChartResponse> {
  const cached = cachedCompositeCharts.get(period);
  if (cached) return Promise.resolve(cached);
  const inflight = inflightCompositeCharts.get(period);
  if (inflight) return inflight;
  const promise = api
    .getCompositeChart(period)
    .then((res) => {
      cachedCompositeCharts.set(period, res);
      return res;
    })
    .catch((err) => {
      inflightCompositeCharts.delete(period); // allow retry on next mount
      throw err;
    });
  inflightCompositeCharts.set(period, promise);
  return promise;
}

// ─── TRENDING STORIES ──────────────────────────────────────────

/** Per-(limit, source) cache for `getTrendingStories`. */
const cachedTrendingStories = new Map<string, TrendingStoriesResponse>();
const inflightTrendingStories = new Map<
  string,
  Promise<TrendingStoriesResponse>
>();

/** Cache key for a given (limit, source) pair. */
function trendingStoriesKey(limit: number, source: string): string {
  return `${limit}|${source}`;
}

/**
 * Fetch the trending-stories snapshot for a given limit + source, with
 * request-level dedup. Concurrent and subsequent callers for the same
 * tuple share one network round-trip. Only successful responses are
 * cached; errors clear the in-flight slot so the next mount can retry.
 *
 * @param limit  How many stories to fetch (default 20).
 * @param source Source identifier for the feed (default `"sahamrakyat"`).
 */
export function loadTrendingStories(
  limit = 20,
  source = "sahamrakyat",
): Promise<TrendingStoriesResponse> {
  const key = trendingStoriesKey(limit, source);
  const cached = cachedTrendingStories.get(key);
  if (cached) return Promise.resolve(cached);
  const inflight = inflightTrendingStories.get(key);
  if (inflight) return inflight;
  const promise = api
    .getTrendingStories(limit, source)
    .then((res) => {
      cachedTrendingStories.set(key, res);
      return res;
    })
    .catch((err) => {
      inflightTrendingStories.delete(key); // allow retry on next mount
      throw err;
    });
  inflightTrendingStories.set(key, promise);
  return promise;
}

/**
 * Fetch foreign-investor buy/sell flow for a date range, with
 * request-level dedup and 1-day date-shift fallback on 503.
 *
 * Concurrent and subsequent callers for the same range share one
 * network chain (including any retries). Only successful responses
 * are cached — and they are cached under the ORIGINAL key, so
 * subsequent calls for today get yesterday's data without re-trying.
 * Errors clear the in-flight slot so the next mount can retry.
 *
 * @param startDate ISO date string `YYYY-MM-DD` (defaults to today).
 * @param endDate ISO date string `YYYY-MM-DD` (defaults to today).
 */
export function loadForeignStocks(
  startDate?: string,
  endDate?: string,
): Promise<ForeignStocksResponse> {
  const key = foreignStocksKey(startDate, endDate);
  const cached = cachedForeignStocks.get(key);
  if (cached) return Promise.resolve(cached);
  const inflight = inflightForeignStocks.get(key);
  if (inflight) return inflight;
  const promise = fetchForeignStocksWithFallback(startDate, endDate)
    .then((res) => {
      cachedForeignStocks.set(key, res);
      return res;
    })
    .catch((err) => {
      inflightForeignStocks.delete(key); // allow retry on next mount
      throw err;
    });
  inflightForeignStocks.set(key, promise);
  return promise;
}
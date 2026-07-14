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
  InterestRate
} from "./types/market";
import { MarketMood } from "./types/moods";
import type {
  CompositeChartResponse,
  ForeignStocksResponse,
  TickersResponse,
  TopStocksResponse,
} from "./types/stocks";
import type {
  TrendingStoriesResponse,
  StoryFilter,
  StoryListResponse,
  StoryResponse,
  TopicResponse,
} from "./types/story";
import type { HeadlineDetail } from "./types/headline";

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

// ─── MARKET MOOD ────────────────────────────────────────────────

let cachedMarketMood: MarketMood | null = null;
let inflightMarketMood: Promise<MarketMood> | null = null;

/**
 * Fetch the composite market-mood snapshot, with request-level dedup.
 * Concurrent and subsequent callers share one network round-trip.
 * Only successful responses are cached; errors clear the in-flight
 * slot so the next mount can retry.
 */
export function loadMarketMood(): Promise<MarketMood> {
  if (cachedMarketMood !== null) return Promise.resolve(cachedMarketMood);
  if (inflightMarketMood !== null) return inflightMarketMood;
  inflightMarketMood = api
    .getMarketMood()
    .then((res) => {
      cachedMarketMood = res;
      return res;
    })
    .catch((err) => {
      inflightMarketMood = null; // allow retry on next mount
      throw err;
    });
  return inflightMarketMood;
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

/** Per-`limit` cache for `getTrendingStories`. */
const cachedTrendingStories = new Map<string, TrendingStoriesResponse>();
const inflightTrendingStories = new Map<
  string,
  Promise<TrendingStoriesResponse>
>();

/** Cache key for a given `limit`. */
function trendingStoriesKey(limit: number): string {
  return String(limit);
}

/**
 * Fetch the trending-stories snapshot for a given limit, with
 * request-level dedup. Concurrent and subsequent callers for the same
 * limit share one network round-trip. Only successful responses are
 * cached; errors clear the in-flight slot so the next mount can retry.
 *
 * @param limit  How many stories to fetch (default 20).
 */
export function loadTrendingStories(
  limit = 20,
): Promise<TrendingStoriesResponse> {
  const key = trendingStoriesKey(limit);
  const cached = cachedTrendingStories.get(key);
  if (cached) return Promise.resolve(cached);
  const inflight = inflightTrendingStories.get(key);
  if (inflight) return inflight;
  const promise = api
    .getTrendingStories(limit)
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

// ─── HEADLINES LIST ────────────────────────────────────────────

/** Per-(limit, skip, filters) cache for `getHeadlines`. Different tuples
 *  get different slots; concurrent calls for the same tuple share one
 *  network round-trip. */
const cachedHeadlines = new Map<string, StoryResponse>();
const inflightHeadlines = new Map<string, Promise<StoryResponse>>();

/** Cache key for a given (limit, skip, filters) tuple. The filter list
 *  is JSON-encoded into the key so callers with structurally-equal
 *  filters share a slot. */
function headlinesKey(
  limit: number,
  skip: number,
  filters: StoryFilter[],
): string {
  return `${limit}|${skip}|${JSON.stringify(filters)}`;
}

/**
 * Fetch the headlines list for a (limit, skip, filters) tuple, with
 * request-level dedup. Concurrent and subsequent callers for the same
 * tuple share one network round-trip. Only successful responses are
 * cached; errors clear the in-flight slot so the next mount can retry.
 *
 * @param limit   How many headlines to return (default 10).
 * @param skip    How many headlines to skip from the start of the result
 *                set, for pagination (default 0).
 * @param filters Structured `{ field, operator, value }` filters
 *                (default `[]`). Same list passed twice always lands on
 *                the same cache slot.
 */
export function loadHeadlines(
  limit = 10,
  skip = 0,
  filters: StoryFilter[] = [],
): Promise<StoryResponse> {
  const key = headlinesKey(limit, skip, filters);
  const cached = cachedHeadlines.get(key);
  if (cached) return Promise.resolve(cached);
  const inflight = inflightHeadlines.get(key);
  if (inflight) return inflight;
  const promise = api
    .getHeadlines(limit, skip, filters)
    .then((res) => {
      cachedHeadlines.set(key, res);
      return res;
    })
    .catch((err) => {
      inflightHeadlines.delete(key); // allow retry on next mount
      throw err;
    });
  inflightHeadlines.set(key, promise);
  return promise;
}

// ─── TOPIC LIST ────────────────────────────────────────────────

/** Per-(limit, skip, filters) cache for `getTopic`. Same shape as the
 *  story-list cache; isolated so its keys can't collide with stories. */
const cachedTopics = new Map<string, TopicResponse>();
const inflightTopics = new Map<string, Promise<TopicResponse>>();

/** Cache key for a given (limit, skip, filters) tuple. Mirrors
 *  `storyKey` so callers with structurally-equal filters share a slot. */
function topicKey(
  limit: number,
  skip: number,
  filters: StoryFilter[],
): string {
  return `${limit}|${skip}|${JSON.stringify(filters)}`;
}

/**
 * Fetch the topic list for a (limit, skip, filters) tuple, with
 * request-level dedup. Concurrent and subsequent callers for the same
 * tuple share one network round-trip. Only successful responses are
 * cached; errors clear the in-flight slot so the next mount can retry.
 *
 * @param limit   How many topics to return (default 10).
 * @param skip    How many topics to skip (default 0, matching the
 *                backend's `getTopic` default after the latest spec
 *                change).
 * @param filters Structured `{ field, operator, value }` filters
 *                (default `[]`).
 */
export function loadTopic(
  limit = 10,
  skip = 0,
  filters: StoryFilter[] = [],
): Promise<TopicResponse> {
  const key = topicKey(limit, skip, filters);
  const cached = cachedTopics.get(key);
  if (cached) return Promise.resolve(cached);
  const inflight = inflightTopics.get(key);
  if (inflight) return inflight;
  const promise = api
    .getTopic(limit, skip, filters)
    .then((res) => {
      cachedTopics.set(key, res);
      return res;
    })
    .catch((err) => {
      inflightTopics.delete(key); // allow retry on next mount
      throw err;
    });
  inflightTopics.set(key, promise);
  return promise;
}

// ─── STORIES LIST ──────────────────────────────────────────────

/** Per-(limit, skip, filters) cache for `getListStory`. Same shape as
 *  the headlines-list / topic-list caches; isolated so its keys can't
 *  collide with the others even when (limit, skip, filters) tuples
 *  happen to match. */
const cachedListStories = new Map<string, StoryListResponse>();
const inflightListStories = new Map<string, Promise<StoryListResponse>>();

/** Cache key for a given (limit, skip, filters) tuple. Mirrors
 *  `headlinesKey` and `topicKey` so structurally-equal filter lists
 *  share a slot. */
function listStoryKey(
  limit: number,
  skip: number,
  filters: StoryFilter[],
): string {
  return `${limit}|${skip}|${JSON.stringify(filters)}`;
}

/**
 * Fetch the stories list for a (limit, skip, filters) tuple, with
 * request-level dedup. Concurrent and subsequent callers for the
 * same tuple share one network round-trip. Only successful responses
 * are cached; errors clear the in-flight slot so the next mount can
 * retry.
 *
 * Typical use: filter by `headline_id` to fetch the related stories
 * for a deep-linked headline. The hook `useListStory` is the
 * React-friendly wrapper that adds state + cancel-on-unmount.
 *
 * @param limit   How many stories to return (default 10, matching
 *                the backend's default).
 * @param skip    How many stories to skip (default 0).
 * @param filters Structured `{ field, operator, value }` filters
 *                (default `[]`). Same list passed twice always
 *                lands on the same cache slot.
 */
export function loadListStory(
  limit = 10,
  skip = 0,
  filters: StoryFilter[] = [],
): Promise<StoryListResponse> {
  const key = listStoryKey(limit, skip, filters);
  const cached = cachedListStories.get(key);
  if (cached) return Promise.resolve(cached);
  const inflight = inflightListStories.get(key);
  if (inflight) return inflight;
  const promise = api
    .getListStory(limit, skip, filters)
    .then((res) => {
      cachedListStories.set(key, res);
      return res;
    })
    .catch((err) => {
      inflightListStories.delete(key); // allow retry on next mount
      throw err;
    });
  inflightListStories.set(key, promise);
  return promise;
}

// ─── HEADLINE DETAIL ───────────────────────────────────────────

/** Per-`id` cache for `getHeadlineById`. Different IDs get different
 *  slots; concurrent calls for the same ID share one network
 *  round-trip. */
const cachedHeadlineDetails = new Map<string, HeadlineDetail>();
const inflightHeadlineDetails = new Map<string, Promise<HeadlineDetail>>();

/**
 * Fetch a single headline's full detail (with related stories) by
 * ID, with request-level dedup. Concurrent and subsequent callers
 * for the same ID share one network round-trip. Only successful
 * responses are cached; errors clear the in-flight slot so the next
 * mount can retry.
 *
 * @param id Headline ID (e.g. mongo-style hash from a list response).
 */
export function loadHeadlineById(
  id: string,
): Promise<HeadlineDetail> {
  const cached = cachedHeadlineDetails.get(id);
  if (cached) return Promise.resolve(cached);
  const inflight = inflightHeadlineDetails.get(id);
  if (inflight) return inflight;
  const promise = api
    .getHeadlineById(id)
    .then((res) => {
      cachedHeadlineDetails.set(id, res);
      return res;
    })
    .catch((err) => {
      inflightHeadlineDetails.delete(id); // allow retry on next mount
      throw err;
    });
  inflightHeadlineDetails.set(id, promise);
  return promise;
}
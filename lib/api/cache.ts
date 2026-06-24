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
import type { InterestRate, TickersResponse, TopStocksResponse } from "./types";

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
/**
 * Stock-domain API endpoints.
 *
 * These methods all hit `/stocks/*` and are grouped here for clean
 * separation from auth (`register`/`login`) and market-data
 * (`getInterestRate`/`getExchangeRate`) in `lib/api/client.ts`.
 *
 * The functions are individually re-exported and consumed by the
 * composite `api` object in `./client.ts`, so existing call sites
 * (`api.getTopStocks()` etc.) keep working unchanged.
 */

import { request, todayIsoDate } from "./client";
import type {
  CompositeChartResponse,
  ForeignStocksResponse,
  IndexMoverResponse,
  KeyMetrics,
  StockHistoricalResponse,
  StocksTrendingResponse,
  TickerInformation,
  TickersResponse,
  TopStocksResponse,
} from "./types/stocks";

/** Fetch top gainers and top loosers. `limit` controls how many per group (default 5). */
export function getTopStocks(limit = 5): Promise<TopStocksResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  return request<TopStocksResponse>(
    `stocks/top-stocks?${params.toString()}`,
    { method: "GET" },
  );
}

/** Fetch the full ticker catalog with latest price and day change. */
export function getTickers(): Promise<TickersResponse> {
  return request<TickersResponse>("stocks/ticker", { method: "GET" });
}

/**
 * Fetch the top index movers — stocks ranked by their contribution
 * to the composite index. `limit` controls how many are returned
 * (default 10).
 */
export function getIndexMover(limit = 10): Promise<IndexMoverResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  return request<IndexMoverResponse>(
    `stocks/index-mover?${params.toString()}`,
    { method: "GET" },
  );
}

/**
 * Fetch foreign-investor buy/sell flow over a date range.
 * @param startDate ISO date string `YYYY-MM-DD`. Defaults to today.
 * @param endDate ISO date string `YYYY-MM-DD`. Defaults to today.
 */
export function getForeignStocks(
  startDate?: string,
  endDate?: string,
): Promise<ForeignStocksResponse> {
  const params = new URLSearchParams({
    start_date : startDate ?? todayIsoDate(),
    end_date: endDate ?? todayIsoDate(),
  });
  return request<ForeignStocksResponse>(
    `stocks/foreign-stocks?${params.toString()}`,
    { method: "GET" },
  );
}

/**
 * Fetch the composite-chart price series for a given period.
 * @param period Time-window code (default `"1D"`). Common values:
 *               `"1D"`, `"5D"`, `"1M"`, `"3M"`, `"6M"`, `"1Y"`, `"YTD"`, `"ALL"`,
 *               plus intraday like `"1H"`. Exact accepted values are
 *               determined by the backend.
 */
export function getCompositeChart(
  period = "1D",
): Promise<CompositeChartResponse> {
  const params = new URLSearchParams({ period });
  return request<CompositeChartResponse>(
    `stocks/composite-chart?${params.toString()}`,
    { method: "GET" },
  );
}

/**
 * Fetch composite ticker information — current price, day change,
 * sector, and a list of related stocks (peers in the same sector).
 *
 * `@param ticker` Ticker code (e.g. `"ANTM"`). Uppercased before
 *                 being inserted into the URL so callers can pass
 *                 either case consistently.
 */
export function getTickerInformation(
  ticker: string,
): Promise<TickerInformation> {
  const code = ticker.toUpperCase();
  return request<TickerInformation>(
    `stocks/ticker-information/${encodeURIComponent(code)}`,
    { method: "GET" },
  );
}

/**
 * Fetch key financial metrics for a given ticker — market cap,
 * P/E, volume, dividend yield, beta, and day-change percent.
 *
 * `@param ticker` Ticker code (e.g. `"ANTM"`). Uppercased before
 *                 being inserted into the URL so callers can pass
 *                 either case consistently.
 */
export function getKeyMetrics(
  ticker: string,
): Promise<KeyMetrics> {
  const code = ticker.toUpperCase();
  return request<KeyMetrics>(
    `stocks/key-metrics/${encodeURIComponent(code)}`,
    { method: "GET" },
  );
}

/**
 * Fetch the historical daily price series for a given ticker.
 *
 * The backend takes the ticker as a query param (not a path
 * segment like `key-metrics`), so it ends up in the URL after
 * `?`. The ticker is uppercased before being inserted so callers
 * can pass either case consistently.
 *
 * `@param ticker` Ticker code, e.g. `"ANTM"`.
 */
export function getStockHistorical(
  ticker: string,
): Promise<StockHistoricalResponse> {
  const code = ticker.toUpperCase();
  const params = new URLSearchParams({ ticker: code });
  return request<StockHistoricalResponse>(
    `stocks/stock/historical?${params.toString()}`,
    { method: "GET" },
  );
}

/**
 * Fetch the day's trending tickers — stocks with the most
 * editorial coverage, each paired with an AI-written summary,
 * a per-source article breakdown, and the day's price move.
 *
 * Powered by the `stocks/stock/trending` endpoint. `date` is sent as
 * a full ISO 8601 date-time, while `page` and `limit` are pagination
 * controls that default to the first page of 20 rows. `limit` is forwarded as-is rather
 * than capped here so callers can paginate beyond the default
 * when they need a deeper window.
 *
 * Called from the desktop sidebar rail and the mobile top-movers
 * strip; the response shape is `{ data: StockTrendingItem[] }`
 * (same wire envelope as `TopStocksResponse` / `StockHistoricalResponse`).
 *
 * @param dateTime ISO 8601 date-time. Date-only values (`YYYY-MM-DD`)
 *                 are normalized to UTC midnight. Defaults to now.
 * @param page     1-indexed page number (default 1).
 * @param limit    Page size (default 20).
 */
export function getStocksTrending(
  date = new Date(),
  page = 1,
  limit = 20,
): Promise<StocksTrendingResponse> {
  const params = new URLSearchParams({
    date: String(date),
    page: String(page),
    limit: String(limit),
  });
  return request<StocksTrendingResponse>(
    `stocks/stock/trending?${params.toString()}`,
    { method: "GET" },
  );
}
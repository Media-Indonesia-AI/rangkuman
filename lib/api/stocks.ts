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
import type { StoryFilter } from "./types/story";
import type {
  CompositeChartResponse,
  ForeignStocksResponse,
  IndexMoverResponse,
  KeyMetrics,
  StockHistoricalResponse,
  StocksSearchResponse,
  StocksTrendingResponse,
  TickerInformation,
  TickerListResponse,
  TickersResponse,
  TopStocksResponse,
} from "./types/stocks";

/**
 * Numeric offset for the Indonesia Stock Exchange (IDX) — trades on
 * WIB (Asia/Jakarta). Indonesia does not observe DST, so the offset
 * is fixed at +07:00 year-round. The stocks API only ever deals with
 * IDX calendar days, so we hard-code this instead of reading the
 * system timezone (which on a non-Asia/Jakarta server would silently
 * shift the wire form).
 */
const WIB_OFFSET = "+07:00";

/**
 * Normalize a date value to a query-string parameter.
 *
 * The stocks API is anchored to IDX / WIB, so a date-only input is
 * emitted as midnight at the project's fixed offset rather than
 * UTC midnight (which would silently shift the calendar day for
 * non-UTC users) or a bare `YYYY-MM-DD` (which leaves the timezone
 * implicit and forces the backend to guess). The wire form is
 * always timezone-explicit.
 *
 * - Date-only (`YYYY-MM-DD`): emitted as `YYYY-MM-DDT00:00:00+07:00`.
 *   e.g. `2026-07-30` → `2026-07-30T00:00:00+07:00`.
 * - Date-time (already carrying `Z` or a numeric offset, e.g.
 *   `2026-07-30T07:00:00+07:00`): the caller has specified an
 *   instant, so normalize to canonical ISO 8601 UTC for the wire.
 * - Anything that doesn't parse: returned verbatim, so the request
 *   fails at the backend with a clear date error rather than
 *   silently emitting `Invalid Date`.
 */
function toIsoDateTime(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00${WIB_OFFSET}`;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}

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

/** Search stocks by ticker or company name. */
export function getStocksSearch(
  q: string,
  limit = 20,
): Promise<StocksSearchResponse> {
  const params = new URLSearchParams({
    q,
    limit: String(limit),
  });
  return request<StocksSearchResponse>(
    `stocks/search?${params.toString()}`,
    { method: "GET" },
  );
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
 * @param startDate ISO date or date-time. Defaults to today.
 * @param endDate ISO date or date-time. Defaults to today.
 */
export function getForeignStocks(
  startDate?: string,
  endDate?: string,
): Promise<ForeignStocksResponse> {
  const params = new URLSearchParams({
    start_date: toIsoDateTime(startDate ?? todayIsoDate()),
    end_date: toIsoDateTime(endDate ?? todayIsoDate()),
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
  date: string = todayIsoDate(),
): Promise<TickerInformation> {
  const code = ticker.toUpperCase();
  const params = new URLSearchParams({ date });
  return request<TickerInformation>(
    `stocks/ticker-information/${encodeURIComponent(code)}?${params.toString()}`,
    { method: "GET" },
  );
}

/**
 * Fetch the list of ticker-tagged articles.
 *
 * @param limit   Page size (default 20).
 * @param page    Page index (default 0).
 * @param filters Structured `{ field, operator, value }` filters to
 *                narrow the result set (default `[]`). The list is
 *                JSON-encoded into a single `filters` query param, e.g.
 *                `filters=[{"field":"stock_ticker","operator":"eq","value":"ANTM"}]`.
 *                Empty list omits the param entirely.
 */
export function getTickerListArticles(
  limit = 20,
  page = 0,
  filters: StoryFilter[] = [],
): Promise<TickerListResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    skip: String(page),
  });
  if (filters.length > 0) {
    params.set("filters", JSON.stringify(filters));
  }
  return request<TickerListResponse>(
    `stocks/ticker-information?${params.toString()}`,
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
 *                 are emitted as midnight at the project timezone
 *                 (`00:00:00+07:00`, WIB). Defaults to now.
 * @param page     1-indexed page number (default 1).
 * @param limit    Page size (default 20).
 */
export function getStocksTrending(
  dateTime: string = new Date().toISOString(),
  page = 1,
  limit = 20,
): Promise<StocksTrendingResponse> {
  const normalizedDateTime = toIsoDateTime(dateTime);
  const params = new URLSearchParams({
    date: normalizedDateTime,
    page: String(page),
    limit: String(limit),
  });
  return request<StocksTrendingResponse>(
    `stocks/stock/trending?${params.toString()}`,
    { method: "GET" },
  );
}
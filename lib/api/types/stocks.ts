/**
 * Types for `/stocks/*` endpoints — top-stocks, tickers, foreign flow.
 * Consumed by `../stocks.ts` (request functions) and downstream
 * components (`LeftSidebar`, `MobileTopMovers`, `TopTicker`,
 * `MarketMood`).
 */

// ─── TOP STOCKS ──────────────────────────────────────────────────

export interface TopStockItem {
  ticker: string;
  company_name: string;
  price: number;
  percent_change: number;
}

export type TopStockGroupType = "top-gainer" | "top-looser";

export interface TopStockGroup {
  type: TopStockGroupType;
  stocks: TopStockItem[];
}

/** Wire format the backend actually returns: `{ data: [...] }`. */
export interface TopStocksResponse {
  data: TopStockGroup[];
}

// ─── TICKERS ─────────────────────────────────────────────────────

/** Single entry from GET stocks/ticker — latest price and day change. */
export interface TickerItem {
  ticker: string;
  company_name: string;
  price: number;
  percent_change: number;
}

/** Wire format the backend actually returns: `{ data: [...] }`. */
export interface TickersResponse {
  data: TickerItem[];
}

// ─── FOREIGN FLOW ───────────────────────────────────────────────

/**
 * One row of foreign-flow data — either an aggregate `summary` (with
 * `stock_code = ""`) or a per-ticker `rows[]` entry.
 *
 * Values are in shares (volume) and IDR (value). `net_*` fields are
 * signed: positive = net foreign buy, negative = net foreign sell.
 */
export interface ForeignStockFlow {
  /** Ticker code (e.g. `"BBCA"`); empty string `""` for the summary row. */
  stock_code: string;
  /** Shares bought by foreign investors. */
  buy_volume: number;
  /** IDR value of foreign buys. */
  buy_value: number;
  /** Shares sold by foreign investors. */
  sell_volume: number;
  /** IDR value of foreign sells. */
  sell_value: number;
  /** Buy volume − sell volume (signed). */
  net_volume: number;
  /** Buy value − sell value (signed). */
  net_value: number;
}

/** Wire format for `GET stocks/foreign-stocks`. */
export interface ForeignStocksResponse {
  /** Aggregate foreign flow across all tickers. */
  summary: ForeignStockFlow;
  /** Per-ticker foreign flow, one entry per stock. */
  rows: ForeignStockFlow[];
}

// ─── COMPOSITE CHART ──────────────────────────────────────────

/**
 * One OHLC-light data point on the composite-chart series.
 *
 * `dateTime` is an ISO 8601 timestamp from the server (UTC, e.g.
 * `"2026-06-24T08:00:00.000Z"`). `price` is a float; consumers
 * should not assume a fixed decimal precision.
 */
export interface CompositeChartPoint {
  dateTime: string;
  price: number;
}

/** Wire format for `GET stocks/composite-chart` — a bare array, no wrapper. */
export type CompositeChartResponse = CompositeChartPoint[];
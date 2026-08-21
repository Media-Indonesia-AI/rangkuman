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

/** One ticker returned by `GET stocks/search`. */
export interface StockSearchItem {
  ticker: string;
  company_name: string;
}

/** Wire format for `GET stocks/search`. */
export interface StocksSearchResponse {
  data: StockSearchItem[];
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
  price: number;
  price_change: number;
}

/** Wire format for `GET stocks/composite-chart` — a bare array, no wrapper. */
export type CompositeChartResponse = CompositeChartPoint[];

// ─── TICKER INFORMATION ────────────────────────────────────────

/**
 * One row of "related stocks" surfaced alongside a ticker's
 * information — usually peer companies in the same sector.
 *
 * `name` is the ticker code (e.g. `"INAI"`); `notation` is the
 * board/symbol marker the backend sends (often empty for main-board
 * listings); `company_name` is the full legal name.
 *
 * `pct_change` is the day-change percent (signed; positive = up).
 * Note: this endpoint uses `pct_change`, whereas `TopStockItem`
 * uses `percent_change` — different endpoints, different field
 * names. Match the wire format exactly.
 */
export interface RelatedStock {
  name: string;
  notation: string;
  company_name: string;
  price: number;
  pct_change: number;
}

/**
 * Composite payload for `GET stocks/ticker-information/{ticker}`.
 * Returned unwrapped (no `{ data: ... }` envelope) — same shape as
 * `ForeignStocksResponse`.
 *
 * `pct_change` is the ticker's day-change percent (signed).
 * `related_stocks` lists peers in the same sector for the "ticker
 * detail" panel.
 */
export interface TickerInformation {
  sector_name: string;
  company_name: string;
  description: string;
  price: number;
  pct_change: number;
  related_stocks: RelatedStock[];
  articles: TickerArticles[];
}

export interface TickerArticles {
  id: string;
  title: string;
  source_name: string;
  source_url: string;
  recap_date: string;
  content: string;
}

export interface TickerListResponse {
  data: TickerListItem[];
}

export interface TickerListItem {
  id: string;
  ticker: string;
  recap_date: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// ─── KEY METRICS ────────────────────────────────────────────────

/**
 * Composite payload for `GET stocks/key-metrics/{ticker}`.
 * Returned unwrapped (no `{ data: ... }` envelope) — same shape as
 * `TickerInformation` and `ForeignStocksResponse`.
 *
 * All numeric fields are floats as the backend returns them; the
 * consumer formats per-locale. `pct_change` is signed (positive =
 * up) and matches the field name used by `TickerInformation` and
 * `RelatedStock` — *not* `percent_change` (the `TopStockItem` /
 * `TickerItem` field name).
 */
export interface KeyMetrics {
  /** Market capitalization, in IDR (raw, unformatted). */
  market_cap: number;
  /** Trailing price-to-earnings ratio. */
  pe_ratio: number;
  /** Day trading volume, in shares. */
  volume: number;
  /** Dividend yield as a percentage (e.g. `1.25` for 1.25%).
   *  `null` when the stock doesn't pay a dividend; consumers
   *  should coalesce to `0` for arithmetic / display. */
  dividend_yield: number | null;
  /** Beta vs. the benchmark index. */
  beta: number;
  /** Day-change percent (signed). */
  pct_change: number;
}

// ─── INDEX MOVER ───────────────────────────────────────────────

/**
 * One entry from `GET stocks/index-mover` — a stock ranked by its
 * contribution ("mover") to the composite index.
 *
 * `percent_change` is the day-change percent (signed; positive = up)
 * and matches the `TopStockItem` / `TickerItem` field name — *not*
 * `pct_change`. `weight` is the stock's index weight (raw points),
 * `weight_percent` is that weight as a percentage of the index, and
 * `jci_point` is the stock's signed contribution to the composite
 * index in raw points (matches the top-level "Jakarta Composite
 * Index" mover concept — the leader side of the wire response will
 * have positive `jci_point`, the lagging side negative).
 */
export interface IndexMoverItem {
  ticker: string;
  company_name: string;
  price: number;
  percent_change: number;
  /** Index weight in raw points. */
  weight: number;
  /** Index weight as a percentage of the index. */
  weight_percent: number;
  /** Signed point contribution to the composite index (positive
   *  for leaders, negative for laggers). */
  jci_point: number;
}

/**
 * Wire format for `GET stocks/index-mover`. The endpoint used to
 * return a bare flat array; it now splits movers by contribution
 * sign so consumers can render the "leading" and "lagging" groups
 * separately. The `leading` array always carries contributors with
 * `jci_point >= 0`, and the `lagging` array those with
 * `jci_point < 0`. Either array may be empty on quiet sessions.
 */
export interface IndexMoverResponse {
  /** Stocks whose contribution to the index is positive (top side). */
  leading: IndexMoverItem[];
  /** Stocks whose contribution to the index is negative (bottom side). */
  lagging: IndexMoverItem[];
}

// ─── STOCK HISTORICAL ──────────────────────────────────────────

/**
 * One OHLC-light data point on a stock's historical price series.
 *
 * `date_time` is an ISO 8601 timestamp from the server (UTC, e.g.
 * `"2026-06-17T00:00:00.000Z"`). `price` is the closing price in
 * IDR (raw, unformatted). `price_change` is the signed day
 * change — positive = up, negative = down. The backend sends
 * `0` for the earliest point in the series (no prior day to
 * diff against), so consumers should not treat `0` as a flat
 * day.
 */
export interface StockHistoricalPoint {
  date_time: string;
  price: number;
  price_change: number;
}

/**
 * Wire format for `GET stocks/stock/historical?ticker=...`.
 * The backend wraps the array in `{ data: [...] }` (same shape
 * as `TopStocksResponse`).
 */
export interface StockHistoricalResponse {
  data: StockHistoricalPoint[];
}

// ─── STOCK TRENDING ────────────────────────────────────────────

/**
 * One entry in the per-source breakdown of a trending stock —
 * which media covered it and how many articles each contributed.
 *
 * `name` is the publisher slug / hostname the backend uses
 * (e.g. `"cnbcindonesia"`); `article_count` is the share of the
 * stock's `article_count` contributed by that source.
 */
export interface StockTrendingSource {
  name: string;
  article_count: number;
}

/**
 * One row from `GET stocks/stock/trending?date=...` — a ticker
 * with an AI-written summary of today's coverage, the source
 * breakdown, and the day's price move.
 *
 * `description` is the editorial summary (often a long one-paragraph
 * recap of the catalyst + price action). `sentiment` mirrors the
 * stock-level sentiment band (same union as `StorySentiment`).
 * `article_count` is the total articles aggregated across
 * `sources[]`; `distinct_sources` is the count of unique
 * publishers, which can be smaller than `sources.length` if the
 * backend ever de-duplicates by slug.
 *
 * `price` is the latest close (raw IDR, unformatted); `pct_change`
 * is the signed day-change percent (positive = up). Field name
 * uses `pct_change` like `TickerInformation` / `KeyMetrics` —
 * *not* `percent_change` (the `TopStockItem` / `TickerItem`
 * field name).
 */
export interface StockTrendingItem {
  ticker: string;
  company_name: string;
  description: string;
  sentiment: "positive" | "negative" | "neutral";
  article_count: number;
  distinct_sources: number;
  sources: StockTrendingSource[];
  price: number;
  pct_change: number;
}

/**
 * Wire format for `GET stocks/stock/trending?date=...&page=...&limit=...`.
 * The backend wraps the array in `{ data: [...] }` (same shape
 * as `TopStocksResponse` / `StockHistoricalResponse`).
 */
export interface StocksTrendingResponse {
  data: StockTrendingItem[];
}
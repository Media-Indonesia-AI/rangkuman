/**
 * Types for the `/coin/*` endpoints — coin ticker catalog and any
 * future coin-domain responses. Consumed by `../coin.ts` (request
 * functions) and downstream UI.
 */

/** One coin ticker row returned by `GET coin/ticker/`. */
export interface CoinTickerItem {
  /** Lowercase ticker code (e.g. `"btc"`). */
  ticker: string;
  /** Human-readable coin name (e.g. `"Bitcoin"`). */
  ticker_name: string;
  /** Current price in USD. */
  price: number;
  /** 24h price change as a signed percent (negative = down). */
  price_change: number;
  /** Current market cap in USD. */
  market_cap: number;
  /** Logo URL (CoinGecko CDN). */
  image: string;
}

/** Discriminator for the top-tickers group returned by
 *  `GET coin/top-tickers/` — `"top-gainer"` is the day's biggest
 *  positive movers, `"top-looser"` the biggest negative movers. */
export type CoinTopTickerGroupType = "top-gainer" | "top-looser";

/** One group within the top-tickers response. Either group may be
 *  empty on a quiet session, but the group itself is always present
 *  so consumers can iterate over `response.data` without null checks. */
export interface CoinTopTickerGroup {
  type: CoinTopTickerGroupType;
  coins: CoinTickerItem[];
}

/** Wire format for `GET coin/top-tickers/?limit=...`. Mirrors the
 *  `{ data: [...] }` envelope shape used by `TopStocksResponse` and
 *  other grouped stock endpoints. */
export interface CoinTopTickersResponse {
  data: CoinTopTickerGroup[];
}

/** One category returned by `GET coin-category/?limit=...&skip=...`.
 *  A category groups coins by theme (e.g. "World Liberty Financial
 *  Portfolio") and surfaces the day's biggest winners / losers
 *  within that group. The nested `top_gainers` / `top_losers` rows
 *  reuse the `CoinTickerItem` shape — same fields, just scoped to
 *  the category. */
export interface CoinCategory {
  /** Backend-assigned category id (MongoDB-style ObjectId as string). */
  id: string;
  /** URL-safe slug, used as the category identifier in routes
   *  (e.g. `"world-liberty-financial-portfolio"`). */
  slug: string;
  /** Display name shown in the UI. */
  name: string;
  /** Aggregate 24h trading volume in USD across the category. */
  volume_24h: number;
  /** Aggregate market cap in USD across the category. */
  market_cap: number;
  /** Biggest positive movers within the category. May be empty on
   *  a quiet session but the field is always present. */
  top_gainers: CoinTickerItem[];
  /** Biggest negative movers within the category. May be empty on
   *  a quiet session but the field is always present. */
  top_losers: CoinTickerItem[];
}

/** Wire format for `GET coin-category/?limit=...&skip=...`. The
 *  `{ data: [...] }` envelope mirrors every other paginated list
 *  endpoint (e.g. `CoinTopTickersResponse`) so consumers can treat
 *  it uniformly. */
export interface CoinCategoriesResponse {
  data: CoinCategory[];
}

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

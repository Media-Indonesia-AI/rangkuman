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

/**
 * Types for the `GET stocks/commodity-categories` endpoint.
 *
 * Separate file from `types/sectors.ts` because the wire shape is a
 * commodity-bucketed aggregate (one row per category with embedded
 * commodities and their top_stocks), not a sector/index aggregate
 * like the other `/stocks/*` endpoints. Keeping it in its own module
 * also makes it easy to evolve the commodity-specific fields
 * (e.g. `unit`, `currency`, `latest_price_date`, nested `top_stocks[]`)
 * without churning the sector type file.
 *
 * Consumed by `../commodity-categories.ts` (request function) and any
 * commodity-list components that build on top of it.
 */

/**
 * One related stock inside a commodity's nested `top_stocks[]` array.
 *
 * `price_change` is the day-change percent (signed; positive = up) —
 * matches the convention used by `SectorStock.price_change`. The
 * record intentionally does NOT carry a server-side id; only the
 * ticker code (`stock_name`) is unique enough to act as the React key
 * in a list view.
 */
export interface CommodityCategoryTopStock {
  /** Ticker code, e.g. `"PNGO"`. */
  stock_name: string;
  /** Latest price (raw, unformatted — unit lives on the parent commodity). */
  price: number;
  /** Day-change percent (signed). */
  price_change: number;
}

/**
 * One commodity inside a category's nested `commodities[]` array.
 *
 * `unit` is the physical unit of the price (`"T"`, `"Kg"`, `"Bu"`,
 * etc.) and `currency` is the ISO-ish currency code the price is
 * denominated in (`"MYR"`, `"USD Cents"`, `"USd"`, …). `latest_price`
 * is denominated in that unit/currency combination — consumers
 * should pair it with both fields before formatting.
 *
 * `latest_price_date` is the ISO 8601 timestamp of the latest tick.
 */
export interface CommodityCategoryCommodity {
  /** Server-side commodity id (UUID). */
  id: string;
  /** Backend symbol, e.g. `"PLO:COM"`. */
  symbol: string;
  /** Human-readable commodity name, e.g. `"Palm Oil"`. */
  name: string;
  /** Physical unit of the price, e.g. `"T"` (ton), `"Kg"`, `"Bu"` (bushel). */
  unit: string;
  /** Currency the price is denominated in, e.g. `"MYR"`, `"USD Cents"`. */
  currency: string;
  /** Latest price (raw, unformatted). Pair with `unit` + `currency`. */
  latest_price: number;
  /** ISO 8601 timestamp of the latest tick. */
  latest_price_date: string;
  /** Related IDX-listed stocks linked to this commodity. */
  top_stocks: CommodityCategoryTopStock[];
}

/**
 * One row in the `/stocks/commodity-categories` response — a category
 * aggregate with its commodities embedded.
 *
 * The category is identified by two parallel fields:
 *   - `name`    → canonical English enum-style identifier, e.g.
 *                 `"AGRICULTURAL"`. Stable across locales; safe to
 *                 use as a key or to dispatch on.
 *   - `name_id` → localized Indonesian display label, e.g.
 *                 `"PERTANIAN"`. Use this in the UI.
 *
 * `created_at` / `updated_at` are the standard ISO 8601 timestamps
 * for the category record. The endpoint does not currently send
 * `latest_price_date` on the category itself — that timestamp
 * lives on each child commodity.
 */
export interface CommodityCategory {
  /** Server-side category id (UUID). */
  id: string;
  /** Canonical English category name, e.g. `"AGRICULTURAL"`. */
  name: string;
  /** Localized Indonesian category label, e.g. `"PERTANIAN"`. */
  name_id: string;
  /** ISO 8601 timestamp the category record was created. */
  created_at: string;
  /** ISO 8601 timestamp the category record was last updated. */
  updated_at: string;
  /** Embedded commodities belonging to this category. */
  commodities: CommodityCategoryCommodity[];
}

/** Wire format for `GET stocks/commodity-categories` — `{ data: CommodityCategory[] }`. */
export interface CommodityCategoriesResponse {
  data: CommodityCategory[];
}
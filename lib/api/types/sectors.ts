/**
 * Types for the `GET stocks/sectors` endpoint.
 *
 * Separate file from `types/stocks.ts` because the wire shape is
 * a sector-bucketed aggregate (one row per sector with embedded
 * stocks), not a per-ticker record like the other `/stocks/*`
 * endpoints. Keeping it in its own module also makes it easy to
 * evolve the sector-specific fields (e.g. `total_stock`, the
 * nested `stocks[]`) without churning the per-ticker type file.
 *
 * Consumed by `../sectors.ts` (request function) and any
 * sector-list / sector-detail components that build on top of it.
 */

/**
 * One stock inside a sector's nested `stocks[]` array.
 *
 * `price_change` is the day-change percent (signed; positive = up)
 * — matches the convention used by `RelatedStock.price` /
 * `TickerItem.percent_change`. `id` is the server-side record
 * id; the backend currently sends `""` for these rows so
 * consumers should not rely on it being non-empty.
 */
export interface SectorStock {
  id: string;
  /** ISO 8601 timestamp of the latest tick. */
  date: string;
  /** Ticker code, e.g. `"INAI"`. */
  stock_code: string;
  /** Latest price in IDR (raw, unformatted). */
  price: number;
  /** Day-change percent (signed). */
  price_change: number;
}

/**
 * One row in the `/stocks/sectors` response — a sector aggregate
 * (open / high / low / prev / last + change) with the constituent
 * stocks embedded.
 *
 * Field semantics follow the IHSG-style index convention:
 *   - `prev`  → previous close
 *   - `last`  → latest print
 *   - `open`  → today's open
 *   - `hi`    → today's high
 *   - `low`   → today's low
 *   - `change`→ absolute point change `last - prev` (signed;
 *               positive = sector up)
 *
 * `total_stock` is the count of constituents; `stocks` is a
 * sample/listing of the constituents (the wire payload only
 * includes a small per-sector slice — not a full enumeration of
 * all 94). Consumers that need every member should pair this
 * with `GET stocks/ticker` and filter by sector on the client.
 */
export interface Sector {
  /** Server-side sector id (UUID). */
  id: string;
  /** Human-readable sector name, e.g. `"Barang Baku"`. */
  name: string;
  /** Previous close (index value). */
  prev: number;
  /** Latest print (index value). */
  last: number;
  /** Today's open (index value). */
  open: number;
  /** Today's high (index value). */
  hi: number;
  /** Today's low (index value). */
  low: number;
  /** Absolute point change vs. previous close (signed). */
  change: number;
  /** Number of constituent stocks in the sector. */
  total_stock: number;
  /** Embedded slice of constituent stocks. */
  stocks: SectorStock[];
}

/** Wire format for `GET stocks/sectors` — `{ data: Sector[] }`. */
export interface SectorsResponse {
  data: Sector[];
}

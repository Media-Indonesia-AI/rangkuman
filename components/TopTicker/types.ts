/**
 * Public types for the `TopTicker` widget family.
 *
 * Kept in one file (instead of co-located with the component) so
 * the route-discriminating types travel together — both `variant`
 * (legacy) and `label` (current) describe which feed the visitor
 * sees, and importers always want them as a pair.
 */

/** Section discriminator for the `label` prop. Drives the render branch:
 *  - `"saham"`            → only the stocks list
 *  - `"crypto"`           → only the crypto list
 *  - anything else / unset → combined: up to 10 random stocks + up to
 *                            10 random crypto, interleaved
 *
 *  Overrides `variant` when both are set. */
export type TopTickerLabel = "saham" | "crypto" | (string & {});

/** Legacy default when `label` is not provided. Ignored if `label` is set.
 *  - `"stocks"` → `"saham"` branch
 *  - `"crypto"` → `"crypto"` branch
 *  - `"home"`   → combined branch */
export type TopTickerVariant = "stocks" | "crypto" | "home";

/** Unified row shape — both the stock and crypto feeds land here
 *  via `tickerToEntry` / `coinTickerToEntry`. The `kind` tag
 *  drives the per-row `href` (stocks → `/stock/<kode>`, crypto
 *  → the recap-detail story-id lookup) without forcing the render
 *  loop to special-case the link shape. */
export interface TickerRow {
  kind: "stock" | "crypto";
  kode: string;
  nama: string;
  price: number;
  changePercent: number;
}

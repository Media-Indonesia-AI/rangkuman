/**
 * Map the wire shape of `GET stocks/sectors` into the display
 * shape consumed by `<SektorCard />`.
 *
 * The API's `Sector` is market-data only — open / high / low /
 * prev / last / change / total_stock / nested stocks — and
 * doesn't carry the design-specific fields the grid tile needs
 * (a URL slug, a sentiment bucket, a hue, a percent change).
 * Those are derived deterministically here so the component
 * stays purely presentational.
 *
 * - `slug`   → kebab-case of the sector name (matches the
 *              `/sektor/[slug]` route shape).
 * - `hue`    → deterministic hash of the sector name modulo the
 *              6-entry hue palette, so the same sector always
 *              gets the same color across renders.
 * - `sentiment` → `change > 0` → "positif", `< 0` → "negatif",
 *              `0` → "netral" (the only 3 values
 *              `<SentimentBadge />` knows about).
 * - `avgChange` → `(last - prev) / prev * 100` — the
 *              percent-change band the card shows. The wire
 *              `change` is an absolute point change, not a
 *              percent, so this is computed locally.
 *
 * `topStocksByAbsChange` is the inlined replacement for the
 * old mock `getTopStocksInSektor` — same sort key
 * (|changePercent| desc), same N-stock slice.
 */

import type {
  Sector as ApiSector,
  SectorStock as ApiSectorStock,
} from "@/lib/api";

// ─── Display types ────────────────────────────────────────────

/** Six-entry palette used by the sector card's icon badge. */
export type SektorHue =
  | "amber"
  | "sky"
  | "rose"
  | "violet"
  | "emerald"
  | "slate";

/** Three-bucket sentiment matching `<SentimentBadge />`. */
export type SektorSentiment = "positif" | "netral" | "negatif";

/** Minimal stock shape the card needs in the top-N list. */
export interface SektorDisplayStock {
  kode: string;
  /** Optional company name. The wire `SectorStock` doesn't
   *  carry one yet; consumers should treat the absence as
   *  "no secondary label". */
  nama?: string;
  price: number;
  changePercent: number;
}

/** Display shape consumed by `<SektorCard />`. */
export interface SektorDisplay {
  /** Server-side sector id (UUID). */
  id: string;
  /** URL slug used by `/sektor/{slug}`. */
  slug: string;
  /** Human-readable sector name, e.g. `"Barang Baku"`. */
  name: string;
  /** Six-bucket palette index for the icon badge. */
  hue: SektorHue;
  /** Three-bucket sentiment for `<SentimentBadge />`. */
  sentiment: SektorSentiment;
  /** Day-change percent (signed). Derived from `last` / `prev`. */
  avgChange: number;
  /** Number of constituent stocks in the sector. */
  totalStock: number;
  /** Slice of constituent stocks (see `topStocksByAbsChange`). */
  stocks: SektorDisplayStock[];
}

// ─── Mappers ──────────────────────────────────────────────────

const HUES: SektorHue[] = [
  "amber",
  "sky",
  "rose",
  "violet",
  "emerald",
  "slate",
];

/** Tiny djb2-ish string hash → 32-bit signed int. */
function hashName(name: string): number {
  let h = 5381;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) + h + name.charCodeAt(i)) | 0;
  }
  return h;
}

/** Map an API sector → the display shape the card consumes. */
export function mapSector(api: ApiSector): SektorDisplay {
  const avgChange =
    api.prev !== 0 ? ((api.last - api.prev) / api.prev) * 100 : 0;
  const sentiment: SektorSentiment =
    api.change > 0 ? "positif" : api.change < 0 ? "negatif" : "netral";

  return {
    id: api.id,
    slug: slugify(api.name),
    name: api.name,
    hue: HUES[Math.abs(hashName(api.name)) % HUES.length],
    sentiment,
    avgChange,
    totalStock: api.total_stock,
    // The wire shape splits the constituent sample into two
    // buckets (leading + lagging). The display shape still
    // exposes a single flat `stocks` array so existing UI
    // consumers (`<SektorCard />`, `<SektorTopStocks />`,
    // `<SektorDetailNews />`) keep reading it the same way —
    // the leading bucket comes first so top movers surface
    // at the top of `topStocksByAbsChange()`.
    stocks: [...api.leading_stocks, ...api.lagging_stocks].map(mapStock),
  };
}

function mapStock(api: ApiSectorStock): SektorDisplayStock {
  return {
    kode: api.stock_code,
    price: api.price,
    changePercent: api.price_change,
  };
}

/**
 * Lowercase, hyphenate runs of non-alphanumerics, trim leading
 * / trailing hyphens. Matches the route shape consumed by
 * `/sektor/[slug]` (e.g. `"Barang Baku"` → `"barang-baku"`).
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ─── Sort helper ──────────────────────────────────────────────

/**
 * Return the top-N stocks sorted by `|changePercent|` desc.
 * Replacement for the old mock `getTopStocksInSektor` — same
 * key, same slice. Doesn't mutate the input array.
 */
export function topStocksByAbsChange(
  stocks: SektorDisplayStock[],
  n: number,
): SektorDisplayStock[] {
  return [...stocks]
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, n);
}

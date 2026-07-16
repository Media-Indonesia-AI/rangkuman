/**
 * Map the wire shape of `GET commodities/commodity-categories` into
 * the display shape consumed by `<CommodityPrices />`.
 *
 * The wire payload is a category-bucketed aggregate (one row per
 * category with embedded commodities and each commodity's top
 * related stocks), and each commodity carries only the latest
 * point — `latest_price`, no time series, no commodity-level
 * day-change percent. The display wants one section per wire
 * category (label + tile grid), and each commodity tile needs a
 * day-change percent and a sparkline-friendly `history` array.
 * Those are derived here:
 *
 * - `bucket`          → lowercased `name` + `name_id` matched
 *                       against known Indonesian / English
 *                       keywords (AGRICULTURAL → "pertanian",
 *                        ENERGY/POWER → "energi",
 *                        METAL/MINING → "logam"). The bucket is
 *                       purely a styling key (color / icon) — the
 *                       human-readable section label is the wire's
 *                       `name_id`, NOT the bucket, so unknown
 *                       categories still display correctly.
 * - `label`           → title-cased wire `name_id`
 *                       (`"PERTANIAN"` → `"Pertanian"`). Falls
 *                       back to the wire's English `name` when
 *                       `name_id` is missing/empty.
 * - `price`           → wire `latest_price` (raw, unformatted —
 *                       unit/currency pairing lives in the parent
 *                       display so the formatter can decide how
 *                       to render the digits).
 * - `changePercent`   → mean of the related stocks'
 *                       `price_change`. The wire doesn't carry a
 *                       commodity-level change, and the related
 *                       stocks' day-change is the closest signal
 *                       the API exposes for "how this commodity
 *                       is moving today" (commodities drive their
 *                       consumer stocks). Mean (not median) is
 *                       intentional: it's the equal-weighted
 *                       approximation the mock dataset used to
 *                       encode visually.
 * - `relatedStocks`   → wire `top_stocks[].stock_name`.
 * - `history`         → empty array. The wire has no time series;
 *                       `<SparklineChart />` falls back to its
 *                       empty-state div for `length < 2`.
 *
 * Empty-category exclusion: `mapCommodityCategories()` filters
 * out any wire category whose `commodities[]` is empty before
 * returning — the consumer can iterate the result blindly and
 * trust that every entry has at least one tile to render.
 */

import type {
  CommodityCategory,
  CommodityCategoryCommodity,
} from "@/lib/api/types/commodity-categories";

// ─── Display types ────────────────────────────────────────────

/**
 * Three-bucket styling key matching the UI's
 * `<CommodityPrices />` `categoryConfig` map. Unknown buckets
 * fall back to this enum's first member for styling only; the
 * section label comes from the wire and stays correct.
 */
export type CommodityCategorySlug = "energi" | "logam" | "pertanian";

/**
 * Minimal commodity shape the tile needs. Drops wire-specific
 * fields (`symbol`, `latest_price_date`) that the UI doesn't
 * render, and adds derived display fields (`category`,
 * `changePercent`, `history`).
 */
export interface DisplayCommodity {
  /** Server-side commodity id (UUID). */
  id: string;
  /** Backend symbol code, e.g. `"PLO:COM"`. Stable across
   *  renames — the tile uses this to fetch its own historical
   *  series via `useCommodityHistorical`. */
  symbol: string;
  /** Human-readable commodity name, e.g. `"Palm Oil"`. */
  name: string;
  /** Display category bucket the commodity belongs to. */
  category: CommodityCategorySlug;
  /** Physical unit string from the wire, e.g. `"T"`, `"Kg"`. */
  unit: string;
  /** Currency the price is denominated in, e.g. `"MYR"`,
   *  `"USD Cents"`. Pairs with `unit` to label the price tile
   *  (`"T/MYR"`, `"Kg/USD Cents"`). */
  currency: string;
  /** Latest price (raw, unformatted). */
  price: number;
  /** Day-change percent (signed). Mean of `top_stocks[].price_change`. */
  changePercent: number;
  /** Sparkline time series. Wire has none → empty array. */
  history: number[];
  /** Ticker codes of related IDX-listed stocks. */
  relatedStocks: string[];
}

/**
 * One display section — a wire category with its styling bucket
 * resolved, its display label pre-computed, and its commodities
 * already flattened into `DisplayCommodity[]`. The component
 * iterates this list and renders one tile grid per entry.
 */
export interface DisplayCategory {
  /** Wire category id (UUID). Stable React key. */
  id: string;
  /** Styling key. Drives `categoryConfig` lookup. */
  bucket: CommodityCategorySlug;
  /** Section header label — wire's localized `name_id`, title-cased. */
  label: string;
  /** Commodities in this category. Always non-empty
   *  (the mapper filters empty wire categories out). */
  commodities: DisplayCommodity[];
}

// ─── Category mapping ─────────────────────────────────────────

/**
 * Map a wire `CommodityCategory.name` / `name_id` pair onto the
 * UI's three-bucket styling slug. Tries both fields (the
 * English enum and the Indonesian label) so the bucket survives
 * either source changing shape on the backend.
 *
 * Falls back to `"energi"` when neither field matches a known
 * pattern — defensive, since unknown categories would otherwise
 * break the `Record<CommodityCategorySlug, ...>` lookups in the
 * consumer. (The section label is still correct because it
 * comes from `name_id`, not from this function.)
 */
export function mapApiCategory(
  name: string,
  nameId: string,
): CommodityCategorySlug {
  const blob = `${name} ${nameId}`.toLowerCase();
  if (/pertanian|agri|crop|plantation/.test(blob)) return "pertanian";
  if (/energi|energy|oil|gas|coal/.test(blob)) return "energi";
  if (/logam|metal|mining|mineral/.test(blob)) return "logam";
  return "energi";
}

/**
 * Title-case a wire `name_id` for use as the section header
 * label. `"PERTANIAN"` → `"Pertanian"`, `"USD BONDS"` →
 * `"Usd Bonds"`. Preserves the original word boundaries.
 */
function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

// ─── Per-commodity mapper ─────────────────────────────────────

function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  let total = 0;
  for (const x of xs) total += x;
  return total / xs.length;
}

/**
 * Map one wire commodity (already detached from its category
 * shell) onto the flat display shape the tile consumes. The
 * caller supplies the pre-resolved `category` bucket so the
 * mapper doesn't have to do its own category lookup.
 */
export function mapCommodity(
  api: CommodityCategoryCommodity,
  category: CommodityCategorySlug,
): DisplayCommodity {
  return {
    id: api.id,
    symbol: api.symbol,
    name: api.name,
    category,
    unit: api.unit,
    currency: api.currency,
    price: api.latest_price,
    changePercent: mean(api.top_stocks.map((s) => s.price_change)),
    history: [],
    relatedStocks: api.top_stocks.map((s) => s.stock_name),
  };
}

// ─── Response-level mapper ────────────────────────────────────

/**
 * Project the (already-unwrapped) wire category list onto the
 * `DisplayCategory[]` the section consumer iterates. One
 * `DisplayCategory` per wire category that has at least one
 * commodity — empty wire categories (`commodities.length === 0`)
 * are dropped here so the consumer can render the result
 * without a per-section guard.
 *
 * Takes the unwrapped `CommodityCategory[]` rather than the
 * full `CommodityCategoriesResponse` envelope — the data hook
 * has already stripped the envelope before reaching the
 * component, so the mapper operates one layer down.
 *
 * Order is preserved — sections come out in payload order. The
 * consumer renders each section verbatim (no further grouping).
 */
export function mapCommodityCategories(
  categories: CommodityCategory[],
): DisplayCategory[] {
  const out: DisplayCategory[] = [];
  for (const cat of categories) {
    if (cat.commodities.length === 0) continue; // exclude empty wire categories
    const bucket = mapApiCategory(cat.name, cat.name_id);
    out.push({
      id: cat.id,
      bucket,
      label: titleCase(cat.name_id || cat.name),
      commodities: cat.commodities.map((c) => mapCommodity(c, bucket)),
    });
  }
  return out;
}
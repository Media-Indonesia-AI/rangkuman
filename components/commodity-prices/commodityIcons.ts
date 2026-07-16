/**
 * Icon lookup for the commodity-price tile grid.
 *
 * Extracted from the old `components/CommodityPrices.tsx` so
 * the per-commodity / per-category icon tables sit next to
 * `categoryStyles.ts` as small focused modules and the main
 * component only has to call `iconFor(c)`.
 *
 * Resolution order (mirrors the original file):
 *   1. `perCommodityIcon[slugify(name)]` — per-wire-commodity
 *      match. Seeded with the three known commodities
 *      (`palm-oil` → TreePalm, `rubber` → CircleDot,
 *       `wheat` → Wheat) plus the mock-era keys (`cpo`,
 *       `karet`, `gandum`) so the lookup survives either
 *      dataset feeding the render.
 *   2. `categoryIcon[category]` — fallback by category bucket
 *      when the per-commodity slug didn't resolve. Three
 *      entries (energi / logam / pertanian).
 *   3. `fallbackIcon` (Flame) — final defensive default so the
 *      tile never crashes on an unknown commodity/category
 *      combo.
 *
 * The `slugify` helper is exported alongside because both the
 * per-commodity map and any future lookup tables in this folder
 * will want to share the same kebab-case convention — mirrors
 * `lib/util/sectorMappers.ts#slugify`.
 */

import {
  Flame,
  Coins,
  TreePalm,
  CircleDot,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import type {
  CommodityCategorySlug,
  DisplayCommodity,
} from "@/lib/util/commodityCategoriesMappers";

/**
 * Per-commodity icon lookup, keyed by the kebab-case slug of
 * the wire `name`. Backs the per-tile icon so each commodity
 * gets a glyph that matches what it is (e.g. `"palm-oil"` →
 * `TreePalm`). Unknown slugs fall through to the category
 * fallback below.
 */
export const perCommodityIcon: Record<string, LucideIcon> = {
  "palm-oil": TreePalm,
  "palm-oil-cpo": TreePalm,
  cpo: TreePalm,
  rubber: CircleDot,
  karet: CircleDot,
  wheat: Wheat,
  gandum: Wheat,
};

/** Default icon when neither the slug lookup nor the category
 *  fallback resolves — keeps the tile from crashing. */
export const fallbackIcon: LucideIcon = Flame;

/**
 * Slug helper shared with the per-commodity icon map. Mirrors
 * `lib/util/sectorMappers.ts#slugify` so the two display paths
 * use the same kebab-case convention.
 */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Per-category icon lookup. Used as the second-tier fallback
 * when the per-commodity slug lookup doesn't resolve.
 */
export const categoryIcon: Record<CommodityCategorySlug, LucideIcon> = {
  energi: Flame,
  logam: Coins,
  pertanian: Wheat,
};

/**
 * Resolve the icon for a commodity tile. See the module header
 * for the resolution order.
 */
export function iconFor(c: DisplayCommodity): LucideIcon {
  const slug = slugify(c.name);
  return perCommodityIcon[slug] ?? categoryIcon[c.category] ?? fallbackIcon;
}
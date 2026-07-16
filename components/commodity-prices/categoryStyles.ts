/**
 * Per-bucket styling for the commodity-price section header chip.
 *
 * Extracted from the old `components/CommodityPrices.tsx` so the
 * main component stays focused on layout and the styling tables
 * live alongside the icon lookup in this folder. Three parallel
 * `Record<CommodityCategorySlug, string>` maps cover the three
 * known buckets (energi / logam / pertanian), plus a generic
 * neutral fallback for any wire category the slug-mapping
 * didn't resolve to one of the three:
 *
 *   - `text`   → applied to the chip glyph and label
 *   - `bg`     → background tint for the rounded chip
 *   - `border` → border tint for the rounded chip
 *
 * Consumers grab all three via `styleForBucket(bucket)` and
 * spread them into the same `cn(...)` so the three layers stay
 * coordinated per category. The fallback is intentionally
 * neutral — it's used for unknown wire categories where the
 * bucket fell back to "energi" but the actual category (e.g.
 * a future `"LIVESTOCK"` bucket) isn't energy-related, so the
 * chip shouldn't take on brand-colored styling.
 */

import type { CommodityCategorySlug } from "@/lib/util/commodityCategoriesMappers";

export interface CategoryStyle {
  text: string;
  bg: string;
  border: string;
}

export const categoryConfig: Record<CommodityCategorySlug, CategoryStyle> = {
  energi: {
    text: "text-brand",
    bg: "bg-brand-soft",
    border: "border-brand-line",
  },
  logam: {
    text: "text-cat-ekonomi",
    bg: "bg-cat-ekonomi-soft",
    border: "border-cat-ekonomi-line",
  },
  pertanian: {
    text: "text-cat-emiten",
    bg: "bg-cat-emiten-soft",
    border: "border-cat-emiten-line",
  },
};

/**
 * Generic styling fallback for any bucket the wire hands us
 * that doesn't match the three known slugs. Keeps the section
 * header legible even for unknown categories like a future
 * `"LIVESTOCK"` bucket — the label is still readable (it comes
 * from the wire `name_id`), only the chip color falls back to
 * a neutral tone.
 */
export const genericCategoryStyle: CategoryStyle = {
  text: "text-text-secondary",
  bg: "bg-bg-tertiary",
  border: "border-border-strong",
};

/**
 * Resolve the styling triplet for a bucket, falling back to the
 * generic neutral palette when the bucket isn't in the
 * 3-entry `categoryConfig` map.
 */
export function styleForBucket(bucket: CommodityCategorySlug): CategoryStyle {
  return categoryConfig[bucket] ?? genericCategoryStyle;
}
import type { CoinCategory } from "@/lib/api";
import { CategoryCardBody } from "./CategoryCardBody";
import { CategoryCardFooter } from "./CategoryCardFooter";
import {
  CategoryCardHeader,
  resolveHue,
} from "./CategoryCardHeader";

interface CategoryCardProps {
  /** One category returned by `GET coin-category/`. `name`
   *  drives the icon hue (deterministic hash), and
   *  `top_gainers` / `top_losers` feed the two-column
   *  top-movers block at the bottom of the card. */
  cat: CoinCategory;
}

/**
 * One tile in the category grid (rendered by `<CategoryGrid />`
 * on the Pasar tab).
 *
 * The shape mirrors `<SektorCard />` so the two grids feel like
 * siblings on the same page:
 *
 *   - **Header** — icon badge (hue-derived) + category name +
 *     24h volume, no sentiment badge (the wire shape doesn't
 *     carry one). See `CategoryCardHeader.tsx`.
 *   - **Body** — short blurb with aggregate market cap, then the
 *     two-column top gainers / top losers block. Each column
 *     renders up to N coins; an empty bucket falls back to a
 *     quiet em-dash so the two columns stay aligned. See
 *     `CategoryCardBody.tsx`.
 *   - **Footer** — "Lihat kategori" CTA strip pushed to the
 *     bottom edge by the parent `flex flex-col`. See
 *     `CategoryCardFooter.tsx`.
 *
 * Rendered as a `<article>` rather than a `<Link>` because there's
 * no crypto category detail route yet — once `/crypto/kategori/[slug]`
 * ships, swap the outer element the same way `<SektorCard />` does.
 */
export function CategoryCard({ cat }: CategoryCardProps) {
  const hue = resolveHue(cat.name);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-bg-secondary transition-all hover:border-border-strong hover:shadow-card-hover">
      <CategoryCardHeader cat={cat} hue={hue} />
      <CategoryCardBody cat={cat} />
      <CategoryCardFooter />
    </article>
  );
}

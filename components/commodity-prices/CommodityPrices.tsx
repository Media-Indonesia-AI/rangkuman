"use client";

import { useCommodityCategories } from "@/lib/hooks/useCommodityCategories";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import {
  mapCommodityCategories,
  type CommodityCategorySlug,
  type DisplayCategory,
} from "@/lib/util/commodityCategoriesMappers";
import { cn } from "@/lib/utils";
import { styleForBucket } from "./categoryStyles";
import { CommodityTile } from "./CommodityTile";
import { CommodityPricesEmpty } from "./CommodityPricesEmpty";
import { CommodityPricesShimmer } from "./CommodityPricesShimmer";
import { CommodityLoginPrompt } from "./CommodityLoginPrompt";

interface CommodityPricesProps {
  filter?: CommodityCategorySlug;
}

/**
 * One-section-per-wire-category commodity grid:
 *  - Header strip ("Komoditas · penggerak IHSG")
 *  - One tile grid per wire category, in the order the backend
 *    returned them. Each section uses the wire category's
 *    localized `name_id` (title-cased) as its label and the
 *    resolved styling bucket (energi / logam / pertanian, with
 *    a generic neutral fallback) for its chip color.
 *
 * Data is fetched live from `GET commodities/commodity-categories`
 * via `useCommodityCategories` and projected onto
 * `DisplayCategory[]` by `mapCommodityCategories` — see
 * `lib/util/commodityCategoriesMappers.ts` for the per-field
 * derivation rules. The mapper already filters out wire
 * categories whose `commodities[]` is empty, so every entry
 * rendered here is guaranteed to have at least one tile.
 *
 * Three render branches (mirrors `<SektorSection />`):
 *   1. `isLoading`     → shimmer skeleton (`CommodityPricesShimmer`)
 *   2. data is null    → empty-state shell (`CommodityPricesEmpty`)
 *   3. real data       → the populated grid (this function)
 *
 * The optional `filter` prop narrows to a single styling
 * bucket (`"energi" | "logam" | "pertanian"`). When set, the
 * grid renders only sections whose bucket matches.
 *
 * Per-tile rendering lives in:
 *   - `./CommodityTile`
 *
 * Styling helpers live alongside this file:
 *   - `./categoryStyles` — per-bucket chip colors
 *
 * State variants live in:
 *   - `./CommodityPricesShimmer`
 *   - `./CommodityPricesEmpty`
 */
export function CommodityPrices({ filter }: CommodityPricesProps) {
  // Auth gate: the `/commodities/commodity-categories` endpoint is
  // member-only — anonymous visitors get a 401, which the hook
  // currently swallows and the widget silently renders as an empty
  // grid (or the empty-state shell on `length === 0`). We replace
  // the whole tree with a login prompt for anonymous visitors so the
  // auth requirement is explicit. `useCurrentUser()` is `undefined`
  // during hydration (no flash), `null` when logged out, and a
  // `MockUser` once authenticated.
  const user = useCurrentUser();
  const { data, isLoading } = useCommodityCategories();

  if (user === null) {
    return <CommodityLoginPrompt />;
  }

  if (isLoading) {
    return <CommodityPricesShimmer />;
  }

  const sections: DisplayCategory[] = data ? mapCommodityCategories(data) : [];

  if (sections.length === 0) {
    return <CommodityPricesEmpty />;
  }

  const visible = filter
    ? sections.filter((s) => s.bucket === filter)
    : sections;

  if (visible.length === 0) {
    return <CommodityPricesEmpty />;
  }

  const totalInstruments = visible.reduce(
    (sum, s) => sum + s.commodities.length,
    0,
  );

  return (
    <section aria-label="Harga Komoditas">
      {/* Header — compact, single line */}
      <header className="mb-2 flex items-end justify-between gap-3 border-b border-border-strong pb-1.5">
        <div className="min-w-0">
          <h2 className="truncate text-[14px] font-bold tracking-tight text-text-primary">
            Komoditas · penggerak IHSG
          </h2>
          <p className="text-[10.5px] text-text-muted">
            Update harian · dikaitkan ke emiten IDX terdampak
          </p>
        </div>
        <span className="shrink-0 font-mono text-[10px] text-text-faint">
          {totalInstruments} instrumen
        </span>
      </header>

      {/* One tile grid per wire category — no client-side regrouping. */}
      <div className="space-y-3">
        {visible.map((cat) => {
          const cfg = styleForBucket(cat.bucket);
          const items = cat.commodities;
          return (
            <div key={cat.id}>
              {/* Category header — inline, very compact */}
              {/* <div className="mb-1.5 flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center rounded border px-1.5 py-px font-mono text-[9px] font-semibold uppercase tracking-widest",
                    cfg.text,
                    cfg.bg,
                    cfg.border,
                  )}
                >
                  {cat.label}
                </span>
                <span className="font-mono text-[9px] text-text-faint">
                  {items.length}
                </span>
              </div> */}

              {/* Compact tile grid — 2/3/4/5 cols */}
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {items.map((c) => (
                  <CommodityTile key={c.id} commodity={c} style={cfg} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
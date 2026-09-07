"use client";

import { useCommodityCategories } from "@/lib/hooks/useCommodityCategories";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import {
  mapCommodityCategories,
  type CommodityCategorySlug,
  type DisplayCategory,
} from "@/lib/util/commodityCategoriesMappers";
import { styleForBucket } from "./categoryStyles";
import { CommodityTile } from "./CommodityTile";
import { CommodityPricesEmpty } from "./CommodityPricesEmpty";
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
 * Render branches:
 *   1. fetch returned `401` → login prompt (`CommodityLoginPrompt`).
 *      The commodity endpoint is auth-gated, so a logged-out
 *      visitor or an expired session both land here. The prompt
 *      replaces the grid entirely so the user sees a clear "log
 *      in to see this" CTA instead of silently seeing nothing.
 *   2. fetch still in flight → renders `null` (no skeleton, no
 *      header) — the section appears only once data lands, so
 *      the user never sees a half-populated layout
 *   3. fetch failed (any non-401 status) → still renders `null`,
 *      matching the silent "no data" default the hook returns on
 *      error
 *   4. data is empty      → empty-state shell (`CommodityPricesEmpty`)
 *   5. real data          → the populated grid (this function),
 *      wrapped in the `animate-fade-up` keyframe so the section
 *      fades + slides in over 280ms when it first mounts
 *      (defined in `tailwind.config.ts` under
 *      `animation.fade-up`)
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
 *   - `./CommodityPricesEmpty`
 */
export function CommodityPrices({ filter }: CommodityPricesProps) {
  const { data, isLoading, status } = useCommodityCategories();

  // 401 — the commodity endpoint is auth-gated, so a logged-out
  // visitor or an expired session both end up here. Swap the
  // grid for the login prompt so the user gets a clear
  // "log in to see this" CTA instead of silently seeing nothing.
  if (status === 401) {
    return <CommodityLoginPrompt />;
  }

  // Render nothing while the fetch is in flight — no shimmer, no
  // header — so the section appears all at once with data rather
  // than swapping a skeleton out for the real content. The
  // `animate-fade-up` wrapper on the populated section handles
  // the "smooth appearance" once the data lands.
  if (isLoading || !data) {
    return null;
  }

  const sections: DisplayCategory[] = mapCommodityCategories(data);

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
    <section
      aria-label="Harga Komoditas"
      // `fade-up` keyframe: opacity 0 → 1, translateY(6px) → 0,
      // 280ms ease-out, `both` so the starting state holds before
      // the animation runs (no flash of fully-opaque content).
      // `mt-6` matches the top gap `CommodityLoginPrompt` already
      // sets, so the section sits at the same offset whichever
      // branch renders.
      className="mt-6 animate-fade-up"
    >
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
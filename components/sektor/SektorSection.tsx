"use client";

import { Building2 } from "lucide-react";
import { CommodityPrices } from "@/components/commodity-prices";
import { Shimmer } from "@/components/Shimmer";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { useSectors } from "@/lib/hooks/useSectors";
import { mapSector } from "@/lib/util/sectorMappers";
import { SektorCard } from "./SektorCard";
import { SektorLoginPrompt } from "./SektorLoginPrompt";

interface SektorSectionProps {
  /** Whether to show the commodity prices block above the sector grid. */
  showCommodities?: boolean;
  className?: string;
}

const ARIA_LABEL = "Sektor IHSG";

/**
 * Reusable sektor block: optional `<CommodityPrices />` on top +
 * sector `<SektorCard />` grid below.
 *
 * Used by:
 *   - `/saham/` sub-tab "Sektor" (with commodities, in compact mode)
 *
 * The previous standalone `/sektor/` index route was removed — the
 * grid only renders here now. Detail pages (`/sektor/[slug]/`) are
 * still served from a sibling route and untouched.
 *
 * Data is fetched live from `GET stocks/sectors` via `useSectors`
 * and mapped (API `Sector` → display shape) by `mapSector` — see
 * `lib/util/sectorMappers.ts` for the per-field derivation rules
 * (slug, hue, sentiment, percent change, leading/lagging split).
 *
 * Render branches, in priority order:
 *   1. `user === null` → `<SektorLoginPrompt />`. The sector
 *      endpoint is member-only; without the gate, anonymous
 *      visitors would get a 401 and the grid would silently
 *      render as the empty-state shell.
 *   2. `isLoading`     → `<CardGridSkeleton />` under a
 *      `<SectionHeader loading />` so the strip height stays
 *      consistent. `<CommodityPrices />` returns `null` while
 *      its own fetch is in flight, so the skeleton focuses on
 *      the sector grid only.
 *   3. `data` is null or `[]` → `<EmptyState />` (the API
 *      returned no sectors or the fetch failed).
 *   4. real data       → the populated `<SektorCard />` grid.
 */
export function SektorSection({
  showCommodities = true,
  className,
}: SektorSectionProps) {
  const user = useCurrentUser();
  const { data, isLoading } = useSectors();

  if (user === null) {
    return (
      <div className={className}>
        <SektorLoginPrompt />
      </div>
    );
  }

  const sectors = isLoading ? [] : (data ?? []).map(mapSector);

  return (
    <div className={className}>
      {showCommodities && (
        <div className="mb-6">
          <CommodityPrices />
        </div>
      )}

      <section aria-label={ARIA_LABEL} className="mt-2" aria-busy={isLoading}>
        <SectionHeader count={isLoading ? null : sectors.length} />

        {isLoading ? (
          <CardGridSkeleton />
        ) : sectors.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sectors.map((s) => (
              <SektorCard key={s.slug} sektor={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/** Section title strip — `Building2` icon + "Sektor IHSG" label +
 *  count meta + H2 ("N Sektor Pasar Modal Indonesia"). When
 *  `count` is `null` (loading), swaps the static text for shimmer
 *  placeholders so the strip height stays consistent. */
function SectionHeader({ count }: { count: number | null }) {
  const loading = count === null;
  return (
    <header className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b border-border-strong pb-2">
      <div>
        <div className="mb-0.5 flex items-center gap-1.5">
          {loading ? (
            <Shimmer className="h-3.5 w-3.5 rounded-sm" />
          ) : (
            <Building2 className="h-3.5 w-3.5 text-brand" aria-hidden />
          )}
          {loading ? (
            <Shimmer className="h-2.5 w-20" />
          ) : (
            <span className="label text-text-secondary">Sektor IHSG</span>
          )}
          {!loading && (
            <span className="font-mono text-[10.5px] text-text-muted">
              · {count} sektor
            </span>
          )}
        </div>
        {loading ? (
          <>
            <Shimmer className="h-4 w-64" />
            <Shimmer className="mt-1.5 h-3 w-80" />
          </>
        ) : (
          <h2 className="text-[15px] font-bold tracking-tight text-text-primary">
            {count} Sektor Pasar Modal Indonesia
          </h2>
        )}
      </div>
    </header>
  );
}

/** 6-card skeleton grid — same responsive breakpoints as the real
 *  grid (`sm:2 lg:3`) so the layout reflows identically when
 *  data lands. */
function CardGridSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={`skel-${i}`} />
      ))}
    </div>
  );
}

/** Skeleton card that mirrors `<SektorCard />`'s outer shape
 *  (header strip + body rows) so the grid height doesn't shift on
 *  resolution. The two-column stock block is intentionally NOT
 *  shimmered — the placeholder is loose enough that this is fine. */
function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg-secondary">
      <div className="flex items-start justify-between gap-2 border-b border-border bg-bg-tertiary px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <Shimmer className="h-7 w-7 rounded" />
          <div className="space-y-1.5">
            <Shimmer className="h-3 w-20" />
            <Shimmer className="h-2 w-12" />
          </div>
        </div>
        <Shimmer className="h-3 w-8 rounded-full" />
      </div>
      <div className="space-y-1.5 px-3.5 pt-2.5">
        <Shimmer className="h-2.5 w-full" />
        <Shimmer className="h-2.5 w-3/4" />
      </div>
      <div className="mt-2 flex items-center gap-2 px-3.5">
        <Shimmer className="h-2.5 w-12" />
        <Shimmer className="h-3 w-14" />
      </div>
    </div>
  );
}

/** Empty-state shell — used when the API returns no sectors (or
 *  the fetch failed). The strip header above still shows so the
 *  layout stays stable. */
function EmptyState() {
  return (
    <div className="rounded-lg border border-border bg-bg-secondary px-4 py-10 text-center">
      <p className="text-[12.5px] text-text-muted">Belum ada data sektor.</p>
      <p className="mt-1 font-mono text-[10px] text-text-faint">
        Coba muat ulang beberapa saat lagi.
      </p>
    </div>
  );
}
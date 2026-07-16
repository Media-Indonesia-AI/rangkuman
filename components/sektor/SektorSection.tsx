"use client";

import { Building2 } from "lucide-react";
import { CommodityPrices } from "@/components/CommodityPrices";
import { Shimmer } from "@/components/Shimmer";
import { useSectors } from "@/lib/hooks/useSectors";
import { mapSector } from "@/lib/util/sectorMappers";
import { SektorCard } from "./SektorCard";

interface SektorSectionProps {
  /** Whether to show the commodity prices block above the sector grid. */
  showCommodities?: boolean;
  /** Section title shown above the grid. */
  gridTitle?: string;
  className?: string;
}

/** Skeleton shown while `GET stocks/sectors` is in flight. Mirrors
 *  the real section's structure (header strip + 12-card grid in
 *  3-col layout) so the card height doesn't shift on resolution. */
function SektorSectionShimmer() {
  return (
    <div>
      <div className="mb-6">
        <Shimmer className="h-24 w-full rounded-lg" />
      </div>
      <section aria-label="12 sektor IHSG" className="mt-2" aria-busy="true">
        <header className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b border-border-strong pb-2">
          <div>
            <Shimmer className="mb-1.5 h-3 w-40" />
            <Shimmer className="h-4 w-64" />
            <Shimmer className="mt-1.5 h-3 w-80" />
          </div>
        </header>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`skel-${i}`}
              className="overflow-hidden rounded-lg border border-border bg-bg-secondary"
            >
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
          ))}
        </div>
      </section>
    </div>
  );
}

/** Empty-state shell. Same outer `<section>` + header strip as the
 *  real card so the layout stays stable when the backend returns
 *  no sectors (or the fetch failed). */
function SektorSectionEmpty() {
  return (
    <section aria-label="12 sektor IHSG">
      <header className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b border-border-strong pb-2">
        <div>
          <div className="mb-0.5 flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-brand" aria-hidden />
            <span className="label text-text-secondary">Sektor IHSG</span>
            <span className="font-mono text-[10.5px] text-text-muted">
              · 0 sektor
            </span>
          </div>
          <h2 className="text-[15px] font-bold tracking-tight text-text-primary">
            12 sektor pasar modal Indonesia
          </h2>
        </div>
      </header>
      <div className="rounded-lg border border-border bg-bg-secondary px-4 py-10 text-center">
        <p className="text-[12.5px] text-text-muted">
          Belum ada data sektor.
        </p>
        <p className="mt-1 font-mono text-[10.5px] text-text-faint">
          Coba muat ulang beberapa saat lagi.
        </p>
      </div>
    </section>
  );
}

/**
 * Reusable sektor block:
 *  - CommodityPrices (Energi, Logam, Pertanian) — optional
 *  - 12 sector grid (with sentiment, top 3 stocks, avg change)
 *
 * Used by:
 *  - /sektor/ page (with commodities)
 *  - /saham/ sub-tab "Sektor" (with commodities, in compact mode)
 *
 * Data is fetched live from `GET stocks/sectors` via `useSectors`
 * and mapped (API `Sector` → display shape) by `mapSector` — see
 * `lib/util/sectorMappers.ts` for the per-field derivation rules
 * (slug, hue, sentiment, percent change).
 *
 * Three render branches:
 *   1. `isLoading`     → shimmer skeleton
 *   2. `data` is null or `[]` → empty-state shell
 *   3. real data       → the populated grid
 */
export function SektorSection({
  showCommodities = true,
  gridTitle = "12 sektor pasar modal Indonesia",
  className,
}: SektorSectionProps) {
  const { data, isLoading } = useSectors();

  if (isLoading) {
    return (
      <div className={className}>
        {showCommodities && (
          <div className="mb-6">
            <CommodityPrices />
          </div>
        )}
        <SektorSectionShimmer />
      </div>
    );
  }

  const sectors = data ? data.map(mapSector) : [];

  return (
    <div className={className}>
      {showCommodities && (
        <div className="mb-6">
          <CommodityPrices />
        </div>
      )}

      {sectors.length === 0 ? (
        <SektorSectionEmpty />
      ) : (
        <section aria-label="12 sektor IHSG" className="mt-2">
          <header className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b border-border-strong pb-2">
            <div>
              <div className="mb-0.5 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-brand" aria-hidden />
                <span className="label text-text-secondary">Sektor IHSG</span>
                <span className="font-mono text-[10.5px] text-text-muted">
                  · {sectors.length} sektor
                </span>
              </div>
              <h2 className="text-[15px] font-bold tracking-tight text-text-primary">
                {gridTitle}
              </h2>
              <p className="mt-1 text-[11.5px] leading-relaxed text-text-muted">
                Sentimen, saham unggulan, dan rata-rata perubahan hari ini. Klik
                untuk lihat detail emiten &amp; berita per-sektor.
              </p>
            </div>
          </header>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sectors.map((s) => (
              <SektorCard key={s.slug} sektor={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

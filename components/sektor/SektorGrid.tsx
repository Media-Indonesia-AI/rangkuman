"use client";

import { Building2 } from "lucide-react";
import { Shimmer } from "@/components/Shimmer";
import { useSectors } from "@/lib/hooks/useSectors";
import { mapSector } from "@/lib/util/sectorMappers";
import { SektorCard } from "./SektorCard";
import { SektorLoginPrompt } from "./SektorLoginPrompt";

const ARIA_LABEL = "Sektor IHSG";

/**
 * `<SektorGrid />` — the sector `<SektorCard />` grid section on
 * the `/saham/` "Sektor" sub-tab. Owns the data lifecycle for
 * `GET stocks/sectors` (via `useSectors`), the API → display
 * mapping (via `mapSector`), and the four render branches below.
 *
 * Render branches, in priority order:
 *   1. fetch returned `401` → `<SektorLoginPrompt />`. The
 *      sector endpoint is auth-gated, so a logged-out visitor
 *      or an expired session both land here. The prompt
 *      replaces the grid entirely so the user gets a clear
 *      "log in to see this" CTA instead of silently seeing
 *      the empty-state shell.
 *   2. `isLoading`     → `<CardGridSkeleton />` under a
 *      `<SectionHeader loading />` so the strip height stays
 *      consistent.
 *   3. fetch failed (any non-401 status) or `data` is `[]` →
 *      `<EmptyState />`.
 *   4. real data       → the populated `<SektorCard />` grid.
 */
export function SektorGrid() {
  const { data, isLoading, status } = useSectors();

  const sectors = isLoading ? [] : (data ?? []).map(mapSector);

  return (
    <section aria-label={ARIA_LABEL} className="mt-2" aria-busy={isLoading}>
      <SectionHeader count={isLoading ? null : sectors.length} />

      {status === 401 ? (
        <SektorLoginPrompt />
      ) : isLoading ? (
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

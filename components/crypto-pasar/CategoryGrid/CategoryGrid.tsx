"use client";

import { Coins } from "lucide-react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Shimmer } from "@/components/Shimmer";
import { useCoinCategories } from "@/lib/hooks/useCoinCategories";
import { CategoryCard } from "./CategoryCard";

const GRID_CLASSES =
  "grid gap-3 sm:grid-cols-2 lg:grid-cols-3";

/** Section header strip — "Kategori Koin" label + count meta +
 *  right-aligned "Sorted by market cap" hint. The count slot
 *  shows a shimmer while loading so the strip height stays
 *  consistent across the loading / ready transition. */
function CategoryGridHeader({
  count,
  loading,
}: {
  count: number | null;
  loading: boolean;
}) {
  return (
    <header className="mb-3 flex items-end justify-between border-b border-border-strong pb-1.5">
      <div>
        <div className="mb-0.5 flex items-center gap-1.5">
          <Coins className="h-3.5 w-3.5 text-brand" aria-hidden />
          <h2 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
            Kategori Koin
          </h2>
          {!loading && (
            <span className="font-mono text-[10.5px] text-text-muted">
              · {count} kategori pasar crypto
            </span>
          )}
        </div>
        {loading ? (
          <Shimmer className="mt-0.5 h-3 w-44" />
        ) : (
          <p className="text-[11px] text-text-muted">
            Top gainer &amp; looser per kategori
          </p>
        )}
      </div>
      <span className="font-mono text-[10px] text-text-faint">
        Sorted by market cap
      </span>
    </header>
  );
}

/**
 * Pasar tab's category grid — one `<CategoryCard />` per entry
 * returned by `GET coin-category/?limit=10&skip=0` via
 * `useCoinCategories`.
 *
 * Render branches, in priority order (mirrors
 * `<SektorSection />`'s pattern):
 *
 *   1. `loading` → `<CategoryGridSkeleton />` under a loading
 *      header so the strip height stays consistent.
 *   2. `error`   → `<CategoryGridError />` with a retry button
 *      that re-runs `useCoinCategories`'s fetch.
 *   3. `ready` + `categories.length === 0` → `<EmptyState />`
 *      (API returned an empty page).
 *   4. `ready` + data → the populated `<CategoryCard />` grid.
 *
 * The grid uses the same responsive breakpoints as the sector
 * grid (`sm:2 lg:3 xl:4`) so the two sections align visually
 * when stacked.
 */
export function CategoryGrid() {
  const { state, refetch } = useCoinCategories();

  if (state.kind === "loading") {
    return (
      <section aria-label="Kategori koin" aria-busy="true">
        <CategoryGridHeader count={null} loading />
        <CategoryGridSkeleton />
      </section>
    );
  }

  if (state.kind === "error") {
    return (
      <section aria-label="Kategori koin">
        <CategoryGridHeader count={null} loading={false} />
        <CategoryGridError message={state.message} onRetry={refetch} />
      </section>
    );
  }

  const categories = state.categories;

  return (
    <section aria-label="Kategori koin">
      <CategoryGridHeader count={categories.length} loading={false} />
      {categories.length === 0 ? (
        <EmptyState />
      ) : (
        <div className={GRID_CLASSES}>
          {categories.map((cat) => (
            <CategoryCard key={cat.id} cat={cat} />
          ))}
        </div>
      )}
    </section>
  );
}

/** N-card skeleton grid that mirrors the real grid's responsive
 *  breakpoints so the layout doesn't reflow when data lands. */
function CategoryGridSkeleton() {
  return (
    <div className={GRID_CLASSES}>
      {Array.from({ length: 8 }).map((_, i) => (
        <CardSkeleton key={`skel-${i}`} />
      ))}
    </div>
  );
}

/** Skeleton card mirroring `<CategoryCard />`'s header strip +
 *  body blurb + two-column stock block, so the grid height
 *  doesn't shift on resolution. */
function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg-secondary">
      <div className="flex items-start justify-between gap-2 border-b border-border bg-bg-tertiary px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <Shimmer className="h-7 w-7 rounded" />
          <div className="space-y-1.5">
            <Shimmer className="h-3 w-24" />
            <Shimmer className="h-2 w-14" />
          </div>
        </div>
      </div>
      <div className="space-y-1.5 px-3.5 pt-2.5">
        <Shimmer className="h-2.5 w-full" />
        <Shimmer className="h-2.5 w-2/3" />
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-3 border-t border-border px-3.5 py-2.5">
        <div className="space-y-1.5">
          <Shimmer className="h-2.5 w-14" />
          <Shimmer className="h-2.5 w-16" />
          <Shimmer className="h-2.5 w-12" />
        </div>
        <div className="space-y-1.5">
          <Shimmer className="h-2.5 w-14" />
          <Shimmer className="h-2.5 w-16" />
          <Shimmer className="h-2.5 w-12" />
        </div>
      </div>
    </div>
  );
}

/** Failure shell — single panel with the API error message and a
 *  retry button that re-runs `useCoinCategories`'s fetch. Modeled
 *  after `<TopMoversError />` so all Pasar-tab errors read the
 *  same way. */
function CategoryGridError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-bg-secondary px-4 py-6 text-center">
      <AlertCircle
        className="mx-auto mb-2 h-4 w-4 text-bearish"
        aria-hidden
      />
      <p className="font-mono text-[11px] text-bearish">
        {message || "Gagal memuat kategori koin."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 inline-flex items-center gap-1.5 rounded border border-border bg-bg-tertiary px-2.5 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-widest text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
      >
        <RefreshCw className="h-3 w-3" aria-hidden />
        Coba lagi
      </button>
    </div>
  );
}

/** Empty-state shell — used when the API returns no categories. */
function EmptyState() {
  return (
    <div className="rounded-lg border border-border bg-bg-secondary px-4 py-10 text-center">
      <p className="text-[12.5px] text-text-muted">
        Belum ada data kategori koin.
      </p>
      <p className="mt-1 font-mono text-[10px] text-text-faint">
        Coba muat ulang beberapa saat lagi.
      </p>
    </div>
  );
}

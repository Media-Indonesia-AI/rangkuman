"use client";

import { Coins } from "lucide-react";
import { Shimmer } from "@/components/Shimmer";
import { useCoinCategories } from "@/lib/hooks/useCoinCategories";
import { CategoryCard } from "./CategoryCard";
import { CategoryGridError } from "./CategoryGridError";
import { CategoryGridSkeleton } from "./CategoryGridSkeleton";

const GRID_CLASSES = "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

/**
 * Pasar tab's category grid — one `<CategoryCard />` per entry
 * returned by `GET coin-category/?limit=10&skip=0` via
 * `useCoinCategories`.
 *
 * Render branches, in priority order (mirrors `<SektorSection />`'s
 * pattern):
 *
 *   1. `loading` → `<CategoryGridSkeleton />` under a loading
 *      header so the strip height stays consistent.
 *   2. `error`   → `<CategoryGridError />` with a retry button
 *      that re-runs `useCoinCategories`'s fetch.
 *   3. `ready` + `categories.length === 0` → `<EmptyState />`.
 *   4. `ready` + data → the populated `<CategoryCard />` grid.
 *
 * Sub-widgets live in sibling files so this stays an orchestrator:
 *
 *   - `<CategoryGridHeader />` — title strip (inline below).
 *   - `<CategoryGridSkeleton />` — `CategoryGridSkeleton.tsx`.
 *   - `<CategoryGridError />`   — `CategoryGridError.tsx`.
 */
export function CategoryGrid() {
  const { state, refetch } = useCoinCategories();

  if (state.kind === "loading") {
    return (
      <section aria-label="Kategori koin" aria-busy="true">
        <CategoryGridHeader count={null} />
        <CategoryGridSkeleton />
      </section>
    );
  }

  if (state.kind === "error") {
    return (
      <section aria-label="Kategori koin">
        <CategoryGridHeader count={null} />
        <CategoryGridError message={state.message} onRetry={refetch} />
      </section>
    );
  }

  const { categories } = state;

  return (
    <section aria-label="Kategori koin">
      <CategoryGridHeader count={categories.length} />
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

/** Section header strip — "Kategori Koin" label + count meta +
 *  right-aligned "Sorted by market cap" hint.
 *
 *  When `count` is `null` (loading), the count text and sub-label
 *  are replaced with shimmers so the strip height stays consistent
 *  across the loading → ready transition. Treating `null` as the
 *  loading signal means callers don't need a separate `loading`
 *  flag. */
function CategoryGridHeader({ count }: { count: number | null }) {
  const loading = count === null;
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

"use client";

import { useEffect, useRef, useState } from "react";
import { Coins } from "lucide-react";
import type { CoinCategory } from "@/lib/api";
import { Shimmer } from "@/components/Shimmer";
import { useCoinCategories } from "@/lib/hooks/useCoinCategories";
import { CategoryGridError } from "./CategoryGridError";
import { CategoryGridSkeleton } from "./CategoryGridSkeleton";
import { CategoryListItem } from "./CategoryListItem";
import { CategoryLoadMore } from "./CategoryLoadMore";

const PAGE_SIZE = 10;
const GRID_CLASSES = "grid grid-cols-1 gap-3 sm:grid-cols-2";

/**
 * Pasar tab's category grid — one `<CategoryListItem />` per
 * entry returned by `GET coin-category/?limit=10&skip=...` via
 * `useCoinCategories`.
 *
 * Pagination model:
 *
 *   - `skip` starts at 0. The hook fetches `limit` items at the
 *     current `skip` and returns a single page.
 *   - `<CategoryLoadMore />` increments `skip` by `PAGE_SIZE`;
 *     the hook refetches for the new `skip`, and the effect
 *     below appends the new page to `accumulated` (with a
 *     dedupe pass on the id).
 *   - `hasMore` flips off when the most recent page came back
 *     short of `PAGE_SIZE` — that's the only "no more" signal
 *     the wire format exposes (the endpoint doesn't send a
 *     total count).
 *
 * Render branches, in priority order (mirrors `<SektorSection />`'s
 * pattern):
 *
 *   1. `loading` (initial fetch, `skip === 0`) → full
 *      `<CategoryGridSkeleton />` under a loading header.
 *   2. `error` (initial fetch, `skip === 0`) → full
 *      `<CategoryGridError />` with a retry button.
 *   3. `ready` + `accumulated.length === 0` → `<EmptyState />`.
 *   4. `ready` + data → the populated grid followed by
 *      `<CategoryLoadMore />` when there's still more to fetch.
 *
 * Sub-widgets live in sibling files so this stays an orchestrator:
 *
 *   - `<CategoryGridHeader />`  — title strip (inline below).
 *   - `<CategoryGridSkeleton />` — `CategoryGridSkeleton.tsx`.
 *   - `<CategoryGridError />`    — `CategoryGridError.tsx`.
 *   - `<CategoryLoadMore />`     — `CategoryLoadMore.tsx`.
 *   - `<CategoryListItem />`     — `CategoryListItem.tsx`.
 */
export function CategoryGrid() {
  const [skip, setSkip] = useState(0);
  const [accumulated, setAccumulated] = useState<CoinCategory[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  /** Tracks the last `skip` we've already applied to
   *  `accumulated`, so a re-render of the same page (e.g. when
   *  the auth `user` flips and the hook re-fetches the same
   *  page) doesn't append a duplicate row. */
  const lastAppliedSkipRef = useRef(-1);

  const { state, refetch } = useCoinCategories(PAGE_SIZE, skip);

  // When the hook lands on `ready`, fold its page into the
  // accumulated list. `skip === 0` replaces (first page);
  // later skips append (with a dedupe pass on the id, so a
  // re-fetch of the same page on auth flip is a no-op instead
  // of a duplicate row).
  useEffect(() => {
    if (state.kind !== "ready") return;
    if (lastAppliedSkipRef.current === skip) return;
    lastAppliedSkipRef.current = skip;

    if (skip === 0) {
      setAccumulated(state.categories);
    } else {
      setAccumulated((prev) => {
        const seen = new Set(prev.map((c) => c.id));
        const fresh = state.categories.filter((c) => !seen.has(c.id));
        return [...prev, ...fresh];
      });
      setIsLoadingMore(false);
      setLoadMoreError(null);
    }
    setHasMore(state.categories.length === PAGE_SIZE);
  }, [state, skip]);

  // Track load-more errors separately from the initial-fetch
  // error so the error branch below only fires for the very
  // first page request.
  useEffect(() => {
    if (state.kind !== "error" || skip === 0) return;
    if (lastAppliedSkipRef.current === skip) return;
    lastAppliedSkipRef.current = skip;
    setIsLoadingMore(false);
    setLoadMoreError(state.message);
  }, [state, skip]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setLoadMoreError(null);
    setSkip((s) => s + PAGE_SIZE);
  };

  // Initial loading — full skeleton.
  if (skip === 0 && state.kind === "loading") {
    return (
      <section aria-label="Kategori koin" aria-busy="true">
        <CategoryGridHeader count={null} />
        <CategoryGridSkeleton />
      </section>
    );
  }

  // Initial error — full error shell with retry.
  if (skip === 0 && state.kind === "error") {
    return (
      <section aria-label="Kategori koin">
        <CategoryGridHeader count={null} />
        <CategoryGridError message={state.message} onRetry={refetch} />
      </section>
    );
  }

  return (
    <section aria-label="Kategori koin">
      <CategoryGridHeader count={accumulated.length} />
      {accumulated.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className={GRID_CLASSES}>
            {accumulated.map((cat) => (
              <CategoryListItem key={cat.id} cat={cat} />
            ))}
          </div>
          {hasMore && (
            <CategoryLoadMore
              onClick={handleLoadMore}
              loading={isLoadingMore}
              error={loadMoreError !== null}
            />
          )}
        </>
      )}
    </section>
  );
}

/** Section header strip — "Kategori Koin" label + count meta.
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
    </header>
  );
}

/** Empty-state shell — used when the API returns no categories.
 *  Spans the full grid width on wider viewports so the empty
 *  message reads as one centered block, not a half-width tile. */
function EmptyState() {
  return (
    <div className="rounded-lg border border-border bg-bg-secondary px-4 py-10 text-center sm:col-span-2">
      <p className="text-[12.5px] text-text-muted">
        Belum ada data kategori koin.
      </p>
      <p className="mt-1 font-mono text-[10px] text-text-faint">
        Coba muat ulang beberapa saat lagi.
      </p>
    </div>
  );
}

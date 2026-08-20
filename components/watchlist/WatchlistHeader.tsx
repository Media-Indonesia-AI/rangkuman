"use client";

import { Plus, Sparkles } from "lucide-react";

interface WatchlistHeaderProps {
  onAddClick: () => void;
  /** True when the user's watchlist is at `WATCHLIST_LIMIT`. The
   *  "Tambah saham" button is hidden in that state — it's a dead
   *  end at the cap, so the user has to free a slot from the
   *  grid before any new entry point makes sense. The empty-state
   *  CTA is unaffected because empty-state implies zero rows,
   *  which is never at the cap. */
  isAtLimit: boolean;
}

/**
 * Page-level header for /watchlist: title + the "Tambah saham"
 * action button (hidden at the watchlist cap).
 */
export function WatchlistHeader({
  onAddClick,
  isAtLimit,
}: WatchlistHeaderProps) {
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border-strong pb-3">
      <div>
        <div className="mb-1 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden />
          <h1 className="text-[24px] font-bold leading-tight tracking-tight text-text-primary sm:text-[30px]">
            Saham yang kamu pantau
          </h1>
        </div>
      </div>

      {!isAtLimit && (
        <button
          type="button"
          onClick={onAddClick}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-brand px-3 text-[12.5px] font-semibold text-bg-primary transition-colors hover:bg-brand-hover"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Tambah saham
        </button>
      )}
    </header>
  );
}
"use client";

import { Eye, Plus } from "lucide-react";

interface WatchlistEmptyStateProps {
  onAddClick: () => void;
}

/** Shown when the watchlist has zero stocks — invites the user to add their first. */
export function WatchlistEmptyState({ onAddClick }: WatchlistEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-bg-secondary/50 px-6 py-14 text-center">
      <Eye className="h-7 w-7 text-text-faint" aria-hidden />
      <p className="text-[14px] font-semibold text-text-primary">
        Watchlist kamu masih kosong
      </p>
      <p className="max-w-sm text-[12.5px] leading-relaxed text-text-muted">
        Tambahin saham yang mau kamu pantau. Kamu bakal dapet recap
        personalized di beranda & update sentiment real-time.
      </p>
      <button
        type="button"
        onClick={onAddClick}
        className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-[12.5px] font-semibold text-bg-primary transition-colors hover:bg-brand-hover"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
        Tambah saham pertama
      </button>
    </div>
  );
}
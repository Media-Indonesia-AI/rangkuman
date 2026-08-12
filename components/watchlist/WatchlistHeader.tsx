"use client";

import { Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface WatchlistHeaderProps {
  isFull: boolean;
  onAddClick: () => void;
}

/**
 * Page-level header for /watchlist: back link, label, title, greeting,
 * and the two action buttons (Keluar + Tambah).
 */
export function WatchlistHeader({
  isFull,
  onAddClick,
}: WatchlistHeaderProps) {
  return (
    <>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border-strong pb-3">
        <div>
          <div className="mb-1 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden />
            <h1 className="text-[24px] font-bold leading-tight tracking-tight text-text-primary sm:text-[30px]">
              Saham yang kamu pantau
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddClick}
            disabled={isFull}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[12.5px] font-semibold transition-colors",
              isFull
                ? "cursor-not-allowed bg-bg-tertiary text-text-faint"
                : "bg-brand text-bg-primary hover:bg-brand-hover",
            )}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Tambah saham
          </button>
        </div>
      </header>
    </>
  );
}
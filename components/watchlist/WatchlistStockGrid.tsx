"use client";

import { WATCHLIST_LIMIT } from "@/lib/auth";
import { WatchlistStockCard } from "./WatchlistStockCard";

interface WatchlistStockGridProps {
  codes: string[];
  isFull: boolean;
}

/** Slot-status line + responsive grid of WatchlistStockCard tiles. */
export function WatchlistStockGrid({ codes, isFull }: WatchlistStockGridProps) {
  return (
    <>
      <p className="mb-3 font-mono text-[10.5px] text-text-muted">
        {isFull
          ? `⚠ Watchlist penuh (${WATCHLIST_LIMIT}). Hapus dulu sebelum nambah yang baru.`
          : `Sisa slot: ${WATCHLIST_LIMIT - codes.length}`}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {codes.map((kode) => (
          <WatchlistStockCard key={kode} kode={kode} />
        ))}
      </div>
    </>
  );
}
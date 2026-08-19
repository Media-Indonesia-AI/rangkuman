"use client";

import type { WatchlistItem } from "@/lib/api";
import { WatchlistStockCard } from "./WatchlistStockCard";

interface WatchlistStockGridProps {
  items: WatchlistItem[];
}

/** Responsive grid of WatchlistStockCard tiles. */
export function WatchlistStockGrid({ items }: WatchlistStockGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <WatchlistStockCard key={item.id} item={item} />
      ))}
    </div>
  );
}
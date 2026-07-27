"use client";

import Link from "next/link";
import { Coins, LogIn, UserPlus } from "lucide-react";

/**
 * Inline auth gate for `<CommodityPrices />`. Shown to anonymous
 * visitors in place of the commodity grid, so they get a clear
 * "login to see this" CTA instead of silently seeing nothing.
 *
 * Style mirrors `WatchlistEmptyState` (dashed border, soft bg,
 * centered icon + title + CTA pair) for cross-widget consistency.
 */
export function CommodityLoginPrompt() {
  return (
    <div className="mt-6 flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-bg-secondary/50 px-6 py-14 text-center">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Coins className="h-4 w-4" aria-hidden />
      </div>

      <div className="space-y-1">
        <p className="text-[14px] font-semibold text-text-primary">
          Masuk dulu untuk lihat harga komoditas
        </p>
        <p className="max-w-sm text-[12.5px] leading-relaxed text-text-muted">
          Update harian &amp; penggerak IHSG cuma tersedia buat member yang sudah masuk.
          Daftar gratis, gak pake kartu kredit.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-brand px-3.5 text-[12.5px] font-semibold text-bg-primary transition-colors hover:bg-brand-hover"
        >
          <LogIn className="h-3.5 w-3.5" aria-hidden />
          Masuk
        </Link>
        <Link
          href="/daftar"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-bg-secondary px-3.5 text-[12.5px] font-semibold text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
        >
          <UserPlus className="h-3.5 w-3.5" aria-hidden />
          Daftar
        </Link>
      </div>
    </div>
  );
}
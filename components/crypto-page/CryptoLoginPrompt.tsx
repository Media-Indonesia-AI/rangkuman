"use client";

import Link from "next/link";
import { Lock, LogIn, UserPlus } from "lucide-react";

/**
 * Inline auth gate for /crypto recap content. Shown by `CryptoRecapTab`
 * to anonymous visitors in place of the recap cards, so the user gets
 * a clear "login to see this" CTA instead of silently seeing the static
 * `CRYPTO_PAGE_STORIES` mock fallback.
 *
 * Style mirrors `WatchlistEmptyState` (dashed border, soft bg, centered)
 * so it reads as part of the same family of empty-state CTAs across the
 * app. The two buttons route to the canonical entry points; the global
 * `GuestLoginDialog` (mounted in app/layout.tsx) handles the "Masuk
 * sebagai tamu" auto-register flow on its own 1-minute timer.
 */
export function CryptoLoginPrompt() {
  return (
    <div className="mt-6 flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-bg-secondary/50 px-6 py-14 text-center">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Lock className="h-4 w-4" aria-hidden />
      </div>

      <div className="space-y-1">
        <p className="text-[14px] font-semibold text-text-primary">
          Masuk dulu untuk lihat recap
        </p>
        <p className="max-w-sm text-[12.5px] leading-relaxed text-text-muted">
          Recap & sorotan crypto harian cuma tersedia buat member yang sudah masuk.
          Belum punya akun? Daftar gratis, gak pake kartu kredit.
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
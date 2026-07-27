"use client";

import Link from "next/link";
import { Newspaper, LogIn, UserPlus } from "lucide-react";

/**
 * Inline auth gate for the `<LatestHeadlines />` widget. Shown to
 * anonymous visitors in place of the timeline, so they get a clear
 * "login to see this" CTA instead of silently seeing the static
 * mock-headlines fallback.
 *
 * Style mirrors `CryptoLoginPrompt` (centered icon + title + CTA
 * pair, no border) and `WatchlistEmptyState` for cross-widget
 * consistency. Slightly tighter padding than the crypto variant
 * because it lives inside a smaller sidebar slot.
 */
export function LatestHeadlinesLoginPrompt() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Newspaper className="h-4 w-4" aria-hidden />
      </div>

      <div className="space-y-1">
        <p className="text-[13.5px] font-semibold text-text-primary">
          Masuk dulu untuk lihat headlines
        </p>
        <p className="max-w-xs text-[12px] leading-relaxed text-text-muted">
          Headline terbaru tersedia buat member. Daftar gratis, gak pake kartu kredit.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-3 text-[12px] font-semibold text-bg-primary transition-colors hover:bg-brand-hover"
        >
          <LogIn className="h-3.5 w-3.5" aria-hidden />
          Masuk
        </Link>
        <Link
          href="/daftar"
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-bg-secondary px-3 text-[12px] font-semibold text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
        >
          <UserPlus className="h-3.5 w-3.5" aria-hidden />
          Daftar
        </Link>
      </div>
    </div>
  );
}
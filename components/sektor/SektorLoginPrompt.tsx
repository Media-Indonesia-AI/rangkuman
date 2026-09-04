"use client";

import Link from "next/link";
import { Building2, LogIn, UserPlus } from "lucide-react";

/**
 * Inline auth gate for `<SektorSection />`. Shown in place of the
 * sector grid when the sectors endpoint returns `401` — covers
 * both anonymous visitors and expired sessions on the auth-gated
 * route. The user gets a clear "login to see this" CTA instead
 * of silently seeing nothing.
 *
 * Style mirrors `CommodityLoginPrompt` (dashed border, soft bg,
 * centered icon + title + CTA pair) for cross-widget consistency.
 */
export function SektorLoginPrompt() {
  return (
    <div className="mt-6 flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-bg-secondary/50 px-6 py-14 text-center">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Building2 className="h-4 w-4" aria-hidden />
      </div>

      <div className="space-y-1">
        <p className="text-[14px] font-semibold text-text-primary">
          Masuk dulu untuk lihat sektor IHSG
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

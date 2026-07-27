"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Lock, LogIn, UserPlus, X } from "lucide-react";

interface StockLoginDialogProps {
  onClose: () => void;
}

/**
 * Auth gate shown on `/stock/[kode]` when the visitor is not logged
 * in. Modal overlay on top of the page content (which still renders
 * underneath, so the page feels responsive — just dimmed). Dismissible
 * via the X button, the Escape key, or a click on the backdrop.
 *
 * Mirrors the visual + a11y conventions used by `<LogoutConfirmDialog />`
 * and `<GuestLoginDialog />`: `role="dialog"`, `aria-modal="true"`,
 * backdrop click-to-close, Escape-to-close. The two CTAs route to the
 * canonical `/login` and `/daftar` entry points; the global
 * `<GuestLoginDialog />` (mounted in `app/layout.tsx`) handles the
 * "Masuk sebagai tamu" auto-register flow separately.
 */
export function StockLoginDialog({ onClose }: StockLoginDialogProps) {
  // Close on Escape. Same pattern as the Navbar mobile menu and
  // LogoutConfirmDialog — single keydown listener, removed on unmount.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Login untuk lihat detail saham"
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-lg border border-border bg-bg-secondary shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="relative border-b border-border bg-bg-tertiary px-4 py-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded text-text-muted transition-colors hover:bg-bg-secondary hover:text-text-primary"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
          <div className="flex items-start gap-3 pr-8">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
              <Lock className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-bold leading-tight text-text-primary">
                Masuk untuk lihat detail saham
              </h2>
              <p className="mt-1 text-[12px] leading-snug text-text-muted">
                Recap, sentiment, dan berita lengkap cuma tersedia buat member.
              </p>
            </div>
          </div>
        </header>

        <footer className="flex flex-col gap-2 bg-bg-secondary px-4 py-4">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-brand text-[13px] font-semibold text-bg-primary transition-colors hover:bg-brand-hover"
          >
            <LogIn className="h-4 w-4" aria-hidden />
            Masuk
          </Link>
          <Link
            href="/daftar"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md border border-border bg-bg-card text-[13px] font-semibold text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            Daftar akun baru
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="mt-1 text-[12px] text-text-muted transition-colors hover:text-text-primary"
          >
            Kembali ke halaman saham
          </button>
        </footer>
      </div>
    </div>
  );
}
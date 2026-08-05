"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LogOut } from "lucide-react";

interface LogoutConfirmDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Confirmation dialog before signing out. Red `bg-bearish` destructive
 * button on the right, safe default (`autoFocus`) on `Batal`.
 *
 * Rendered via `createPortal` into `document.body` so the dialog
 * escapes the calling component's stacking context entirely. This
 * matters when the trigger lives inside `<ProfileShell />` —
 * the sidebar is a sibling of the page's main content, so without
 * the portal the dialog's `fixed inset-0 z-50` gets trapped in
 * the sidebar's stacking context (z-50 is relative to the nearest
 * positioned ancestor with a z-index, not the root). Lifting the
 * dialog into `document.body` puts it at the top of the root
 * stacking context, so it always paints above the page content
 * regardless of which surface triggered it (sidebar / page /
 * mobile pill row / header button).
 *
 * Backdrop click or Escape triggers `onCancel`. The `mounted`
 * state gates the portal on the client so SSR doesn't try to
 * render `document.body`, mirroring `<ShareButton />`'s mount
 * pattern.
 */
export function LogoutConfirmDialog({ onCancel, onConfirm }: LogoutConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);

  // createPortal needs `document` — gate SSR.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-bg-primary/80 p-4 backdrop-blur-sm"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label="Konfirmasi keluar"
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-lg border border-border bg-bg-secondary shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start gap-3 border-b border-border bg-bg-tertiary px-4 py-3">
          <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bearish-soft text-bearish">
            <LogOut className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="text-[14px] font-bold tracking-tight text-text-primary">
              Keluar dari akun?
            </h2>
            <p className="mt-0.5 text-[12px] leading-snug text-text-muted">
              Watchlist kamu tetap tersimpan di browser ini. Kamu bisa masuk lagi kapan aja.
            </p>
          </div>
        </header>
        <footer className="flex items-center justify-end gap-2 bg-bg-secondary px-4 py-3">
          <button
            type="button"
            onClick={onCancel}
            autoFocus
            className="inline-flex h-9 items-center rounded-md border border-border bg-bg-card px-3.5 text-[12.5px] font-semibold text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-bearish px-3.5 text-[12.5px] font-semibold text-bg-primary transition-colors hover:bg-bearish/90"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            Ya, keluar
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

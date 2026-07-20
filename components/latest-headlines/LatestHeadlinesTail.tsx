"use client";

import { Loader2 } from "lucide-react";

/**
 * Tail row shown while the next page is in flight — a tiny
 * `Loader2` spinner and "Memuat cerita berikutnya…" copy. Lives
 * inside the same `<ol>` so the scroll container stays one
 * continuous surface.
 *
 * `aria-live="polite"` lets screen readers announce the loading
 * state without interrupting other content.
 */
export function LatestHeadlinesLoadingTail() {
  return (
    <li
      aria-live="polite"
      className="flex items-center justify-center gap-1.5 py-3 font-mono text-[9.5px] uppercase tracking-widest text-text-muted"
    >
      <Loader2 className="h-2.5 w-2.5 animate-spin" aria-hidden />
      Memuat cerita berikutnya…
    </li>
  );
}

/**
 * Tail row shown once the backend has run out of pages — a quiet
 * "Sudah sampai akhir" placeholder. Replaces the spinner the
 * moment `hasMore` flips off so the user gets explicit feedback
 * that further scrolling won't fetch anything new.
 */
export function LatestHeadlinesEndTail() {
  return (
    <li className="py-3 text-center font-mono text-[9.5px] uppercase tracking-widest text-text-faint">
      Sudah sampai akhir
    </li>
  );
}

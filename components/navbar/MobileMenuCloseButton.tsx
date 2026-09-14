"use client";

import { X } from "lucide-react";

interface MobileMenuCloseButtonProps {
  /** Close handler. Fires only on user click; the parent
   *  (Navbar) is responsible for not rendering this button while
   *  the menu is closed. */
  onClose: () => void;
}

/** Explicit X close button — a `fixed` overlay at the top-right of
 *  the viewport, sitting directly on top of the hamburger toggle
 *  in the navbar. The hamburger already shows an X when the menu
 *  is open, but it's a small 36×36 target that the user might
 *  miss; this overlay is an explicit "close" affordance at the
 *  same position.
 *
 *  `z-50` puts it above the navbar (`z-40`) so the click targets
 *  the close, not the toggle. `data-close-menu` is the
 *  out-of-band marker the outside-click listener uses to skip
 *  this button (otherwise the menu would close on pointerdown,
 *  React would unmount this button, and the subsequent click
 *  would land on the hamburger and toggle the menu back open). */
export function MobileMenuCloseButton({ onClose }: MobileMenuCloseButtonProps) {
  return (
    <button
      type="button"
      data-close-menu
      onClick={onClose}
      aria-label="Tutup menu"
      className="fixed right-4 top-2.5 z-50 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-bg-secondary text-text-primary transition-colors hover:border-border-strong md:hidden"
    >
      <X className="h-4 w-4" aria-hidden />
    </button>
  );
}

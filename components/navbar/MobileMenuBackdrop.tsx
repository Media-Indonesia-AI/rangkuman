"use client";

import { cn } from "@/lib/utils";

interface MobileMenuBackdropProps {
  /** Whether the drawer is currently open. The backdrop is always
   *  mounted so the open ↔ closed fade runs on a single element;
   *  `pointer-events-none` when closed keeps it from intercepting
   *  clicks on the page below. */
  open: boolean;
  /** Close-on-click handler. Same path as the Escape / outside-
   *  click close: any "tap outside the drawer content" gesture
   *  dismisses the menu. */
  onClick: () => void;
}

/** Dim overlay sitting behind the mobile drawer. Catches taps that
 *  miss the drawer or the close button and dismisses the menu.
 *  `md:hidden` keeps it out of the desktop layout entirely — the
 *  desktop navbar has no drawer to dim. */
export function MobileMenuBackdrop({ open, onClick }: MobileMenuBackdropProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "fixed inset-0 z-30 bg-bg-primary/60 backdrop-blur-sm transition-opacity duration-200 md:hidden",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      onClick={onClick}
    />
  );
}

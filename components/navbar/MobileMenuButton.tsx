"use client";

import { Menu, X } from "lucide-react";

interface MobileMenuButtonProps {
  /** Whether the mobile drawer is currently open. Drives the icon
   *  swap and the `aria-expanded` state for screen readers. */
  open: boolean;
  /** Toggle handler — flips the menu open ↔ closed. */
  onToggle: () => void;
}

/** Hamburger / X toggle button — the only mobile-menu affordance
 *  visible in the navbar. `md:hidden` keeps it out of the desktop
 *  layout where the full nav row + `<UserActions />` already
 *  surface every drawer item.
 *
 *  The X icon swap happens here (not via two stacked icons) so the
 *  same button's aria-label and aria-expanded flip with the state
 *  — one target, no "which icon is the button" ambiguity. */
export function MobileMenuButton({ open, onToggle }: MobileMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={open ? "Tutup menu" : "Buka menu"}
      aria-expanded={open}
      aria-controls="mobile-menu"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-bg-secondary text-text-primary transition-colors hover:border-border-strong md:hidden"
    >
      {open ? (
        <X className="h-4 w-4" aria-hidden />
      ) : (
        <Menu className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}

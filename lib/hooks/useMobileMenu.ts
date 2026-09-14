"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { usePathname } from "next/navigation";
import { MOBILE_MENU_OPEN_CLASS } from "@/lib/hooks/useMobileMenuOpen";

/** Owns the mobile-menu drawer: its open/close state, every
 *  side effect that follows from that state, and the click
 *  handler the drawer needs to close itself when a user picks
 *  an item. Returns the bits the `<Navbar />` shell needs to
 *  wire the four visible widgets:
 *
 *   - `menuOpen` + `setMenuOpen` for the toggle button,
 *   - `drawerRef` for the drawer's outer `<div>`,
 *   - `onDrawerClick` for the drawer's `onClick` prop.
 *
 *  Five concerns bundled into one hook because they all hang off
 *  the same `menuOpen` state — splitting them across the Navbar
 *  scatters the close logic without any readability win.
 */
export function useMobileMenu() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // 1. Close on route change. The drawer is fixed-position so a
  //    navigation doesn't unmount it the way a route-change would
  //    unmount a page content component — we have to flip the
  //    state explicitly so the new route doesn't inherit an open
  //    menu from the previous one.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // 2. Close on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // 3. Lock body scroll while the drawer is open so the page
  //    behind doesn't scroll when the user scrolls the drawer.
  //    The drawer's own `overflow-y-auto` then handles the inner
  //    scroll in isolation. Saves / restores the original
  //    `overflow` value so any other component that touched it
  //    (e.g. `<ShareButton />`) isn't clobbered on unmount.
  useEffect(() => {
    if (!menuOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [menuOpen]);

  // 4. Mirror the menu's open state onto `<html>` so portal'd
  //    consumers (sub-tab bars rendered to `document.body`, which
  //    escape the React tree) can react via `useMobileMenuOpen`
  //    instead of needing a Context provider lifted into the
  //    root layout. Mirrors the body-scroll-lock effect above —
  //    early-return when closed, add on open, cleanup on close.
  useEffect(() => {
    if (!menuOpen) return;
    document.documentElement.classList.add(MOBILE_MENU_OPEN_CLASS);
    return () => {
      document.documentElement.classList.remove(MOBILE_MENU_OPEN_CLASS);
    };
  }, [menuOpen]);

  // 5. Close on click outside the drawer. The navbar is z-40 above
  //    the backdrop (z-30), so clicks on the navbar don't reach
  //    the backdrop's onClick — this listener catches them.
  //    Three exclusions, all by element:
  //      - the hamburger toggle (`aria-controls="mobile-menu"`) —
  //        it has its own onClick that toggles, so this listener
  //        must not also fire `setMenuOpen(false)` on the next
  //        tick.
  //      - the in-drawer close button (`data-close-menu`) — it's
  //        a `fixed` overlay at the same position as the hamburger
  //        but at z-50. If this listener fired on it, the menu
  //        would close on pointerdown, React would unmount the
  //        close button, and the subsequent click event would
  //        land on the hamburger (same position, z-40) and toggle
  //        the menu back open.
  //      - anything inside the drawer — the drawer's own
  //        `onDrawerClick` already closes the menu on link /
  //        button clicks.
  //    `pointerdown` (not `click`) so the target is the element
  //    the user actually pressed, not the common ancestor of a
  //    press-inside-drag-outside gesture. `pointerdown` also fires
  //    for touch + pen, unified with mouse.
  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[aria-controls="mobile-menu"]')) return;
      if (target.closest('[data-close-menu]')) return;
      if (drawerRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);

  // Drawer-internal click handler. Closes the menu when the user
  // clicks any `<a>` or `<button>` inside the drawer — covers the
  // common "user picked an option, hide the menu now" path. The
  // search input is intentionally exempt — `closest('a, button')`
  // only matches links and buttons, so typing into the search bar
  // doesn't dismiss the drawer.
  const onDrawerClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("a, button")) {
      setMenuOpen(false);
    }
  }, []);

  return { menuOpen, setMenuOpen, drawerRef, onDrawerClick };
}

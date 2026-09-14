"use client";

import { useEffect, useState } from "react";

/** Class added to `<html>` by `Navbar` while the mobile drawer is
 *  open. Lives on the document root so consumers that portal out
 *  of the React tree (sub-tab bars rendered to `document.body`)
 *  can subscribe via a `MutationObserver` instead of needing a
 *  Context provider lifted into the root layout.
 *
 *  Mirrors the `.dark` / `useTheme` precedent (`lib/hooks/useTheme.ts`)
 *  — same writer pattern (toggled in a Navbar effect), same reader
 *  pattern (observer on `<html>`'s `class` attribute).
 *
 *  Exported so the writer side (`Navbar`) can import the same
 *  literal instead of duplicating it — keeps the two ends of the
 *  channel from drifting on a rename. */
export const MOBILE_MENU_OPEN_CLASS = "mobile-menu-open";

/**
 * Whether the mobile menu drawer is currently open.
 *
 * Starts as `false` (the safe default), so SSR renders the closed
 * state. The menu can only be opened by a user click post-mount, so
 * the pre-mount value matches every legitimate first paint and there
 * is no hydration mismatch.
 *
 * Tears the observer down on unmount so navigating away from a page
 * that mounted a subscriber doesn't leave a dangling subscription.
 */
export function useMobileMenuOpen(): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(document.documentElement.classList.contains(MOBILE_MENU_OPEN_CLASS));

    const observer = new MutationObserver(() => {
      setOpen(document.documentElement.classList.contains(MOBILE_MENU_OPEN_CLASS));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return open;
}

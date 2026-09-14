"use client";

import { useEffect, useState } from "react";

/** Class added to `<html>` by `SearchBar` while the suggestions
 *  dropdown is open. Lives on the document root so consumers
 *  that portal out of the React tree (sub-tab bars rendered to
 *  `document.body`) can subscribe via a `MutationObserver` instead
 *  of needing a Context provider lifted into the root layout.
 *
 *  Mirrors the `.dark` / `useTheme` and `mobile-menu-open` /
 *  `useMobileMenuOpen` precedents (`lib/hooks/useTheme.ts`,
 *  `lib/hooks/useMobileMenuOpen.ts`) — same writer pattern
 *  (toggled in a component effect), same reader pattern (observer
 *  on `<html>`'s `class` attribute).
 *
 *  Exported so the writer side (`SearchBar`) can import the same
 *  literal instead of duplicating it — keeps the two ends of the
 *  channel from drifting on a rename. */
export const SEARCH_DROPDOWN_OPEN_CLASS = "search-dropdown-open";

/**
 * Whether the search suggestions dropdown is currently open.
 *
 * Starts as `false` (the safe default), so SSR renders the closed
 * state. The dropdown can only be opened by user interaction
 * post-mount, so the pre-mount value matches every legitimate
 * first paint and there is no hydration mismatch.
 *
 * Tears the observer down on unmount so navigating away from a
 * page that mounted a subscriber doesn't leave a dangling
 * subscription.
 */
export function useSearchDropdownOpen(): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(document.documentElement.classList.contains(SEARCH_DROPDOWN_OPEN_CLASS));

    const observer = new MutationObserver(() => {
      setOpen(document.documentElement.classList.contains(SEARCH_DROPDOWN_OPEN_CLASS));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return open;
}

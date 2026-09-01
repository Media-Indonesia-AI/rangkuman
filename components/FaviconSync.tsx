"use client";

import { useEffect } from "react";

/**
 * Keeps the favicon in sync with the active site theme.
 *
 * The metadata block in `app/layout.tsx` declares both light + dark
 * favicons via `prefers-color-scheme` media queries, which covers
 * the cold-load case (browser reads the OS preference). But once
 * the user toggles the theme via `<ThemeToggle />`, the OS-level
 * `prefers-color-scheme` doesn't change — the site just adds /
 * removes the `.dark` class on `<html>`. Browsers don't re-evaluate
 * favicon media queries on a class toggle, so the tab icon would
 * stay stale.
 *
 * This component closes that gap: it watches the `<html>` class
 * for `.dark` and rewrites the active `<link rel="icon">` href
 * to the matching variant. Skips work when the href already matches
 * so toggling theme back-to-back doesn't churn the link element.
 */
export function FaviconSync() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const LIGHT = "/blue.svg";
    const DARK = "/orange.svg";

    const apply = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const target = isDark ? DARK : LIGHT;
      const links = document.querySelectorAll<HTMLLinkElement>(
        'link[rel="icon"][type="image/svg+xml"]',
      );
      links.forEach((link) => {
        if (link.getAttribute("href") !== target) {
          link.setAttribute("href", target);
        }
      });
    };

    apply();

    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return null;
}
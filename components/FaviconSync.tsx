"use client";

import { useEffect } from "react";

/**
 * Keeps the favicon in sync with the active site theme across both
 * the in-app theme toggle and App Router navigations.
 *
 * Two cases to cover:
 *
 * 1. **Theme toggle.** The metadata block in `app/layout.tsx` declares
 *    light + dark favicons via `prefers-color-scheme` media queries,
 *    which handles the cold-load case (browser reads the OS
 *    preference). But once the user toggles the theme via
 *    `<ThemeToggle />`, the OS preference doesn't change — the site
 *    just adds/removes the `.dark` class on `<html>`. Browsers don't
 *    re-evaluate favicon media queries on a class toggle, so we watch
 *    `<html class>` and rewrite the active `<link rel="icon">` href
 *    to the matching variant.
 *
 * 2. **Navigation.** Next.js App Router re-evaluates metadata on
 *    every segment transition and re-emits the `<link rel="icon">`
 *    elements into `<head>` with the original `metadata.icons` hrefs.
 *    Without intervention that wipes our theme-matched hrefs every
 *    time the user moves between routes. Watching `<head>` for
 *    child-list and href mutations lets us re-apply the theme variant
 *    as soon as Next.js drops a new link in.
 *
 * `apply()` is idempotent — when every link already points at the
 * target, it touches nothing. The microtask guard prevents the
 * `<link>` href mutation we just made from re-firing the observer.
 */
export function FaviconSync() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const LIGHT = "/blue.svg";
    const DARK = "/orange.svg";

    let scheduled = false;
    const apply = () => {
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(() => {
        scheduled = false;
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
      });
    };

    apply();

    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["href"],
    });
    return () => observer.disconnect();
  }, []);

  return null;
}
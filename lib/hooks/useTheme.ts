"use client";

import { useEffect, useState } from "react";

/** Two-theme model used site-wide. `light` is the default
 *  (`:root` block in `globals.css`); `dark` is applied by toggling
 *  the `.dark` class on `document.documentElement` (see
 *  `ThemeToggle.tsx`). */
export type Theme = "light" | "dark";

/** Read the current theme from `document.documentElement`. Safe to
 *  call during SSR — returns `"light"` when `document` is
 *  undefined, matching the `:root` default. */
function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/**
 * Subscribe to the current site theme and re-render the caller when
 * it changes.
 *
 * The theme lives on `document.documentElement`'s `class` attribute
 * (`"dark"` present = dark mode). A `MutationObserver` on the
 * `<html>` element watches for `class` mutations, so any consumer
 * that toggles `.dark` — the `<ThemeToggle />` button today, but
 * also the inline bootstrap script in `app/layout.tsx` and any
 * future keyboard shortcut, system-preference sync, etc. — picks
 * up here automatically.
 *
 * Starts as `null` to match `ThemeToggle`'s hydration-safe pattern:
 * the server has no `document`, so it can't know the theme, and
 * rendering a theme-dependent value before mount would cause an
 * SSR/CSR markup mismatch. Callers that need to render something
 * theme-dependent on first paint should branch on `theme === null`
 * with a neutral placeholder and let the effect upgrade to the
 * real value after mount. Components that just need to *react* to
 * theme changes (e.g. re-style based on `bg-bg-*` tokens that
 * auto-adapt via CSS variables) can call this hook and ignore the
 * `null` window.
 *
 * The effect tears the observer down on unmount so navigating away
 * from the page doesn't leave a dangling subscription.
 */
export function useTheme(): Theme | null {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(readTheme());

    const observer = new MutationObserver(() => {
      setTheme(readTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}
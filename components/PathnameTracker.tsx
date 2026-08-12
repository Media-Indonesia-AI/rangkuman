"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { SESSION_STORAGE_KEYS } from "@/lib/storageKeys";

/** sessionStorage key that holds the most recent non-auth pathname.
 *  Read by `getAuthRedirectTarget()` after a successful login or
 *  registration so the user lands back on the page they came
 *  from (e.g. /saham, /crypto) instead of jumping to the home
 *  page.
 *
 *  Re-exported from `lib/storageKeys.ts` so existing imports
 *  (`import { AUTH_PREV_PATH_KEY } from "@/components/PathnameTracker"`)
 *  keep working — the canonical value lives in the shared module
 *  alongside every other storage concern. */
export const AUTH_PREV_PATH_KEY = SESSION_STORAGE_KEYS.authPrevPath;

/** Pathnames we never want to save as a "previous page" — they're
 *  the auth pages themselves (would bounce the user straight back to
 *  /login or /daftar after a successful auth) plus the auth-flow
 *  dialog event surface. Kept as a Set so future additions are
 *  trivial. */
const SKIP_PATHS = new Set<string>(["/login", "/daftar"]);

/**
 * Mount-once client component that tracks the current pathname in
 * sessionStorage. Lives inside the root layout so it sees every
 * navigation across the app. When the user later visits `/login`
 * or `/daftar`, the *previously* saved pathname (the page they
 * came from) is still in storage — the auth pages read it via
 * `getAuthRedirectTarget()` and route there after a successful
 * sign-in / register.
 *
 * The auth pages themselves are skipped so the saved path is
 * never `/login` or `/daftar` — otherwise a fresh navigation
 * chain `/saham → /login → /login → register → success` would
 * leave the storage value as `/login` and bounce the user back
 * to the auth surface.
 *
 * sessionStorage (not localStorage) so the captured path is scoped
 * to the current tab and clears when the tab closes — we don't
 * want a stale path from yesterday's tab dragging a user back to
 * an article they read before logging out.
 */
export function PathnameTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // `next.config.js` has `trailingSlash: true`, so `pathname` is
    // e.g. `"/login/"` not `"/login"`. Strip the slash before both
    // the SKIP_PATHS lookup and the sessionStorage write so the
    // stored value matches what `getAuthRedirectTarget`'s safe-path
    // check expects (and so an auth page is actually skipped).
    const normalized =
      pathname.length > 1 && pathname.endsWith("/")
        ? pathname.slice(0, -1)
        : pathname;
    if (SKIP_PATHS.has(normalized)) return;
    try {
      sessionStorage.setItem(AUTH_PREV_PATH_KEY, normalized);
    } catch {
      // sessionStorage disabled (private mode, quota, etc.) —
      // silently skip. The auth flow falls back to "/" in that
      // case, which is the same behavior as having no prior
      // path captured.
    }
  }, [pathname]);

  // This component renders nothing — it's a pure side-effect
  // tracker. Returning null keeps it invisible in the layout tree.
  return null;
}

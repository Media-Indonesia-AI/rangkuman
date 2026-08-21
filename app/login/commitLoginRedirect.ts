/**
 * Shared post-auth redirect helper used by every login submit
 * handler in `app/login/`. Both flows (email / identifier and
 * Google) end with the same two operations:
 *
 *   1. Compute the redirect target via `getAuthRedirectTarget()`.
 *   2. `window.location.assign(target)` to commit the navigation.
 *   3. A 3-second self-diagnostic that logs an error if the
 *      navigation didn't unload the page.
 *
 * Both flows share the helper — the only difference is which
 * label the diagnostic logs under (`[login-success]` vs
 * `[google-login-success]`) for when developers grep the
 * console.
 *
 * ─── Why a hard-navigate, not `router.replace()` ──────────────
 *
 * `loginWithIdentifier` and `loginWithGoogle` persist the new
 * session via `writeJson`, which synchronously wakes the
 * `useCurrentUser` subscriber (queues `setUser`). A soft
 * `router.replace` from a React effect races with that in-flight
 * `setUser` and can be swallowed, leaving the page stuck on
 * `/login` with the loading button forever.
 * `window.location.assign` bypasses the App Router and is
 * guaranteed to commit. The `user`-effect's `router.replace`
 * still handles the orthogonal "logged-in user navigates to
 * `/login`" case (no race there — `useCurrentUser` reads storage
 * on mount without firing listeners).
 *
 * ─── Why a 3-second self-diagnostic ───────────────────────────
 *
 * If the navigation worked, this `setTimeout` fires into a
 * torn-down page and never logs. If we're still on `/login` 3
 * seconds later, the navigation never committed — that can
 * happen if HMR served stale code, if a service worker
 * intercepted the request, or if the App Router's
 * `RedirectBoundary` swallowed it. The diagnostic snapshot
 * gives developers enough state to debug from the console
 * without us instrumenting every boundary.
 *
 * The diagnostic runs in development only — production
 * definitely still navigates (the `setTimeout` doesn't gate the
 * navigate), but no console output is emitted.
 */

import { getAuthRedirectTarget } from "@/lib/auth";
import { SESSION_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/storageKeys";
import { safeGetItem } from "@/lib/util/safeLocalStorage";

/** Read-only variant of `URLSearchParams` for environments where
 *  `useSearchParams()` returns a frozen instance. Mirrors the same
 *  type defined in `lib/auth.ts`. Kept local rather than exported
 *  because no other module needs it. */
type ReadonlyURLSearchParams = { get(key: string): string | null };

/**
 * Commit the post-login redirect. Returns once `window.location.assign`
 * has been called; the actual navigation happens asynchronously as
 * the browser tears down the current page.
 *
 * @param searchParams  URLSearchParams from `useSearchParams()`. Used
 *                      to read `?next=` and to honor any in-flight
 *                      `authPrevPath` capture from `<PathnameTracker />`.
 * @param label         Channel label for the diagnostic console output.
 *                      `"identifier"` (default) or `"google"` — used to
 *                      tag the `[login-success]` / `[google-login-success]`
 *                      lines developers grep for.
 */
export function commitLoginRedirect(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
  label: "identifier" | "google" = "identifier",
): void {
  const target = getAuthRedirectTarget(searchParams);

  if (process.env.NODE_ENV !== "production") {
    // Single grouped log line for each interesting state — keep
    // the developer's console readable. The fields are stable
    // across navigations so log-search works.
    console.group(`[${label}-login-success]`);
    console.log("current pathname:", window.location.pathname);
    console.log("redirect target:", target);
    console.log(
      "sessionStorage prev-path:",
      window.sessionStorage.getItem(SESSION_STORAGE_KEYS.authPrevPath),
    );
    console.log("localStorage user:", safeGetItem(STORAGE_KEYS.user));
    console.log("firing window.location.assign…");
    console.groupEnd();
  }

  window.location.assign(target);

  // Self-diagnostic — see file header.
  if (process.env.NODE_ENV !== "production") {
    window.setTimeout(() => {
      if (window.location.pathname.startsWith("/login")) {
        console.error(
          `[${label}-login-success] STILL ON /login 3s after window.location.assign — navigation did not commit`,
        );
        console.error(`[${label}-login-success] current state snapshot:`, {
          pathname: window.location.pathname,
          href: window.location.href,
          readyState: document.readyState,
          sessionStorage_prev: window.sessionStorage.getItem(
            SESSION_STORAGE_KEYS.authPrevPath,
          ),
          localStorage_user: safeGetItem(STORAGE_KEYS.user),
        });
      }
    }, 3000);
  }
}

"use client";

import { useEffect } from "react";

/**
 * Force a full reload when the browser restores this page from the
 * back-forward cache **or** when the user navigates back/forward via
 * the browser's history buttons / mobile swipe gestures.
 *
 * Why both events?
 *
 * - `pageshow` with `event.persisted === true` covers the classic
 *   bfcache case: the browser kept the page in memory and is
 *   resurrecting it. Without a reload, `useState` is preserved but
 *   `useEffect` does not re-fire, so loading flags can be stuck on
 *   `true` (see `lib/hooks/useMarketMoodData.ts`).
 *
 * - `popstate` covers the Next.js SPA case: when the user hits the
 *   browser back/forward button (or swipes), the browser fires
 *   `popstate` and Next.js soft-navigates. If the browser chose not
 *   to bfcache the page (memory pressure, no-store headers, or just
 *   heuristics), `pageshow` never fires with `persisted=true` and the
 *   stuck-loading symptom returns. Reloading on every `popstate` is
 *   the simplest reliable fix: every back/forward triggers a fresh
 *   mount, and the module-level cache in `lib/api/cache/*` serves
 *   the latest data instantly.
 *
 * Trade-off: every browser-initiated back/forward costs a full page
 * reload instead of a soft route transition. That's a noticeable
 * performance regression, but it eliminates the stuck-loading class
 * of bugs entirely. If/when the data hooks get an explicit resume
 * path (each hook re-reads from cache on a custom `app:resume`
 * event), this can be relaxed back to a soft refresh.
 *
 * Mounted once in the root layout so it covers every route.
 */
export function BfcacheRecovery() {
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };
    const onPopState = () => {
      window.location.reload();
    };
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);
  return null;
}
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import Script from "next/script";
import { isAnalyticsEnabled, pageview } from "@/lib/analytics";

/**
 * Google Analytics 4 bootstrapper.
 *
 * ─── Responsibilities ────────────────────────────────────────────
 *
 *   1. Load gtag.js from `googletagmanager.com` once per session.
 *      Uses `next/script` with `strategy="afterInteractive"` so the
 *      network request doesn't block first paint — Next.js loads
 *      the script after the page hydrates.
 *   2. Initialize the dataLayer + `gtag` shim (the `js` and
 *      `config` calls) via the inline init script. This is the
 *      exact pattern Google's own snippet uses — we can't move
 *      this to a module because the dataLayer must exist *before*
 *      the loader script runs (the loader pushes into it).
 *   3. Fire a pageview on every App Router navigation. App Router
 *      is an SPA — `<Link>` clicks don't trigger a full page load,
 *      so the initial `gtag('config', ...)` call only covers the
 *      first page. We re-fire `pageview` whenever `pathname` or
 *      `searchParams` change.
 *
 * ─── Why component, not just `<Script>`s in layout.tsx ──────────
 *
 * The pageview tracker needs `usePathname()` + `useSearchParams()`
 * hooks, which require a client component. A bare client component
 * that uses `useSearchParams` must be wrapped in a `<Suspense>`
 * boundary at the consumer (see `app/layout.tsx` below) so the
 * prerender path doesn't trip on Next.js's "useSearchParams in
 * a static page" warning.
 *
 * ─── Why `useRef` for the last-tracked URL ──────────────────────
 *
 * On mount, both the initial `'config'` from the init script AND
 * this effect's `pageview()` would fire — the gtag config call
 * already counts as a pageview, so without the guard we'd
 * double-count the first page. `lastTrackedUrl` lets us skip the
 * `pageview()` call on the first run when the URL hasn't changed,
 * and only fire on subsequent navigations.
 *
 * ─── Why `gaId` is a prop, not read from env here ───────────────
 *
 * Reading `process.env.GA_ID` from a client component returns
 * `undefined` because Next.js only inlines `NEXT_PUBLIC_*` vars
 * into the client bundle. Doing so would create a hydration
 * mismatch: the server (where the env var IS set) renders the
 * `<Script>` tags, then the client re-renders to `null` because
 * `GA_ID` is `undefined`, and React drops the `<Script>` elements
 * before the inline init executes — leaving `window.dataLayer`
 * undefined and every `gtag(...)` call a no-op. The fix is to read
 * the env var in `app/layout.tsx` (a server component) and pass
 * it down as a prop, so server and client agree from the start.
 */
export function GoogleAnalytics({ gaId }: { gaId?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrl = useRef<string | null>(null);

  // Page-view tracking on every App Router navigation. The `pathname`
  // + `searchParams` deps fire this on every navigation, including
  // the initial mount (which is the same URL the init script's
  // `config` call just recorded — the `lastTrackedUrl` guard keeps
  // us from double-counting).
  useEffect(() => {
    if (!isAnalyticsEnabled()) return;
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    if (url === lastTrackedUrl.current) return;
    lastTrackedUrl.current = url;
    pageview(url);
  }, [pathname, searchParams]);

  // No measurement ID configured → render nothing. Keeps the HTML
  // payload clean (no empty `<script>` tags) when running a build
  // without the env var.
  if (!gaId) return null;

  return (
    <>
      {/* Loader script — `next/script` dedupes across renders and
          handles the `async` attribute via `strategy="afterInteractive"`.
          The `id` is purely for the Next.js Script registry's
          deduplication key. */}
      <Script
        id="ga-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      {/* Inline init — must run before the loader script tries to
          push into `dataLayer`. The `id` matches the loader's id
          pattern so Next.js keeps them in load order. The
          `__html` content is the standard gtag.js shim: create
          the dataLayer queue, define the `gtag` shim, and fire
          the initial `config` call to register the pageview. */}
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}

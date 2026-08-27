/**
 * Google Analytics 4 (gtag.js) integration.
 *
 * ─── What this module provides ───────────────────────────────────
 *
 *   - `pageview(url)` / `event(name, params?, options?)` — typed
 *     wrappers around `window.gtag(...)` that gracefully no-op when:
 *       (a) the code is running outside a browser (SSR / prerender /
 *           error boundary), or
 *       (b) the gtag loader script hasn't finished loading yet
 *           (the loader is async, so the first navigation on a
 *           fresh page may fire before `window.gtag` exists).
 *     Both guards make these safe to call from anywhere without
 *     try/catch.
 *   - Type augmentation for `window.dataLayer` and `window.gtag`
 *     so the callsites get full type checking without `// @ts-ignore`.
 *
 * ─── Where the measurement ID lives ──────────────────────────────
 *
 * This module intentionally does NOT export the GA4 measurement ID.
 * The ID is read in `app/layout.tsx` (a server component) from
 * `process.env.GA_ID` and passed into `<GoogleAnalytics>` as a prop,
 * which then bakes it into the inline `gtag('config', ...)` init
 * script. Reading `process.env.GA_ID` directly from a client
 * component returns `undefined` (Next.js only inlines `NEXT_PUBLIC_*`
 * vars into the client bundle), so doing so here would either
 * silently no-op every call OR cause a hydration mismatch where
 * the server renders the `<Script>` tags but the client re-renders
 * to `null` and React drops them before the inline init executes —
 * leaving `window.dataLayer` undefined.
 *
 * Callers from this module just call `gtag(...)`; the global
 * already knows which property to route to because `config` was
 * fired once during init.
 *
 * ─── Why a "tolerant" wrapper, not a `requireXxx()` throw ────────
 *
 * Analytics is a side concern — the app must keep working even when
 * GA isn't configured (CI builds, local dev without env,
 * preview deploys, browser sessions where the value wasn't inlined).
 * Unlike `requireGoogleClientId()` in `app/login/LoginPage.tsx`
 * (which throws because the auth flow cannot continue without a
 * client ID), missing analytics config just means "no measurements",
 * never a runtime crash.
 */

// `GA_ID` is no longer exported — the measurement ID is passed from
// `app/layout.tsx` (server component) into `<GoogleAnalytics>` as a
// prop so the value stays consistent across server/client renders.
// Callers that need to fire events should pass `params` only — the
// `gtag` global is bound to the property via the `config` call inside
// `GoogleAnalytics`'s inline init script.

/** `true` when running in a browser environment where gtag can be
 *  called. Callers should still guard `typeof window.gtag === "function"`
 *  before each call — this only catches the SSR / prerender case. */
export function isAnalyticsEnabled(): boolean {
  return typeof window !== "undefined";
}

/**
 * Fire a page-view event. Safe to call from any effect / handler —
 * returns silently when gtag isn't loaded yet (the loader script
 * is async, so the first navigation on a fresh page may fire before
 * `window.gtag` exists).
 *
 * Uses the `event("page_view", ...)` form rather than
 * `config(GA_ID, { page_path })` because the measurement ID lives
 * only in the init script (`<GoogleAnalytics>`) — re-calling `config`
 * here would require re-passing the ID. The `event` form routes the
 * hit to whatever property was last configured, which is the same
 * one. Both are documented SPA pageview patterns; the event form
 * wins here because there's no second source of truth.
 *
 * `url` is the full path-with-query string gtag uses as the page
 * identifier. Pass `pathname + searchParams` rather than
 * `window.location.href` so the value is stable across hash-only
 * scrolls (which GA otherwise counts as duplicate views).
 */
export function pageview(url: string): void {
  if (!isAnalyticsEnabled()) return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", "page_view", { page_path: url });
}

/**
 * Fire a custom event. `params` is the GA4 event payload — any
 * serializable shape (strings, numbers, booleans). Returns
 * silently when analytics is disabled or gtag hasn't loaded.
 *
 * `options.transport` lets callers opt into `beacon` for events
 * that fire immediately before a hard navigation
 * (`window.location.assign`), where the default `image` transport
 * is dropped by the browser mid-unload. `beacon` survives the
 * race; default `image` is fine for any in-page event. GA4 maps
 * the `transport_type` field onto `navigator.sendBeacon`/`image`/
 * `xhr` accordingly — do NOT invent a new name.
 */
export function event(
  name: string,
  params?: Record<string, string | number | boolean>,
  options?: { transport?: "beacon" | "image" | "xhr" },
): void {
  if (!isAnalyticsEnabled()) return;
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  const payload: Record<string, string | number | boolean> = {
    ...(params ?? {}),
  };
  if (options?.transport) {
    payload.transport_type = options.transport;
  }
  if (Object.keys(payload).length > 0) {
    window.gtag("event", name, payload);
  } else {
    window.gtag("event", name);
  }
}

// ── Type augmentation ────────────────────────────────────────────
//
// gtag.js injects two globals at runtime: `dataLayer` (a `unknown[]`
// queue) and `gtag` (a variadic function that pushes onto the
// queue). The queue is `unknown[]` because gtag accepts arbitrary
// arguments — we deliberately don't try to type the inner shape.
//
// Declaring these on `Window` keeps the `pageview()` / `event()`
// callsites type-safe without `// @ts-expect-error` at every
// consumer. The `interface` is global by intent — `declare global`
// inside a module file only merges with the existing `Window`
// interface, it doesn't add a new one.

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

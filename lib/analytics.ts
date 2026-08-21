/**
 * Google Analytics 4 (gtag.js) integration.
 *
 * ─── What this module provides ───────────────────────────────────
 *
 *   - `GA_ID` — the GA4 measurement ID read from `NEXT_PUBLIC_GA_ID`.
 *     `undefined` when the env var is missing; consumers should
 *     treat that as "analytics disabled" and no-op.
 *   - `pageview(url)` / `event(name, params?)` — typed wrappers
 *     around `window.gtag(...)` that gracefully no-op when:
 *       (a) GA is not configured (`GA_ID === undefined`), or
 *       (b) the script hasn't loaded yet on the client.
 *     Both are safe to call from anywhere (SSR, prerender, error
 *     boundaries, etc.) — they all `typeof window` — guard.
 *   - Type augmentation for `window.dataLayer` and `window.gtag`
 *     so the `event()` callsite gets full type checking without
 *     `// @ts-ignore`.
 *
 * ─── Why a "tolerant" wrapper, not a `requireXxx()` throw ────────
 *
 * Analytics is a side concern — the app must keep working even when
 * `NEXT_PUBLIC_GA_ID` is missing (CI builds, local dev without env,
 * preview deploys). Unlike `requireGoogleClientId()` in
 * `app/login/LoginPage.tsx` (which throws because the auth flow
 * cannot continue without a client ID), missing analytics config
 * just means "no measurements", never a runtime crash.
 *
 * ─── Why module-level `GA_ID`, not a context read ───────────────
 *
 * `process.env.NEXT_PUBLIC_*` is inlined by Next.js at build time
 * and the value is the same on every render. Reading it once at
 * module load is cheaper than reading it on every `pageview()`
 * call, and the value doesn't change between server / client.
 */

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/** `true` when the measurement ID is configured. Use this to gate
 *  the `<Script>` tags so we don't ship two empty `<script>` tags
 *  when running a build without the env var. */
export function isAnalyticsEnabled(): boolean {
  return typeof GA_ID === "string" && GA_ID.length > 0;
}

/**
 * Fire a page-view event. Safe to call from any effect / handler —
 * returns silently when gtag isn't loaded yet (the loader script
 * is async, so the first navigation on a fresh page may fire before
 * `window.gtag` exists).
 *
 * `url` is the full path-with-query string gtag uses as the page
 * identifier. Pass `pathname + searchParams` rather than
 * `window.location.href` so the value is stable across hash-only
 * scrolls (which GA otherwise counts as duplicate views).
 */
export function pageview(url: string): void {
  if (!isAnalyticsEnabled()) return;
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("config", GA_ID!, { page_path: url });
}

/**
 * Fire a custom event. `params` is the GA4 event payload — any
 * serializable shape (strings, numbers, booleans). Returns
 * silently when analytics is disabled or gtag hasn't loaded.
 */
export function event(
  name: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (!isAnalyticsEnabled()) return;
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  if (params) {
    window.gtag("event", name, params);
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

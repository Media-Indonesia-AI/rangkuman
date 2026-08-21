import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LoginPageContent } from "./LoginPageContent";

/**
 * `/login` page — server component shell. Reads
 * `process.env.GOOGLE_CLIENT_ID` here (server-only, no `NEXT_PUBLIC_*`
 * prefix needed) and forwards it to the client-only `LoginPageContent`
 * via a prop.
 *
 * Why split this from `LoginPageContent`?
 *   - Non-`NEXT_PUBLIC_*` env vars are **not** inlined into the
 *     browser bundle by Next.js. Reading them inside a `"use client"`
 *     component returns `undefined` at render time, so the client
 *     would throw "GOOGLE_CLIENT_ID is not set" even when the value
 *     is present in the deploy env (e.g. GitHub Actions secret).
 *   - The page chrome (Navbar / Footer) and the env validation can
 *     stay server-rendered — the Google OAuth script is only fetched
 *     on `/login`, after the client content hydrates.
 *   - `<Suspense>` wraps the client content because it calls
 *     `useSearchParams()` — without a boundary, the page would bail
 *     out of static prerender.
 *
 * Why an empty-string fallback instead of a throw?
 *   `next build` runs in production mode and only auto-loads
 *   `.env.production` / `.env.local`. Throwing here would fail every
 *   local build where the developer hasn't created `.env.production`,
 *   even though the value is set in deploy (GitHub Actions secret).
 *   The middleware (`middleware.ts:11-20`) uses the same "return a
 *   clear 500 at request time" pattern — fail closed at the boundary
 *   the user actually hits, not at build time.
 */

/** Resolve the GSI client id server-side. Returns an empty string
 *  if absent so the build doesn't blow up; `<GoogleOAuthProvider>`
 *  will surface a clean runtime error in the browser when the
 *  value is empty (matches the convention in `middleware.ts`). */
function readGoogleClientId(): string {
  return process.env.GOOGLE_CLIENT_ID ?? "";
}

/** Force dynamic rendering: the page reads a non-`NEXT_PUBLIC_*`
 *  env var at request time, so it can't be statically prerendered.
 *  `/login` is per-request anyway (session lookup, redirect target
 *  from `?next=`), so opting out doesn't cost us anything. Without
 *  this flag Next.js would try to prerender the page during
 *  `next build` and the `GoogleOAuthProvider` would still need to
 *  serialize an empty clientId — opt out so the page is built once
 *  as a dynamic handler and resolved per request. */
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const clientId = readGoogleClientId();
  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <LoginPageContent clientId={clientId} />
      </Suspense>
      <Footer />
    </>
  );
}
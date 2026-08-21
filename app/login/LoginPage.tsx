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
 */

/** Resolve the GSI client id server-side and throw if absent. We'd
 *  rather see a loud render-time failure than ship a silently broken
 *  Google button. */
function requireGoogleClientId(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not set");
  }
  return clientId;
}

export default function LoginPage() {
  const clientId = requireGoogleClientId();
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
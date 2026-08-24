import LoginPage from "./LoginPage";

/** Force dynamic rendering: the route reads a non-`NEXT_PUBLIC_*`
 *  env var at request time, so it can't be statically prerendered.
 *  Without this flag `next build` would try to render the route at
 *  build time and the env-var read would return empty (build env
 *  doesn't auto-load `.env.development`). The flag opts the route
 *  out of static generation entirely — Next renders it on demand
 *  on each request, where the runtime env (e.g. docker-compose /
 *  GitHub Actions deploy) supplies the real value. */
export const dynamic = "force-dynamic";

/**
 * `/login` route entry. Reads `process.env.GOOGLE_CLIENT_ID`
 * server-side and forwards it to the client-only `LoginPage` as a
 * prop — non-`NEXT_PUBLIC_*` env vars are not inlined into the
 * browser bundle, so reading them inside `"use client"` code
 * returns `undefined` and the Google button silently breaks.
 *
 * Falls back to an empty string when the env var is absent rather
 * than throwing. Same fail-closed pattern as `middleware.ts:11-20`:
 * `next build` shouldn't blow up just because a developer hasn't
 * created `.env.production` locally; the runtime will surface a
 * clear GSI error in the browser when the value is empty (and
 * deploy envs that fail to set the secret get caught the moment
 * a user lands on the page, not at build time).
 */
export default function LoginRoute() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID ?? "";
  return <LoginPage googleClientId={googleClientId} />;
}
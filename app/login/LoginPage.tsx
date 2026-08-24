"use client";

import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LoginPageContent } from "./LoginPageContent";

/**
 * `/login` page chrome. Pure client component — receives the GSI
 * client id as a prop from the route entry (`app/login/page.tsx`)
 * so the env-var read stays server-side (non-`NEXT_PUBLIC_*` vars
 * are never inlined into the browser bundle).
 *
 * Wraps `<LoginPageContent />` in a `<Suspense>` boundary because
 * the content calls `useSearchParams()` — without a boundary, the
 * route would bail out of static prerender. Next prerenders the
 * chrome and streams the content in client-side. Mirrors the
 * pattern in `app/search/SearchPage.tsx`.
 *
 * The form sub-components (`IdentifierField`, `PasswordField`,
 * `SubmitButton`, `GoogleLoginSection`, `LoginCardHeader`) live in
 * `LoginPageContent.tsx` so all hook-bearing code is colocated and
 * this file stays a one-purpose chrome wrapper.
 */
export default function LoginPage({
  googleClientId,
}: {
  googleClientId: string;
}) {
  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <LoginPageContent googleClientId={googleClientId} />
      </Suspense>
      <Footer />
    </>
  );
}
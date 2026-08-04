"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  SETUP_TOKEN_KEY,
  USER_KEY,
  getAuthRedirectTarget,
  writeJson,
  type MockUser,
} from "@/lib/auth";
import { googleSession } from "@/lib/api/auth";

/**
 * `/auth/callback` — landing route for the Google OAuth flow.
 *
 * `loginWithGoogle()` in `lib/auth.ts` kicks the browser off to the
 * backend's `/auth/google` entrypoint; that backend talks to Google
 * and ultimately 302-redirects back here with session data in the
 * URL. This page consumes that data, persists the session via the
 * same `writeJson` plumbing the email flow uses, then hard-navigates
 * to the post-auth destination.
 *
 * The backend's exact redirect shape isn't pinned down yet, so the
 * page handles three plausible variants in priority order:
 *
 *   1. `?session=<base64-encoded RegisterResponse JSON>` —
 *      preferred: the full envelope (user + setupToken) in one shot.
 *   2. `?token=<jwt>&user=<base64-encoded user JSON>` —
 *      partial payload, useful if the backend ships user + token.
 *   3. `?token=<jwt>` only — fall back to `googleSession(token)`
 *      and let the backend reconstitute the envelope.
 *
 * If none of the above are present (or the URL has an `error=`
 * param), we render an error state with a link back to /login.
 *
 * Both the `<Suspense>` wrapper and the inner `useSearchParams()`
 * usage are required for static prerender — Next.js 14 rejects
 * `useSearchParams()` at the page root without a boundary. Same
 * pattern as `app/login/LoginPage.tsx` and `app/daftar/DaftarPage.tsx`,
 * mirrored from `app/search/SearchPage.tsx:162-172`.
 */
function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Surface backend-declared failures first.
        const urlError = searchParams.get("error");
        if (urlError) {
          throw new Error(
            `Login Google dibatalkan: ${decodeURIComponent(urlError)}`,
          );
        }

        const sessionEncoded = searchParams.get("session");
        const userEncoded = searchParams.get("user");
        const token = searchParams.get("token");

        // 1. ?session=<base64-json> — full envelope.
        if (sessionEncoded) {
          try {
            const decoded = JSON.parse(
              atob(decodeURIComponent(sessionEncoded)),
            ) as {
              user?: {
                id?: string;
                email?: string;
                username?: string;
                name?: string;
                createdAt?: string;
                isEmailVerified?: boolean;
              };
              setupToken?: string;
            };
            if (decoded.user?.email && decoded.user?.username) {
              const session = buildGoogleSession(decoded.user);
              if (decoded.setupToken) {
                writeJson(SETUP_TOKEN_KEY, decoded.setupToken);
              }
              if (!cancelled) commitAndRedirect(session, searchParams);
              return;
            }
          } catch (parseErr) {
            console.warn(
              "[auth/callback] could not parse ?session=, falling back",
              parseErr,
            );
          }
        }

        // 2. ?token=&user= — token plus payload.
        if (userEncoded) {
          try {
            const user = JSON.parse(
              atob(decodeURIComponent(userEncoded)),
            ) as Record<string, unknown>;
            if (
              typeof user.email === "string" &&
              typeof user.username === "string"
            ) {
              const session = buildGoogleSession(user);
              if (token) {
                // Keep the token around — backend shape may evolve.
                try {
                  sessionStorage.setItem(
                    "rangkuman:google:token",
                    token,
                  );
                } catch {
                  /* sessionStorage unavailable; ignore */
                }
              }
              if (!cancelled) commitAndRedirect(session, searchParams);
              return;
            }
          } catch (parseErr) {
            console.warn(
              "[auth/callback] could not parse ?user=, falling back",
              parseErr,
            );
          }
        }

        // 3. ?token= only — exchange via the backend.
        if (token) {
          const response = await googleSession(token);
          if (response?.user?.email && response.user.username) {
            const session = buildGoogleSession(response.user);
            if (response.setupToken) {
              writeJson(SETUP_TOKEN_KEY, response.setupToken);
            }
            if (!cancelled) commitAndRedirect(session, searchParams);
            return;
          }
        }

        throw new Error(
          "Sesi Google gak valid — coba lagi dari tombol Masuk.",
        );
      } catch (err) {
        if (cancelled) return;
        console.error("[auth/callback] failed:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Gagal memproses sesi Google.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  if (error) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
        <div className="rounded-lg border border-dashed border-border bg-bg-secondary/50 p-6">
          <h1 className="text-[16px] font-bold text-text-primary">
            Login Google gagal
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
            {error}
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-md bg-brand px-4 py-2 text-[13px] font-semibold text-bg-primary transition-colors hover:bg-brand-hover"
          >
            Kembali ke halaman masuk
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-brand" aria-hidden />
      <p className="mt-3 text-[13.5px] text-text-muted">
        Menyiapkan sesi Google&hellip;
      </p>
    </main>
  );
}

/** Build a `MockUser` from a Google / login-shape user payload,
 *  pinning `provider: "google"` so the rest of the app's auth
 *  gating can branch on it later. Accepts any object that has at
 *  least `email` and `username` — the same shape we get from
 *  `RegisterResponseUser` (returned by `googleSession` /
 *  `/auth/login` / `/auth/register`) and from the
 *  base64-decoded `?user=` / `?session=` payloads. */
function buildGoogleSession(user: {
  id?: unknown;
  email?: unknown;
  username?: unknown;
  name?: unknown;
  createdAt?: unknown;
  isEmailVerified?: unknown;
}): MockUser {
  return {
    id: typeof user.id === "string" ? user.id : undefined,
    email: String(user.email),
    username: String(user.username),
    name:
      typeof user.name === "string" && user.name.length > 0
        ? user.name
        : String(user.username),
    loggedInAt:
      typeof user.createdAt === "string"
        ? user.createdAt
        : new Date().toISOString(),
    provider: "google",
    isEmailVerified:
      typeof user.isEmailVerified === "boolean"
        ? user.isEmailVerified
        : false,
  };
}

/** Persist the session and hard-navigate to the post-auth
 *  destination — mirrors the `window.location.assign(...)` shape
 *  used by `app/login/LoginPage.tsx` (avoid the documented
 *  `setUser` race against the App Router). */
function commitAndRedirect(
  session: MockUser,
  searchParams: URLSearchParams,
): void {
  writeJson(USER_KEY, session);
  if (typeof window === "undefined") return;
  window.location.assign(getAuthRedirectTarget(searchParams));
}

/**
 * Default-exported page entry. Wraps the content in `<Suspense>`
 * because `useSearchParams()` is used inside, which Next.js 14
 * rejects at static-prerender time without a boundary. Mirrors
 * `app/search/SearchPage.tsx:162-172`.
 */
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackContent />
    </Suspense>
  );
}

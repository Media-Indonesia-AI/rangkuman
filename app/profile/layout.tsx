"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ProfileShell } from "@/components/profile/ProfileShell";
import { useCurrentUser } from "@/lib/hooks/useAuth";

/**
 * Shared chrome for `/profile/*` routes.
 *
 * Owns:
 *   - **Auth gate.** Hydration window (`user === undefined`) is
 *     handled by `<ProfileShell />` (renders a stable skeleton).
 *     Anonymous visitors (`user === null`) are pushed to
 *     `/login?next=/profile/<active>/` so they land back here after
 *     signing in. The `justLoggedOut` ref keeps the logout button
 *     from racing the auto-redirect (same trick
 *     `<WatchlistPage />` uses).
 *   - **Tab title.** No server-side `generateMetadata` (this is a
 *     client component for the auth hook), so a `useEffect` syncs
 *     `document.title` based on the active pathname. Format:
 *     `Rangkuman - <Tab Label>` (e.g. "Rangkuman - Top Up").
 *
 * All visual chrome (Navbar, two-column grid, Footer, sidebar,
 * mobile pill row) is delegated to `<ProfileShell />` so the
 * `/watchlist/` route can reuse the same frame.
 */
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useCurrentUser();
  const justLoggedOut = useRef(false);

  // Auto-redirect anonymous visitors to /login with the current
  // sub-route as `next` so they bounce back here after sign-in.
  // Skipped right after we trigger logout ourselves —
  // `window.location.assign("/")` is the canonical exit path and
  // the auto-redirect would race it back to /login instead.
  useEffect(() => {
    if (user === null && !justLoggedOut.current) {
      const next = pathname || "/profile/";
      router.replace(`/login?next=${encodeURIComponent(next)}/`);
    }
  }, [user, router, pathname]);

  // Tab title — derived from the active pathname so each sub-route
  // gets the right label without each <*Page /> needing its own
  // effect. Unknown paths fall back to "Profil" so the tab always
  // has a sensible title.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const label = pathname.startsWith("/profile/top-up")
      ? "Top Up"
      : pathname.startsWith("/profile/whatsapp")
        ? "WhatsApp"
        : "Profil";
    document.title = `Rangkuman - ${label}`;
    return () => {
      if (typeof document === "undefined") return;
      document.title = "Rangkuman";
    };
  }, [pathname]);

  return <ProfileShell user={user} content={children} />;
}

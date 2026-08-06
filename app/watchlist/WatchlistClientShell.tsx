"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ProfileShell } from "@/components/profile/ProfileShell";
import { useCurrentUser } from "@/lib/hooks/useAuth";

/**
 * `/watchlist/` client-side chrome. Renders the same two-column
 * `ProfileShell` frame the `/profile/*` routes use so the user
 * lands on a visually consistent surface (sidebar with the five
 * tabs/lists, right pane renders the existing
 * `<WatchlistPage />` content).
 *
 * Owns the auth gate (anonymous visitors →
 * `/login?next=/watchlist/`) and the tab title. The
 * `justLoggedOut` ref ensures the logout button inside
 * `<ProfileShell />` doesn't race the auto-redirect.
 *
 * Note: `<WatchlistPage />` previously did its own auth gate via
 * a `useEffect` inside the page body. The page body still has a
 * `null` early-return for `user === null` as a defense-in-depth
 * check during the same tick as the redirect, but the canonical
 * redirect happens here.
 */
export function WatchlistClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useCurrentUser();
  const justLoggedOut = useRef(false);

  useEffect(() => {
    if (user === null && !justLoggedOut.current) {
      const next = pathname || "/watchlist/";
      router.replace(`/login?next=${encodeURIComponent(next)}/`);
    }
  }, [user, router, pathname]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title = "Rangkuman - Watchlist";
    return () => {
      if (typeof document === "undefined") return;
      document.title = "Rangkuman";
    };
  }, []);

  return <ProfileShell user={user} content={children} />;
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ProfileShell } from "@/components/profile/ProfileShell";
import { useCurrentUser } from "@/lib/hooks/useAuth";

/**
 * `/saved/` client-side chrome. Renders the same two-column
 * `ProfileShell` frame the other personal-area routes use so the
 * user lands on a visually consistent surface (sidebar with the
 * same five tabs/lists, right pane renders the existing
 * `<SavedPage />` content).
 *
 * Unlike `/profile/*` and `/watchlist/`, `/saved/` is a
 * local-only surface — `useSaved()` reads from localStorage, so
 * we don't gate on the auth server session. The sidebar gracefully
 * shows the user card when the user is logged in (so the
 * existing "Profil" / "Keluar" entry points are visible) and
 * collapses to "Masuk" + the menu items when the user is
 * anonymous — same `ProfileShell` behavior, just no redirect.
 */
export function SavedClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = useCurrentUser();

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title = "Rangkuman - Berita Tersimpan";
    return () => {
      if (typeof document === "undefined") return;
      document.title = "Rangkuman";
    };
  }, [pathname]);

  return <ProfileShell user={user} content={children} />;
}

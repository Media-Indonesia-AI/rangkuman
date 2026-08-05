"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Bookmark,
  ListChecks,
  MessageCircle,
  User,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProfileMenu } from "@/components/profile/ProfileMenu";
import { LogoutButton } from "@/components/profile/LogoutButton";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { Shimmer } from "@/components/Shimmer";
import { cn } from "@/lib/utils";

/** Menu items — duplicated here so the mobile pill row can render
 *  the same items without re-importing the sidebar's internal
 *  structure. Grouped the same way as the sidebar: account
 *  (Profil lo) at the top, content lists (Konten lo) below.
 *  Labels are shortened on the mobile pills so the items fit
 *  without clipping the row width. */
type MenuLink = {
  href: string;
  label: string;
  Icon: LucideIcon;
};
const ACCOUNT_MENU: ReadonlyArray<MenuLink> = [
  { href: "/profile/", label: "Akun", Icon: User },
  { href: "/profile/top-up/", label: "Top Up", Icon: Wallet },
  {
    href: "/profile/whatsapp/",
    label: "WhatsApp",
    Icon: MessageCircle,
  },
];
const LISTS_MENU: ReadonlyArray<MenuLink> = [
  { href: "/watchlist/", label: "Watchlist", Icon: ListChecks },
  { href: "/saved/", label: "Tersimpan", Icon: Bookmark },
];

/**
 * Shared chrome for `/profile/*` routes.
 *
 * Owns:
 *   - **Auth gate.** Hydration window (`user === undefined`) shows a
 *     neutral loader matching the layout's two-column shape so the
 *     padding doesn't jump when the user lands. Anonymous visitors
 *     (`user === null`) are pushed to `/login?next=/profile/<active>/`
 *     so they land back here after signing in. The `justLoggedOut`
 *     ref keeps the logout button from racing the auto-redirect
 *     (same trick `<WatchlistPage />` uses).
 *   - **Two-column layout.** Sidebar (`<ProfileMenu />`) on `md:`+,
 *     horizontal pill row on smaller widths. Right pane is the
 *     `children` slot — each sub-route (`/profile/`, `/profile/top-up/`,
 *     `/profile/whatsapp/`) renders its own `<*Page />` there.
 *   - **Tab title.** No server-side `generateMetadata` (this is a
 *     client component for the auth hook), so a `useEffect` syncs
 *     `document.title` based on the active pathname. Format:
 *     `Rangkuman - <Tab Label>` (e.g. "Rangkuman - Top Up").
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

  // While localStorage hydration is in flight, render a stable
  // skeleton that mirrors the real layout's two-column shape so
  // the page doesn't reflow when the user lands.
  if (user === undefined) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[14rem_minmax(0,1fr)]">
            <aside aria-hidden>
              <ProfileLayoutSkeleton />
            </aside>
            <section aria-busy>
              <Shimmer className="mb-3 h-5 w-32" />
              <Shimmer className="mb-2 h-7 w-64" />
              <Shimmer className="mb-5 h-4 w-80" />
              <div className="space-y-2.5">
                {[0, 1, 2, 3].map((i) => (
                  <Shimmer key={i} className="h-12 w-full" />
                ))}
              </div>
            </section>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Logged-out → let the redirect effect handle navigation. Don't
  // render the page chrome so the user doesn't see a flash of the
  // unauthenticated profile before the push lands.
  if (user === null) return null;

  // Logged-in → real layout. The sidebar is filtered through a
  // soft sticky offset (`md:top-20`) so it stays in view as the
  // user scrolls the right pane.
  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[14rem_minmax(0,1fr)]">
          {/* Sidebar on md:+ ; hidden on smaller widths because the
              mobile pill row is rendered inline below. */}
          <aside className="hidden md:block">
            <div className="md:sticky md:top-20">
              <ProfileMenu
                userName={user.name}
                userEmail={user.email}
              />
            </div>
          </aside>

          {/* Mobile pill row — same menu items, horizontal layout.
              Visible <md only. */}
          <div className="md:hidden">
            <ProfileMenuMobile
              userName={user.name}
              userEmail={user.email}
            />
          </div>

          {/* Right pane — each sub-route renders here. */}
          <section className="min-w-0">{children}</section>
        </div>
      </main>

      <Footer />
    </>
  );
}

/** Sidebar-loading placeholder — same vertical structure as the
 *  real menu so the page doesn't reflow when the user lands. */
function ProfileLayoutSkeleton() {
  return (
    <nav aria-hidden className="flex flex-col gap-1">
      <div className="mb-3 flex items-center gap-2.5 rounded-lg border border-border bg-bg-secondary p-2.5">
        <Shimmer className="h-9 w-9 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Shimmer className="h-3.5 w-24" />
          <Shimmer className="h-2.5 w-32" />
        </div>
      </div>
      <Shimmer className="h-2.5 w-12" />
      <div className="space-y-1">
        {[0, 1, 2].map((i) => (
          <Shimmer key={i} className="h-8 w-full" />
        ))}
      </div>
      <div className="mt-3 border-t border-border pt-3">
        <Shimmer className="h-8 w-full" />
      </div>
    </nav>
  );
}

/** Mobile-only compact menu — same items as the sidebar, but laid
 *  out horizontally so it doesn't dominate the small-screen
 *  viewport. The user card (avatar + name + email) sits on top of
 *  the pill row for context; the menu items render as a
 *  scrollable-on-overflow flex row so the user can switch tabs
 *  without hopping back to the Navbar. The destructive logout
 *  action reuses `<LogoutButton />` so the dialog flow is
 *  identical to the desktop path.
 *
 *  Active row matched by `pathname === href` (exact match) — same
 *  rule the sidebar uses — so a deep-link to `/profile/top-up/`
 *  lights up only the "Top Up" pill. */
function ProfileMenuMobile({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const initial = (userName?.trim().charAt(0) || "?").toUpperCase();
  return (
    <div className="rounded-lg border border-border bg-bg-secondary p-3">
      <div className="mb-2.5 flex items-center gap-2.5">
        <span
          aria-hidden
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/20 text-[13px] font-bold text-brand"
        >
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-text-primary">
            {userName || "—"}
          </p>
          <p className="truncate text-[10.5px] text-text-faint">{userEmail}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2.5 border-t border-border pt-2.5">
        {/* Account row — same grouping as the desktop sidebar so
            the visual vocabulary stays consistent. */}
        <div className="flex flex-wrap items-center gap-1.5">
          {ACCOUNT_MENU.map((m) => {
            const active = pathname === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors",
                  active
                    ? "bg-bg-tertiary text-text-primary"
                    : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
                )}
              >
                <m.Icon className="h-3 w-3" aria-hidden />
                {m.label}
              </Link>
            );
          })}
        </div>
        {/* Lists row — the user's own collections. Sits on its own
            line so the pills don't crowd each other at small
            widths. */}
        <div className="flex flex-wrap items-center gap-1.5">
          {LISTS_MENU.map((m) => {
            const active = pathname === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[12px] font-medium transition-colors",
                  active
                    ? "border-brand bg-brand-soft text-brand"
                    : "text-text-secondary hover:border-border-strong hover:text-text-primary",
                )}
              >
                <m.Icon className="h-3 w-3" aria-hidden />
                {m.label}
              </Link>
            );
          })}
          <span className="ml-auto">
            <LogoutButton variant="nav" />
          </span>
        </div>
      </div>
    </div>
  );
}

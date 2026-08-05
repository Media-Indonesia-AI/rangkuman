"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { ProfileMenu } from "./ProfileMenu";
import { LogoutButton } from "./LogoutButton";
import { Shimmer } from "@/components/Shimmer";
import type { MockUser } from "@/lib/auth";
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

interface ProfileShellProps {
  /**
   * Auth state. `undefined` = localStorage hydration in flight
   * (renders a stable two-column skeleton). `null` = anonymous
   * (renders `null` so the calling layout's redirect effect can
   * push to `/login` without a flash). `MockUser` = logged in
   * (renders the full layout with sidebar + content).
   *
   * The shell intentionally does NOT own the redirect effect —
   * each route's `layout.tsx` decides whether to gate (e.g.
   * `/saved/` is local-only, so it accepts `null` and renders the
   * page anyway, just without the user card in the sidebar).
   */
  user: MockUser | null | undefined;
  /** Tab title override. When the calling layout wants the same
   *  title for every sub-route (e.g. `/profile/*` uses
   *  "Rangkuman - <tab>"), it can pass `null` and write its own
   *  effect. Pass a string to lock the title to a fixed value. */
  content: React.ReactNode;
}

/**
 * Shared two-column shell for the profile/watchlist/saved routes.
 *
 * Layout:
 *   - `Navbar` on top.
 *   - Two-column grid on `md:`+ — sidebar (`<ProfileMenu />`) on
 *     the left, content slot on the right. The sidebar is
 *     `md:sticky md:top-20` so it stays in view as the user
 *     scrolls the right pane.
 *   - Below `md`, the sidebar collapses into a compact horizontal
 *     pill row (still wrapped in the same `bg-bg-secondary` card
 *     so the visual vocabulary is identical).
 *   - `Footer` on the bottom.
 *
 * Three render states based on `user`:
 *   - `undefined` → skeleton. The skeleton mirrors the layout's
 *     two-column shape so the page doesn't reflow when the user
 *     lands.
 *   - `null` → returns `null`. The calling layout handles the
 *     redirect to `/login` itself; rendering nothing here avoids
 *     a flash of the unauthenticated page.
 *   - `MockUser` → full layout, with the user card in the sidebar
 *     carrying the avatar / name / email.
 *
 * Active state: each menu item matches by `href` (exact) so a
 * deep-link to `/profile/top-up/` lights up only the "Top Up"
 * row.
 */
export function ProfileShell({ user, content }: ProfileShellProps) {
  if (user === undefined) return <ProfileShellSkeleton />;
  if (user === null) return null;

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[14rem_minmax(0,1fr)]">
          {/* Desktop sidebar — visible on md:+. The sticky
              offset keeps it in view as the user scrolls the
              right pane. */}
          <aside className="hidden md:block">
            <div className="md:sticky md:top-20">
              <ProfileMenu
                userName={user.name}
                userEmail={user.email}
              />
            </div>
          </aside>

          {/* Mobile pill row — visible <md only. The user card
              stays above the pill row for context. The
              destructive logout action reuses
              <LogoutButton /> so the dialog flow is identical
              to the desktop path. */}
          <div className="md:hidden">
            <ProfileMenuMobile
              userName={user.name}
              userEmail={user.email}
            />
          </div>

          {/* Right pane — the calling layout's page content
              renders here. The `min-w-0` prevents the section
              from forcing the grid to overflow when the content
              is wider than expected (e.g. `<StoryEditorial />`
              grids). */}
          <section className="min-w-0">{content}</section>
        </div>
      </main>

      <Footer />
    </>
  );
}

/**
 * Two-column skeleton used while `useCurrentUser` is hydrating.
 * Same sidebar shape + content pulses the real layout uses so the
 * page doesn't reflow when the user lands.
 */
function ProfileShellSkeleton() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[14rem_minmax(0,1fr)]">
          <aside aria-hidden>
            <ProfileSidebarSkeleton />
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

/** Sidebar-loading placeholder — same vertical structure as the
 *  real menu so the page doesn't reflow when the user lands. */
function ProfileSidebarSkeleton() {
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

/**
 * Mobile-only compact menu — same items as the sidebar, but laid
 * out horizontally so it doesn't dominate the small-screen
 * viewport. The user card (avatar + name + email) sits on top of
 * the pill row for context; the menu items render as two stacked
 * flex rows (account + lists) so five items don't crowd each other
 * on phones. The destructive logout action reuses
 * `<LogoutButton />` so the dialog flow is identical to the
 * desktop path.
 *
 * Active row matched by `pathname === href` (exact match) — same
 * rule the sidebar uses — so a deep-link to `/profile/top-up/`
 * lights up only the "Top Up" pill.
 */
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

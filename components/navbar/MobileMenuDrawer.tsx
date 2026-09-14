"use client";

import {
  Fragment,
  type MouseEvent,
  type Ref,
} from "react";
import Link from "next/link";
import {
  ListChecks,
  MessageCircle,
  User,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { User as UserType } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/SearchBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoutButton } from "@/components/profile/LogoutButton";

/** Section / item grid for the drawer's profile menu. Each section
 *  gets its own header row (e.g. "Akun", "Konten") followed by the
 *  link rows. The map renders both — the structure flows from
 *  data, so adding a new section is one entry, not a copy-paste
 *  of the `<li>` / `<Link>` boilerplate. */
const PROFILE_MENU_SECTIONS: {
  section: string;
  items: { href: string; label: string; Icon: LucideIcon }[];
}[] = [
  {
    section: "Akun",
    items: [
      { href: "/profile/", label: "Akun", Icon: User },
      { href: "/profile/top-up/", label: "Top Up", Icon: Wallet },
    ],
  },
  {
    section: "Konten",
    items: [
      { href: "/watchlist/", label: "Watchlist", Icon: ListChecks },
      { href: "/profile/whatsapp/", label: "Kirim Berita ke WhatsApp", Icon: MessageCircle },
    ],
  },
];

/** Shared className for the drawer's profile menu links. Pulled
 *  out so the active-state styling (hover + `aria-current=page`)
 *  stays consistent across rows — the desktop navbar's more
 *  compact links use a different (smaller) layout so they
 *  intentionally don't share this constant. */
const DRAWER_LINK_CLASSES =
  "flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium text-text-secondary hover:bg-bg-tertiary hover:text-text-primary aria-[current=page]:bg-brand-soft aria-[current=page]:text-brand";

interface MobileMenuDrawerProps {
  /** Forwarded ref to the drawer's outer `<div>`. The outside-
   *  click listener in `useMobileMenu` uses this to skip clicks
   *  that land inside the drawer. */
  drawerRef: Ref<HTMLDivElement>;
  /** Whether the drawer is currently open. Drives the height /
   *  opacity transition. */
  open: boolean;
  /** Signed-in user, or `null` for anonymous visitors. Controls
   *  which sub-sections render (search, profile sections,
   *  logout). */
  user: UserType | null;
  /** Current pathname, used to set `aria-current="page"` on
   *  the matching link inside the drawer. */
  pathname: string;
  /** Click handler wired to the drawer's outer `<div>`. Closes
   *  the menu when the user clicks any `<a>` or `<button>` inside
   *  the drawer — the logout button doesn't navigate, so without
   *  this the menu would stay open after the confirm dialog
   *  appears. */
  onClick: (e: MouseEvent<HTMLDivElement>) => void;
}

/** Mobile menu drawer — fixed-position panel that drops below the
 *  navbar on phone viewports. Owns its own `overflow-y-auto` so
 *  the inner scroll is isolated from the body (paired with the
 *  body-scroll lock in `useMobileMenu`). */
export function MobileMenuDrawer({
  drawerRef,
  open,
  user,
  pathname,
  onClick,
}: MobileMenuDrawerProps) {
  return (
    <div
      id="mobile-menu"
      ref={drawerRef}
      onClick={onClick}
      className={cn(
        "fixed left-0 right-0 top-14 z-40 overflow-y-auto overflow-x-hidden border-t border-border bg-bg-secondary shadow-2xl transition-[max-height,opacity] duration-200 md:hidden",
        open
          ? "max-h-[calc(100vh-3.5rem)] opacity-100"
          : "max-h-0 opacity-0",
      )}
    >
      {/* Mobile search — only for signed-in users. Anonymous users
          don't have a watchlist to search against, so the field
          would just be dead weight at the top of the drawer. */}
      {user && (
        <div className="border-b border-border px-4 py-3">
          <SearchBar />
        </div>
      )}

      <ul className="space-y-1 px-4 py-3">
        {/* Profile menu items — only visible when logged in.
            Each section (header + link rows) is rendered from
            `PROFILE_MENU_SECTIONS`, so the structure flows from
            data and adding a new section is one entry. The link
            rows share `DRAWER_LINK_CLASSES` + the `aria-current`
            derived from the active pathname so they stay in
            sync. */}
        {user &&
          PROFILE_MENU_SECTIONS.map(({ section, items }) => (
            <Fragment key={section}>
              <li className="px-2 pt-3 pb-1">
                <p className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-faint">
                  {section}
                </p>
              </li>
              {items.map(({ href, label, Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={DRAWER_LINK_CLASSES}
                    aria-current={pathname === href ? "page" : undefined}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {label}
                  </Link>
                </li>
              ))}
            </Fragment>
          ))}

        <div className="md:hidden">
          {user && <li className="border-t border-border pt-1.5" />}
          <div className="flex items-center justify-between w-full pb-1.5 px-3">
            <span className="text-sm font-medium text-text-secondary">
              Theme
            </span>
            <ThemeToggle />
          </div>

          {!user && (
            <li>
              <Link
                href="/login"
                className="flex items-center justify-between rounded-md bg-brand-soft px-3 py-2.5 text-[14px] font-medium text-brand"
              >
                <span>Masuk / Daftar</span>
              </Link>
            </li>
          )}
        </div>

        {/* Logout — pinned at the bottom of the menu list so the
            destructive action is the last thing the user sees,
            matching the desktop sidebar's placement. Wrapped
            in a top divider so it visually separates from the
            nav links above. Only visible when logged in. */}
        {user && (
          <li className="border-t border-border pt-1.5">
            <LogoutButton variant="nav" />
          </li>
        )}
      </ul>
    </div>
  );
}

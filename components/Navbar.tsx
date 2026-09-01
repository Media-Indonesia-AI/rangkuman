"use client";

import { Fragment, useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bitcoin,
  ListChecks,
  Menu,
  MessageCircle,
  TrendingUp,
  User,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { Brand } from "./Brand";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/profile/LogoutButton";

const NAV_LINKS = [
  { href: "/saham", label: "Saham", Icon: TrendingUp },
  { href: "/crypto", label: "Crypto", Icon: Bitcoin },
];

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

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useCurrentUser();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Lock body scroll while the drawer is open so the page behind
  // doesn't scroll when the user scrolls the drawer. The drawer's
  // own `overflow-y-auto` then handles the inner scroll in
  // isolation. Saves / restores the original `overflow` value so
  // any other component that touched it (e.g. `<ShareButton />`)
  // isn't clobbered on unmount.
  useEffect(() => {
    if (!menuOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [menuOpen]);

  // Close on click outside the drawer. The navbar is z-40 above
  // the backdrop (z-30), so clicks on the navbar don't reach the
  // backdrop's onClick — this listener catches them. Three
  // exclusions, all by element:
  //   - the hamburger toggle (`aria-controls="mobile-menu"`) —
  //     it has its own onClick that toggles, so this listener
  //     must not also fire `setMenuOpen(false)` on the next tick.
  //   - the in-drawer close button (`data-close-menu`) — it's
  //     a `fixed` overlay at the same position as the hamburger
  //     but at z-50. If this listener fired on it, the menu
  //     would close on pointerdown, React would unmount the
  //     close button, and the subsequent click event would land
  //     on the hamburger (same position, z-40) and toggle the
  //     menu back open. Excluding it lets the close button's
  //     own onClick fire while the button is still in the DOM.
  //   - anything inside the drawer — the drawer's own
  //     `handleDrawerClick` already closes the menu on link /
  //     button clicks.
  // `pointerdown` (not `click`) so the target is the element the
  // user actually pressed, not the common ancestor of a press-
  // inside-drag-outside gesture. `pointerdown` also fires for
  // touch + pen, unified with mouse.
  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[aria-controls="mobile-menu"]')) return;
      if (target.closest('[data-close-menu]')) return;
      if (drawerRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);

  /**
   * Drawer-internal click handler. Closes the menu when the user
   * clicks any `<a>` or `<button>` inside the drawer — covers the
   * common "user picked an option, hide the menu now" path. The
   * logout button doesn't navigate, so without this the menu
   * would stay open after the confirm dialog appears. The search
   * input is intentionally exempt — `closest('a, button')` only
   * matches links and buttons, so typing into the search bar
   * doesn't dismiss the drawer.
   */
  const handleDrawerClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("a, button")) {
      setMenuOpen(false);
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-bg-primary/80">
      <nav className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
        {/* Brand logo + name — 42px lockup but explicitly opt out
            of the auto-ring (which Brand only adds for size ≥ 40
            by default) so the icon sits flush against the navbar
            background. */}
        <Brand logoSize={42} withRing={false} />

        {/* Main links — visible on every screen size so the user
            can reach Saham / Crypto from the navbar directly,
            without opening the drawer. The drawer still renders
            them too for "menu" completeness, but the navbar is
            the always-visible affordance. `shrink-0` keeps the
            row from collapsing under narrow widths — better to
            overflow than to squish the labels. */}
        <ul className="flex shrink-0 items-center gap-0.5">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-bg-tertiary text-text-primary"
                      : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Search bar — sits between nav and right actions */}
        <div className="ml-auto hidden flex-1 justify-center sm:flex sm:max-w-md">
          <SearchBar />
        </div>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-2 sm:ml-2">
          <ThemeToggle />

          {user ? (
            // Profile pill — hidden on mobile because the same
            // entry point lives in the hamburger menu drawer
            // (as the prominent "Profil (name)" link at the top).
            // Exposing it both in the navbar and in the drawer
            // doubles the affordance without giving the user a
            // second reason to open the drawer. The Masuk button
            // for anonymous users stays visible on mobile because
            // there's no equivalent in the drawer for that case.
            <Link
              href="/profile/"
              className="hidden h-9 items-center gap-1.5 rounded-md border border-border bg-bg-secondary px-2.5 text-[12.5px] font-medium text-text-primary transition-colors hover:border-border-strong md:inline-flex"
              aria-label={`Profil (${user.name})`}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand/20 text-[10px] font-bold uppercase text-brand">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="hidden sm:inline">Profil</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-9 items-center rounded-md bg-brand px-3 text-[13px] font-semibold text-bg-primary transition-colors hover:bg-brand-hover"
            >
              Masuk
            </Link>
          )}

          {/* Mobile menu button — only on phones, and only when
              logged in. Anonymous users have no drawer content
              (no profile/watchlist/logout entries), so the toggle
              would just open a near-empty panel — the "Masuk"
              button next to it is the action they actually need. */}
          {user && (
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-bg-secondary text-text-primary transition-colors hover:border-border-strong md:hidden"
            >
              {menuOpen ? (
                <X className="h-4 w-4" aria-hidden />
              ) : (
                <Menu className="h-4 w-4" aria-hidden />
              )}
            </button>
          )}
        </div>
      </nav>

      {/* Backdrop — sits behind the drawer. Click anywhere on
          it to close the menu (the same Escape / route-change
          close already exists). The backdrop is `pointer-events-none`
          when the menu is closed so it doesn't intercept clicks
          on the page below. `md:hidden` keeps it out of the
          desktop layout entirely. */}
      <div
        aria-hidden
        className={cn(
          "fixed inset-0 z-30 bg-bg-primary/60 backdrop-blur-sm transition-opacity duration-200 md:hidden",
          menuOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onClick={() => setMenuOpen(false)}
      />

      {/* Close button — `fixed` overlay at the top right of the
          viewport, sitting directly on top of the hamburger
          toggle in the navbar. The hamburger already shows an X
          when the menu is open, but it's a small 36×36 toggle
          that the user might miss; this overlay is an explicit
          "close" affordance at the same position. `z-50` puts
          it above the navbar (z-40) so the click targets the
          close, not the toggle. Conditionally rendered — when
          the menu is closed, the hamburger alone is the
          affordance. `md:hidden` keeps it off the desktop layout. */}
      {menuOpen && (
        <button
          type="button"
          data-close-menu
          onClick={() => setMenuOpen(false)}
          aria-label="Tutup menu"
          className="fixed right-4 top-2.5 z-50 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-bg-secondary text-text-primary transition-colors hover:border-border-strong md:hidden"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      )}

      {/* Mobile menu drawer — fixed position so it doesn't push
          page content, with its own `overflow-y-auto` so the inner
          scroll is isolated from the body (paired with the
          `useEffect` body-scroll-lock above). */}
      <div
        id="mobile-menu"
        ref={drawerRef}
        onClick={handleDrawerClick}
        className={cn(
          "fixed left-0 right-0 top-14 z-40 overflow-y-auto overflow-x-hidden border-t border-border bg-bg-secondary shadow-2xl transition-[max-height,opacity] duration-200 md:hidden",
          menuOpen
            ? "max-h-[calc(100vh-3.5rem)] opacity-100"
            : "max-h-0 opacity-0",
        )}
      >
        {/* Mobile search */}
        <div className="border-b border-border px-4 py-3">
          <SearchBar />
        </div>
        <ul className="space-y-1 px-4 py-3">
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
    </header>
  );
}

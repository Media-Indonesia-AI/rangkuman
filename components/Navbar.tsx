"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bitcoin,
  Bookmark,
  ListChecks,
  Menu,
  MessageCircle,
  TrendingUp,
  User,
  Wallet,
  X,
} from "lucide-react";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { Brand } from "./Brand";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/profile/LogoutButton";

const NAV_LINKS = [
  { href: "/saham", label: "Saham", Icon: TrendingUp },
  // { href: "/bisnis", label: "Bisnis", Icon: Building2 },
  // { href: "/ekonomi", label: "Ekonomi", Icon: Landmark },
  // { href: "/kebijakan", label: "Kebijakan", Icon: Scale },
  // { href: "/global", label: "Global", Icon: Globe },
  { href: "/crypto", label: "Crypto", Icon: Bitcoin },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useCurrentUser();

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

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-bg-primary/80">
      <nav className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
        {/* Brand logo + name */}
        <Brand logoSize={32} />

        {/* Main links — visible on tablet+ */}
        <ul className="hidden items-center gap-0.5 md:flex">
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

          {/* Mobile menu button — only on phones */}
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
        </div>
      </nav>

      {/* Mobile menu drawer */}
      <div
        id="mobile-menu"
        className={cn(
          "overflow-y-auto overflow-x-hidden border-t border-border bg-bg-secondary transition-[max-height,opacity] duration-200 md:hidden",
          menuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0",
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

          {/* Nav links — Saham & Crypto. Rendered before the
              profile menu items so the brand's primary content
              surfaces are the first thing the user sees when they
              open the drawer. Same icon + hover treatment as the
              profile menu items below for a consistent visual
              vocabulary. */}
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            const Icon = link.Icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center justify-between rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-bg-tertiary text-text-primary"
                      : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {link.label}
                  </span>
                  {active && (
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full bg-brand"
                    />
                  )}
                </Link>
              </li>
            );
          })}

          {/* Profile menu items — only visible when logged in.
              Same grouping + order as the desktop sidebar
              ("Profil lo" / "Konten lo") so the visual vocabulary
              is consistent across the brand. Each row uses the
              same icon + hover treatment so the section reads as a
              single coherent group. */}
          {user && (
            <>
              <li className="px-2 pt-3 pb-1">
                <p className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-faint">
                  Profil
                </p>
              </li>
              <li>
                <Link
                  href="/profile/"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                  aria-current={pathname === "/profile/" ? "page" : undefined}
                >
                  <User className="h-3.5 w-3.5" aria-hidden />
                  Akun
                </Link>
              </li>
              <li>
                <Link
                  href="/profile/top-up/"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                  aria-current={pathname === "/profile/top-up/" ? "page" : undefined}
                >
                  <Wallet className="h-3.5 w-3.5" aria-hidden />
                  Top Up
                </Link>
              </li>

              <li className="px-2 pt-3 pb-1">
                <p className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-faint">
                  Konten
                </p>
              </li>
              <li>
                <Link
                  href="/watchlist/"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                  aria-current={pathname === "/watchlist/" ? "page" : undefined}
                >
                  <ListChecks className="h-3.5 w-3.5" aria-hidden />
                  Watchlist
                </Link>
              </li>
              <li>
                <Link
                  href="/saved/"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                  aria-current={pathname === "/saved/" ? "page" : undefined}
                >
                  <Bookmark className="h-3.5 w-3.5" aria-hidden />
                  Berita Tersimpan
                </Link>
              </li>
              <li>
                <Link
                  href="/profile/whatsapp/"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                  aria-current={pathname === "/profile/whatsapp/" ? "page" : undefined}
                >
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                  Kirim Berita ke WhatsApp
                </Link>
              </li>
            </>
          )}

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

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, Bookmark } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { Brand } from "./Brand";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { useSaved } from "@/lib/hooks/useSaved";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/saham", label: "Saham" },
  { href: "/bisnis", label: "Bisnis" },
  { href: "/ekonomi", label: "Ekonomi" },
  { href: "/kebijakan", label: "Kebijakan" },
  { href: "/global", label: "Global" },
  { href: "/crypto", label: "Crypto" },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useCurrentUser();
  const { count: savedCount } = useSaved();

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
        <ul className="hidden items-center gap-0.5 sm:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "relative rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-bg-tertiary text-text-primary"
                      : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
                  )}
                >
                  {link.label}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-x-3 -bottom-[6px] h-0.5 bg-brand"
                    />
                  )}
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

          {/* Saved count badge — only visible when count > 0 */}
          {savedCount > 0 && (
            <Link
              href="/saved"
              aria-label={`Lihat ${savedCount} berita tersimpan`}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-brand/30 bg-brand/10 px-2.5 text-[12.5px] font-medium text-brand transition-colors hover:border-brand/60 hover:bg-brand/20"
            >
              <Bookmark className="h-3.5 w-3.5" aria-hidden />
              <span className="font-mono text-[11px] font-bold tabular-nums">
                {savedCount}
              </span>
              <span className="hidden sm:inline">Tersimpan</span>
            </Link>
          )}

          {user ? (
            <Link
              href="/watchlist"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-bg-secondary px-2.5 text-[12.5px] font-medium text-text-primary transition-colors hover:border-border-strong"
              aria-label={`Watchlist (${user.name})`}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand/20 text-[10px] font-bold uppercase text-brand">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="hidden sm:inline">Watchlist</span>
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-bg-secondary text-text-primary transition-colors hover:border-border-strong sm:hidden"
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
          "overflow-hidden border-t border-border bg-bg-secondary transition-[max-height,opacity] duration-200 sm:hidden",
          menuOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        {/* Mobile search */}
        <div className="border-b border-border px-4 py-3">
          <SearchBar />
        </div>
        <ul className="space-y-1 px-4 py-3">
          {savedCount > 0 && (
            <li>
              <Link
                href="/saved"
                className="flex items-center justify-between rounded-md bg-brand-soft px-3 py-2.5 text-[14px] font-medium text-brand"
              >
                <span className="inline-flex items-center gap-2">
                  <Bookmark className="h-4 w-4" aria-hidden />
                  Tersimpan ({savedCount})
                </span>
              </Link>
            </li>
          )}
          {user && (
            <li>
              <Link
                href="/watchlist"
                className="flex items-center justify-between rounded-md bg-bullish-soft px-3 py-2.5 text-[14px] font-medium text-bullish"
              >
                <span className="inline-flex items-center gap-2">
                  <User className="h-4 w-4" aria-hidden />
                  Watchlist ({user.name})
                </span>
              </Link>
            </li>
          )}
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
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center justify-between rounded-md px-3 py-2.5 text-[14px] font-medium transition-colors",
                    active
                      ? "bg-bg-tertiary text-text-primary"
                      : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
                  )}
                >
                  <span>{link.label}</span>
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
        </ul>
        <div className="border-t border-border px-4 py-2.5">
          <p className="label">Tentang</p>
          <p className="mt-1 text-[11.5px] leading-snug text-text-muted">
            Recap saham harian untuk investor ritel Indonesia.
          </p>
        </div>
      </div>
    </header>
  );
}

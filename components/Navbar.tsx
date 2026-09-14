"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bitcoin, TrendingUp } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { Brand } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { useLogoSize } from "@/lib/hooks/useLogoSize";
import { useMobileMenu } from "@/lib/hooks/useMobileMenu";
import { cn } from "@/lib/utils";
import {
  MobileMenuBackdrop,
  MobileMenuButton,
  MobileMenuCloseButton,
  MobileMenuDrawer,
  UserActions,
} from "./navbar/index";

const NAV_LINKS = [
  { href: "/saham", label: "Saham", Icon: TrendingUp },
  { href: "/crypto", label: "Crypto", Icon: Bitcoin },
];

export function Navbar() {
  const pathname = usePathname();
  const user = useCurrentUser();
  const logoSize = useLogoSize();
  const { menuOpen, setMenuOpen, drawerRef, onDrawerClick } = useMobileMenu();

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
        <Brand logoSize={logoSize} withRing={false} />

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
          {user && <SearchBar className="hidden md:inline-flex" />}
        </div>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-2 sm:ml-2">
          <div className="hidden md:inline-flex">
            <ThemeToggle />
          </div>

          <UserActions user={user ?? null} />

          <MobileMenuButton
            open={menuOpen}
            onToggle={() => setMenuOpen((v) => !v)}
          />
        </div>
      </nav>

      {/* Mobile menu widgets — three layers stacked behind the
          navbar's stacking context (z-40 root, via backdrop-filter):
          backdrop (z-30), drawer (z-40), close button (z-50). Each
          widget owns its own behavior; `useMobileMenu` handles the
          state plumbing that ties them together. */}
      <MobileMenuBackdrop
        open={menuOpen}
        onClick={() => setMenuOpen(false)}
      />
      {menuOpen && (
        <MobileMenuCloseButton onClose={() => setMenuOpen(false)} />
      )}
      <MobileMenuDrawer
        drawerRef={drawerRef}
        open={menuOpen}
        user={user ?? null}
        pathname={pathname}
        onClick={onDrawerClick}
      />
    </header>
  );
}

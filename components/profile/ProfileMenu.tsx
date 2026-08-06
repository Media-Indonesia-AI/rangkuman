"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ListChecks,
  MessageCircle,
  User,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import { cn } from "@/lib/utils";

interface ProfileMenuProps {
  /** Display name used in the avatar fallback (`name.charAt(0)`). */
  userName: string;
  /** Email rendered under the name in the user card. */
  userEmail: string;
}

/** Menu items — single source of truth for the sidebar nav and
 *  the mobile pill row. Grouped into two sections so the
 *  account-related tabs (Akun / Top Up / WhatsApp) stay visually
 *  distinct from the read-only content lists (Watchlist /
 *  Berita Tersimpan). The active-state lookup matches by `href`
 *  per item, so a deep-link to `/profile/top-up/` lights up only
 *  the "Top Up" row. */
type MenuLink = {
  href: string;
  label: string;
  Icon: LucideIcon;
};

/** Account-related — rendered under the "Profil lo" section. */
const ACCOUNT_MENU: ReadonlyArray<MenuLink> = [
  { href: "/profile/", label: "Akun", Icon: User },
  { href: "/profile/top-up/", label: "Top Up", Icon: Wallet },
  
];

/** Content lists — the user's own collections. Lives outside the
 *  `/profile/` tree (these pages already existed before the side
 *  nav was built): Watchlist is at `/watchlist/`. The sidebar
 *  just adds a discoverability path so the user can reach them
 *  from the profile area too. */
const LISTS_MENU: ReadonlyArray<MenuLink> = [
  { href: "/watchlist/", label: "Watchlist", Icon: ListChecks },
  {
    href: "/profile/whatsapp/",
    label: "Kirim Berita ke WhatsApp",
    Icon: MessageCircle,
  },
];

/**
 * Left-bar menu for the `/profile/*` routes. Composed of:
 *
 *   1. **User card** — avatar bubble + name + email. Stays at the
 *      top of the sidebar so the user always sees which account is
 *      signed in, even when switching tabs.
 *   2. **Menu items** — same `<Link>` markup whether the sidebar is
 *      rendered as a vertical `aside` on `md:`+ or as a horizontal
 *      pill row on smaller widths. Container layout is owned by
 *      `<ProfileLayout />`; this component only renders the items.
 *   3. **Keluar** — destructive button pinned to the bottom of the
 *      vertical sidebar via the layout's flex column. Wraps the
 *      shared `<LogoutButton />` so the dialog + window.location
 *      sign-out flow is identical to the rest of the app.
 *
 * The active row is matched by `pathname === item.href` (exact
 * match — not `startsWith`) so deep links like
 * `/profile/top-up/` light up only the "Top Up" row, not the
 * generic "Akun" row.
 */
export function ProfileMenu({ userName, userEmail }: ProfileMenuProps) {
  const pathname = usePathname();

  // First-letter avatar — same convention the Navbar uses for the
  // "Watchlist" pill (see <Navbar />). Uppercased so names like
  // "adhi" still render "A".
  const initial = (userName?.trim().charAt(0) || "?").toUpperCase();

  return (
    <nav className="flex flex-col gap-1" aria-label="Menu profil">
      {/* User card — always visible, on top of the menu */}
      <div className="mb-3 flex items-center gap-2.5 rounded-lg border border-border bg-bg-secondary p-2.5">
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

      {/* Section: "Profil" — account-related tabs */}
      <p className="px-2.5 font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-faint">
        Profil
      </p>
      <ul className="space-y-0.5">
        {ACCOUNT_MENU.map((m) => {
          const active = pathname === m.href;
          return (
            <li key={m.href}>
              <Link
                href={m.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-2 text-[12.5px] font-medium transition-colors",
                  active
                    ? "bg-bg-tertiary text-text-primary"
                    : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
                )}
              >
                <m.Icon className="h-3.5 w-3.5" aria-hidden />
                <span className="truncate">{m.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Section: "Konten lo" — the user's own collections. Sits
          below the account section with a small divider so the
          eye reads "settings up top, lists down below". */}
      <p className="mt-4 px-2.5 font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-faint">
        Konten
      </p>
      <ul className="space-y-0.5">
        {LISTS_MENU.map((m) => {
          const active = pathname === m.href;
          return (
            <li key={m.href}>
              <Link
                href={m.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-2 text-[12.5px] font-medium transition-colors",
                  active
                    ? "bg-bg-tertiary text-text-primary"
                    : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
                )}
              >
                <m.Icon className="h-3.5 w-3.5" aria-hidden />
                <span className="truncate">{m.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Logout — pushed to the bottom of the vertical sidebar via
          the layout's flex column. On the mobile pill row this
          sits inline with the menu items at the end (rendered
          separately by <ProfileMenuMobile />). */}
      <div className="mt-3 border-t border-border pt-3">
        <LogoutButton variant="nav" />
      </div>
    </nav>
  );
}

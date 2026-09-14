"use client";

import Link from "next/link";
import type { User } from "@/lib/auth";

interface UserActionsProps {
  /** Signed-in user, or `null` for anonymous visitors. The widget
   *  shows the profile pill when set, the Masuk button when null. */
  user: User | null;
}

/** Desktop user actions — the profile pill (signed-in) or Masuk
 *  button (anonymous). `hidden md:inline-flex` on both branches
 *  keeps this widget out of the mobile layout entirely; the same
 *  entry points live in `<MobileMenuDrawer />` so mobile users
 *  reach them via the hamburger menu without a duplicate
 *  affordance in the navbar row. */
export function UserActions({ user }: UserActionsProps) {
  if (!user) {
    return (
      <Link
        href="/login"
        className="hidden h-9 items-center rounded-md bg-brand px-3 text-[13px] font-semibold text-bg-primary transition-colors hover:bg-brand-hover md:inline-flex"
      >
        Masuk
      </Link>
    );
  }

  return (
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
  );
}

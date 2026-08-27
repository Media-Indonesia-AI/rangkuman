"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/lib/auth";
import { track, EVENTS } from "@/lib/analytics-events";
import { LogoutConfirmDialog } from "@/components/watchlist/LogoutConfirmDialog";

interface LogoutButtonProps {
  /** Visual variant — "nav" renders the full-width menu-button
   *  style used in the profile sidebar / mobile pill row;
   *  "header" renders the compact plain button used in the
   *  page-level header (right-aligned next to the page title). */
  variant?: "nav" | "header";
  /** Optional label override. Defaults to "Keluar". */
  label?: string;
}

/**
 * Profile-side logout button. Wraps the shared
 * `<LogoutConfirmDialog />` from the watchlist module so the
 * destructive confirmation flow + sign-out side effects (localStorage
 * wipe + hard-navigate to `/`) stay consistent across both
 * authenticated surfaces.
 *
 * Sign-out flow mirrors `<WatchlistPage />`:
 *   1. Latch a "just logged out" guard so the page-wide auto-
 *      redirect-to-login effect doesn't race us back to `/login`.
 *   2. Call `logout()` — removes `beritainvestor:user` from
 *      localStorage and notifies subscribers (`useCurrentUser` flips
 *      to `null`, Navbar will render "Masuk" on the next paint).
 *   3. Close the dialog.
 *   4. Hard-navigate to `/` via `window.location.assign` (not
 *      `router.push`) — soft navigation races with the in-flight
 *      `useCurrentUser` listener firing `setUser(null)` in the
 *      same tick, and the user can end up stuck on an empty
 *      `/profile/` page.
 */
export function LogoutButton({
  variant = "nav",
  label = "Keluar",
}: LogoutButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    logout();
    // Fire BEFORE the hard navigation — `window.location.assign`
    // tears the page down before the default `image` transport
    // can commit. The beacon transport (`navigator.sendBeacon`)
    // survives the unload, so the logout event is still recorded.
    track(EVENTS.logout, undefined, { transport: "beacon" });
    setShowConfirm(false);
    if (typeof window !== "undefined") {
      window.location.assign("/");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className={
          variant === "header"
            ? "inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-bg-secondary px-3 text-[12.5px] font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
            : "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[12.5px] font-medium text-text-muted transition-colors hover:bg-bg-tertiary hover:text-bearish"
        }
      >
        <LogOut className="h-3.5 w-3.5" aria-hidden />
        {label}
      </button>

      {showConfirm && (
        <LogoutConfirmDialog
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import { logout } from "@/lib/auth";
import {
  WatchlistHeader,
  WatchlistEmptyState,
  WatchlistStockGrid,
  WatchlistInfo,
  AddStockDialog,
  LogoutConfirmDialog,
} from "@/components/watchlist";

/**
 * /watchlist — thin orchestrator. Holds page-level state (modal flags,
 * auth-redirect guard) and composes the small widgets in
 * `@/components/watchlist`.
 *
 * The auto-redirect-to-/login effect uses a ref (`justLoggedOut`) so
 * that pressing Keluar (which clears auth synchronously) doesn't race
 * with the effect and pull the user to /login instead of "/" — the
 * actual sign-out then does a hard navigation to clean state.
 */
export default function WatchlistPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const { codes, isFull } = useWatchlist();
  const [showAdd, setShowAdd] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  // Set true right before we trigger logout() ourselves so the auto-redirect
  // below doesn't race with the hard navigation we kick off in Keluar.
  const justLoggedOut = useRef(false);

  // If not logged in, push to /login — unless we just clicked Keluar.
  useEffect(() => {
    if (user === null && !justLoggedOut.current) {
      router.replace("/login");
    }
  }, [user, router]);

  // Close logout confirmation on Escape.
  useEffect(() => {
    if (!showLogoutConfirm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowLogoutConfirm(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showLogoutConfirm]);

  // Hydration state — show a neutral loader while we figure out auth.
  if (user === undefined) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center text-text-muted">
        Memuat…
      </div>
    );
  }
  if (user === null) return null;

  const handleLogoutConfirm = () => {
    // 1. Guard flag FIRST so the auto-redirect effect (which fires when
    //    user becomes null) skips its router.replace("/login").
    justLoggedOut.current = true;

    // 2. Wipe session: removes `beritainvestor:user` + setupToken from
    //    localStorage and notifies subscribers (useCurrentUser flips to
    //    null, so Navbar will render Masuk on the next paint).
    logout();

    // 3. Close the confirmation dialog.
    setShowLogoutConfirm(false);

    // 4. Hard-navigate to "/". We use window.location (not router.push)
    //    because soft navigation races with the in-flight useCurrentUser
    //    listener firing setUser(null) in the same tick — sometimes the
    //    push gets swallowed and the user is left on an empty Watchlist
    //    page (returns null when user is null). Full reload to "/" gives
    //    a clean mount with no user.
    window.location.assign("/");
  };

  return (
    <>
      <Navbar />

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5">
        <WatchlistHeader
          userName={user.name}
          codesCount={codes.length}
          isFull={isFull}
          onAddClick={() => setShowAdd(true)}
          onLogoutClick={() => setShowLogoutConfirm(true)}
        />

        {codes.length === 0 ? (
          <WatchlistEmptyState onAddClick={() => setShowAdd(true)} />
        ) : (
          <WatchlistStockGrid codes={codes} isFull={isFull} />
        )}

        <WatchlistInfo />
      </main>

      {showAdd && (
        <AddStockDialog
          onClose={() => setShowAdd(false)}
          isFull={isFull}
          existing={codes}
        />
      )}
      {showLogoutConfirm && (
        <LogoutConfirmDialog
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogoutConfirm}
        />
      )}
      <Footer />
    </>
  );
}
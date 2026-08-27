"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { X, UserPlus, LogIn } from "lucide-react";
import { STORAGE_EVENT, STORAGE_KEYS } from "@/lib/storageKeys";
import { safeGetItem } from "@/lib/util/safeLocalStorage";
import { track, EVENTS } from "@/lib/analytics-events";

/** Event name any surface can dispatch on `window` to force the dialog open. */
export const GUEST_LOGIN_DIALOG_OPEN_EVENT = "guest-login-dialog:open";

/**
 * Global "guest login" dialog. Mounted once in app/layout.tsx.
 *
 * - Hidden by default on every page when the user is NOT logged in
 * - After 1 minute of being eligible (no auth, non-auth page), the
 *   dialog appears
 * - If the user dismisses it (X / Escape / backdrop), the timer
 *   resets — another 1 minute will pass before it reappears
 * - Hidden on /login and /daftar itself (redundant)
 * - Auto-hides when the user becomes logged in
 *
 * Two actions (the previous "Masuk sebagai tamu" one-click random
 * account path was removed — accounts now flow exclusively through
 * `<DaftarPage />` for create and `<LoginPage />` for sign-in, so
 * there's no longer any random-account provisioning from this
 * dialog):
 *  1. "Daftar akun baru" → navigates to /daftar
 *  2. "Masuk"          → navigates to /login
 *
 * External trigger:
 *  Other surfaces (e.g. the "Lanjutkan dengan Google" button on
 *  /login) can force the dialog open by dispatching the
 *  `guest-login-dialog:open` window event. The dialog opens regardless
 *  of route / timer state and clears the force-open flag once the
 *  user logs in or dismisses it.
 */
export function GuestLoginDialog() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useCurrentUserLite();
  const [showDialog, setShowDialog] = useState(false);
  /**
   * Set by an external `guest-login-dialog:open` event. Overrides the
   * timer effect so the dialog stays open even on /login or while the
   * 1-minute timer hasn't elapsed yet.
   */
  const [forceOpen, setForceOpen] = useState(false);
  /** Incremented on each dismiss so the timer effect re-arms. */
  const [resetKey, setResetKey] = useState(0);

  // `next.config.js` has `trailingSlash: true`, so `pathname` is e.g.
  // `"/login/"` not `"/login"`. Compare on the normalized form so the
  // dialog's "never appear on auth pages" gate actually matches both.
  const normalizedPathname =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  const onAuthPage = normalizedPathname === "/login" || normalizedPathname === "/daftar";
  const shouldArmTimer = user === null && !onAuthPage;
  // The dialog never appears on /login or /daftar, regardless of
  // whether it was triggered by the timer or an external
  // force-open event. The auth pages have their own UI for picking an
  // auth method, so a "guest login" prompt would be redundant.
  const isOpen = (showDialog || forceOpen) && !onAuthPage;

  // External trigger: any surface can open the dialog by dispatching the
  // event. No-ops if the user is already logged in (defensive — the
  // login page already redirects logged-in users away from /login).
  useEffect(() => {
    const handler = () => {
      if (!user) setForceOpen(true);
    };
    window.addEventListener(GUEST_LOGIN_DIALOG_OPEN_EVENT, handler);
    return () =>
      window.removeEventListener(GUEST_LOGIN_DIALOG_OPEN_EVENT, handler);
  }, [user]);

  // Arm / re-arm the 1-minute timer whenever the user becomes eligible
  // to see the dialog. Cleared when the user logs in, navigates to
  // /login or /daftar, or unmounts. `resetKey` dependency makes the
  // timer restart on every dismiss. `forceOpen` short-circuits the
  // effect so the dialog isn't auto-hidden while an external trigger
  // is holding it open.
  useEffect(() => {
    if (forceOpen) return;
    if (!shouldArmTimer) {
      setShowDialog(false);
      return;
    }
    setShowDialog(false);
    const t = window.setTimeout(() => setShowDialog(true), DELAY_MS);
    return () => window.clearTimeout(t);
  }, [shouldArmTimer, pathname, resetKey, forceOpen]);

  // Clear `forceOpen` whenever the auth user changes, OR while the
  // route is /login or /daftar. Without the auth-page arm, a force-open
  // that landed while the user was on /login would pop the dialog back
  // up the moment they navigated back to a normal page.
  useEffect(() => {
    if (user || onAuthPage) setForceOpen(false);
  }, [user, onAuthPage]);

  // Escape-to-dismiss. Same effect as clicking the X / backdrop —
  // resets the timer by bumping resetKey.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setShowDialog(false);
        setForceOpen(false);
        setResetKey((k) => k + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const dismiss = useCallback(() => {
    setShowDialog(false);
    setForceOpen(false);
    setResetKey((k) => k + 1);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Lanjut dengan akun"
      onClick={dismiss}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-bg-secondary shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border bg-bg-tertiary px-5 py-4">
          <div>
            <h2 className="text-[18px] font-bold leading-tight text-text-primary">
              Lanjut menjelajahi Rangkuman
            </h2>
            <p className="mt-1 text-[12.5px] text-text-secondary">
              Masuk atau daftar untuk menyimpan watchlist dan akses recap
              yang dipersonalisasi.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Tutup"
            className="shrink-0 rounded p-1 text-text-muted transition-colors hover:bg-bg-secondary hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-2 p-4">
          {/* Daftar akun baru */}
          <button
            type="button"
            onClick={() => {
              dismiss();
              // Track CTA intent BEFORE the router.push so a
              // slow navigation doesn't drop the hit. The
              // event name reflects the funnel position — the
              // guest gate is what surfaces the prompt, the
              // eventual `register` / `login` event captures
              // the downstream conversion.
              track(EVENTS.guest_gate_cta, { path: "daftar" });
              router.push("/daftar");
            }}
            className="flex w-full items-center gap-3 rounded-md border border-brand/30 bg-brand/10 px-4 py-3 text-left transition-colors hover:border-brand hover:bg-brand/20"
          >
            <UserPlus
              className="h-5 w-5 shrink-0 text-brand"
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-text-primary">
                Daftar akun baru
              </p>
              <p className="text-[12px] text-text-muted">
                Bikin akun permanen dengan username & email kamu.
              </p>
            </div>
          </button>

          {/* Masuk (login) */}
          <button
            type="button"
            onClick={() => {
              dismiss();
              // Mirror `path: "daftar"` for the daftar arm —
              // GA reads the relative split between the two
              // CTAs without needing a separate event.
              track(EVENTS.guest_gate_cta, { path: "login" });
              router.push("/login");
            }}
            className="flex w-full items-center gap-3 rounded-md border border-border bg-bg-tertiary px-4 py-3 text-left transition-colors hover:border-border-strong"
          >
            <LogIn
              className="h-5 w-5 shrink-0 text-text-secondary"
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-text-primary">
                Masuk
              </p>
              <p className="text-[12px] text-text-muted">
                Sudah punya akun? Masuk di sini.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

/** How long the dialog stays hidden on a fresh page load (1 minute). */
const DELAY_MS = 60_000;

/**
 * Local re-implementation of `useCurrentUser` — we need only the
 * `null`-vs-non-null signal (to flip `shouldArmTimer`), not the full
 * `User` shape, and importing `useAuth` here would pull in a
 * transitive `useSyncExternalStore` that we don't otherwise need in
 * this dialog. The dialog subscribes to the same `localStorage`
 * + `beritainvestor:storage` event the hook reads from, so the
 * "user just logged in → dialog should unmount" path stays in sync.
 */
function useCurrentUserLite(): MockUserLite | null {
  const [user, setUser] = useState<MockUserLite | null>(readUserLite);
  useEffect(() => {
    const handler = () => setUser(readUserLite());
    window.addEventListener("storage", handler);
    window.addEventListener(STORAGE_EVENT, handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener(STORAGE_EVENT, handler);
    };
  }, []);
  return user;
}

interface MockUserLite {
  email: string;
  username: string;
}

function readUserLite(): MockUserLite | null {
  const raw = safeGetItem(STORAGE_KEYS.user);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as MockUserLite;
    if (parsed?.email && parsed?.username) return parsed;
    return null;
  } catch {
    return null;
  }
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { X, UserPlus, LogIn, Sparkles, Loader2 } from "lucide-react";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { registerUser } from "@/lib/auth";

/** How long the dialog stays hidden on a fresh page load (1 minute). */
const DELAY_MS = 60_000;

/** Generates a random suffix of N lowercase alphanumeric chars (0-9a-z). */
function rand(n: number): string {
  let s = "";
  for (let i = 0; i < n; i++) {
    s += Math.floor(Math.random() * 36).toString(36);
  }
  return s;
}

/**
 * Global "guest login" dialog. Mounted once in app/layout.tsx.
 *
 * - Hidden by default on every page when the user is NOT logged in
 * - After 1 minute of being eligible (no auth, non-auth page), the
 *   dialog appears
 * - If the user dismisses it (X / Escape / backdrop), the timer
 *   resets — another 1 minute will pass before it reappears
 * - Hidden on /login and /daftar itself (redundant)
 * - Auto-hides when the user becomes logged in (any of the 3 flows)
 *
 * Three actions:
 *  1. "Masuk sebagai tamu" -> auto-registers a random account, user is logged in
 *  2. "Daftar akun baru" -> navigates to /daftar
 *  3. "Masuk" -> navigates to /login
 */
export function GuestLoginDialog() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useCurrentUser();
  const [loading, setLoading] = useState<null | "tamu">(null);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  /** Incremented on each dismiss so the timer effect re-arms. */
  const [resetKey, setResetKey] = useState(0);

  const onAuthPage = pathname === "/login" || pathname === "/daftar";
  const shouldArmTimer = user === null && !onAuthPage;

  // Arm / re-arm the 1-minute timer whenever the user becomes eligible
  // to see the dialog. Cleared when the user logs in, navigates to
  // /login or /daftar, or unmounts. `resetKey` dependency makes the
  // timer restart on every dismiss.
  useEffect(() => {
    if (!shouldArmTimer) {
      setShowDialog(false);
      return;
    }
    setShowDialog(false);
    const t = window.setTimeout(() => setShowDialog(true), DELAY_MS);
    return () => window.clearTimeout(t);
  }, [shouldArmTimer, pathname, resetKey]);

  // The component instance persists across login/logout cycles (the
  // `if (!showDialog) return null` early return doesn't unmount it),
  // so transient states like `loading` and `error` from a previous
  // session would otherwise leak into the next session. Reset them
  // whenever the auth user changes.
  useEffect(() => {
    setLoading(null);
    setError(null);
  }, [user]);

  // Escape-to-dismiss. Same effect as clicking the X / backdrop —
  // resets the timer by bumping resetKey.
  useEffect(() => {
    if (!showDialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setShowDialog(false);
        setResetKey((k) => k + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showDialog]);

  const dismiss = useCallback(() => {
    setShowDialog(false);
    setResetKey((k) => k + 1);
  }, []);

  if (!showDialog) return null;

  const handleTamu = async () => {
    setLoading("tamu");
    setError(null);
    try {
      await registerUser({
        username: `tamu${rand(10)}`, // 14 chars, regex-compliant
        name: `Tamu ${rand(8)}`,
        email: `tamu-${rand(10)}@guest.local`, // unique-ish per click
        password: `Tamu!${rand(12)}`, // 18 chars
      });
      // registerUser persists the session -> useCurrentUser returns the
      // new user on next render -> shouldArmTimer flips false -> dialog
      // auto-unmounts.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal daftar tamu");
      setLoading(null);
    }
  };

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
              Masuk untuk menyimpan watchlist, atau coba sebagai tamu.
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
          {/* Primary action: Masuk sebagai tamu */}
          <button
            type="button"
            onClick={handleTamu}
            disabled={loading !== null}
            className="flex w-full items-center gap-3 rounded-md border border-brand/30 bg-brand/10 px-4 py-3 text-left transition-colors hover:border-brand hover:bg-brand/20 disabled:opacity-60"
          >
            <Sparkles
              className="h-5 w-5 shrink-0 text-brand"
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-text-primary">
                {loading === "tamu"
                  ? "Membuat akun tamu…"
                  : "Masuk sebagai tamu"}
              </p>
              <p className="text-[12px] text-text-muted">
                Akun otomatis dibuat. Bisa simpan watchlist.
              </p>
            </div>
            {loading === "tamu" && (
              <Loader2
                className="h-4 w-4 shrink-0 animate-spin text-brand"
                aria-hidden
              />
            )}
          </button>

          {/* Daftar akun baru */}
          <button
            type="button"
            onClick={() => router.push("/daftar")}
            disabled={loading !== null}
            className="flex w-full items-center gap-3 rounded-md border border-border bg-bg-tertiary px-4 py-3 text-left transition-colors hover:border-border-strong disabled:opacity-60"
          >
            <UserPlus
              className="h-5 w-5 shrink-0 text-text-secondary"
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
            onClick={() => router.push("/login")}
            disabled={loading !== null}
            className="flex w-full items-center gap-3 rounded-md border border-border bg-bg-tertiary px-4 py-3 text-left transition-colors hover:border-border-strong disabled:opacity-60"
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

          {error && (
            <p
              role="alert"
              className="mt-1 font-mono text-[11px] text-bearish"
            >
              ⚠ {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AtSign, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getAuthRedirectTarget, loginWithIdentifier } from "@/lib/auth";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { GUEST_LOGIN_DIALOG_OPEN_EVENT } from "@/components/GuestLoginDialog";
import { SESSION_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/storageKeys";
import { cn } from "@/lib/utils";

type FieldErrors = {
  identifier?: string;
  password?: string;
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useCurrentUser();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  // If already logged in, jump straight to wherever the user was
  // headed — usually the page they were reading when they hit the
  // "Login" button (`/saham`, `/crypto`, …). Falls back to the
  // home page when no prior path was captured.
  useEffect(() => {
    if (user) router.replace(getAuthRedirectTarget(searchParams));
  }, [user, router, searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next: FieldErrors = {};
    if (!identifier.trim()) next.identifier = "Email atau username wajib diisi";
    if (!password) next.password = "Password wajib diisi";
    else if (password.length < 6) next.password = "Password minimal 6 karakter";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await loginWithIdentifier(identifier, password);
      // Hard-navigate after a successful login. Same race as
      // DaftarPage: loginWithIdentifier writes the session via
      // writeJson, which synchronously wakes the useCurrentUser
      // subscriber (queues setUser). A soft `router.replace` from
      // the user-effect races with that in-flight setUser and can
      // be swallowed, leaving the page stuck on /login with the
      // loading button forever. window.location.assign bypasses
      // the App Router and is guaranteed to commit. (The
      // user-effect's router.replace still handles the orthogonal
      // "logged-in user navigates to /login" case — no race
      // there, useCurrentUser reads storage on mount without
      // firing listeners.)
      const target = getAuthRedirectTarget(searchParams);
      console.log("[login-success] reached success path");
      console.log("[login-success] current pathname:", window.location.pathname);
      console.log("[login-success] redirect target:", target);
      console.log("[login-success] sessionStorage prev-path:", window.sessionStorage.getItem(SESSION_STORAGE_KEYS.authPrevPath));
      console.log("[login-success] localStorage user:", window.localStorage.getItem(STORAGE_KEYS.user));
      console.log("[login-success] firing window.location.assign…");
      window.location.assign(target);
      // Self-diagnostic: if we're still on /login 3 seconds later, the
      // navigation never committed (page didn't unload). That can happen
      // if HMR served stale code, if a service worker intercepted the
      // request, or if the App Router's RedirectBoundary swallowed it.
      // If the navigation worked, this setTimeout fires into a torn-down
      // page and never logs.
      setTimeout(() => {
        if (typeof window === "undefined") return;
        if (window.location.pathname.startsWith("/login")) {
          console.error(
            "[login-success] STILL ON /login 3s after window.location.assign — navigation did not commit",
          );
          console.error("[login-success] current state snapshot:", {
            pathname: window.location.pathname,
            href: window.location.href,
            readyState: document.readyState,
            sessionStorage_prev: window.sessionStorage.getItem(SESSION_STORAGE_KEYS.authPrevPath),
            localStorage_user: window.localStorage.getItem(STORAGE_KEYS.user),
          });
        }
      }, 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal masuk";
      // Server usually returns one generic "wrong credentials" message —
      // route it to the password field (that's the more common culprit UX-wise).
      const lower = msg.toLowerCase();
      if (lower.includes("identifier") || lower.includes("email") || lower.includes("username")) {
        setErrors({ identifier: msg });
      } else {
        setErrors({ password: msg });
      }
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setErrors({});
    // Open the global GuestLoginDialog so the user picks the auth
    // method (tamu / Google / daftar / login) in one place. Once
    // they sign in, the layout-level `<TopicsProvider />` and
    // `useCurrentUser` flip and the login page's redirect effect
    // sends them back to where they came from.
    window.dispatchEvent(new CustomEvent(GUEST_LOGIN_DIALOG_OPEN_EVENT));
  };

  const clearError = (field: keyof FieldErrors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  const inputClass = (field: keyof FieldErrors) =>
    cn(
      "h-10 w-full rounded-md border bg-bg-input pl-8 pr-3 text-[13px] text-text-primary placeholder:text-text-faint focus:outline-none",
      errors[field]
        ? "border-bearish focus:border-bearish"
        : "border-border focus:border-brand",
    );

  const FieldError = ({ id, message }: { id: string; message?: string }) =>
    message ? (
      <p id={id} role="alert" className="mt-1 font-mono text-[11px] text-bearish">
        ⚠ {message}
      </p>
    ) : null;

  return (
    <main className="relative z-10 mx-auto max-w-md px-4 pb-16 pt-10 sm:px-6">
        {/* Card */}
        <div className="overflow-hidden rounded-lg border border-border bg-bg-secondary">
          <div className="border-b border-border bg-bg-tertiary px-5 py-4">
            <div className="mb-2.5">
              <Logo size={36} full />
            </div>
            <h1 className="text-[20px] font-bold leading-tight tracking-tight text-text-primary">
              Masuk ke Rangkuman.news
            </h1>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-text-faint">
              Baca lebih sedikit, tahu lebih banyak.
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-text-secondary">
              Simpan watchlist saham, dapatkan recap personalized, dan baca
              berita yang relevan buat portofolio kamu.
            </p>
          </div>

          <div className="p-5">
            {/* Google login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-bg-card py-2.5 text-[13px] font-semibold text-text-primary transition-colors hover:border-border-strong hover:bg-bg-tertiary disabled:opacity-50"
            >
              <GoogleIcon className="h-4 w-4" />
              Lanjutkan dengan Google
            </button>

            {/* Divider */}
            <div className="my-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-faint">
                atau
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            {/* Email / Username form */}
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              <div>
                <label
                  htmlFor="identifier"
                  className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-widest text-text-muted"
                >
                  Email atau Username
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-faint"
                    aria-hidden
                  />
                  <input
                    id="identifier"
                    type="text"
                    inputMode="email"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      clearError("identifier");
                    }}
                    placeholder="kamu@email.com atau username"
                    autoComplete="username"
                    aria-invalid={!!errors.identifier}
                    aria-describedby={errors.identifier ? "identifier-error" : undefined}
                    className={inputClass("identifier")}
                  />
                </div>
                <p className="mt-1 font-mono text-[10.5px] text-text-faint">
                  Bisa pakai email atau username yang terdaftar.
                </p>
                <FieldError id="identifier-error" message={errors.identifier} />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-widest text-text-muted"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-faint"
                    aria-hidden
                  />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError("password");
                    }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    minLength={6}
                    className={inputClass("password")}
                  />
                </div>
                <FieldError id="password-error" message={errors.password} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-md bg-brand py-2.5 text-[13px] font-semibold text-bg-primary transition-colors hover:bg-brand-hover disabled:opacity-60",
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    Memproses…
                  </>
                ) : (
                  <>
                    Masuk
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </>
                )}
              </button>

              <p className="text-center font-mono text-[10.5px] text-text-muted">
                Demo mode: <span className="text-text-secondary">email/username valid + password ≥ 6 char</span> udah cukup buat masuk.
              </p>
            </form>
          </div>
        </div>

        <p className="mt-4 text-center text-[11.5px] text-text-muted">
          Belum punya akun?{" "}
          <Link href="/daftar" className="font-semibold text-brand hover:text-brand-hover">
            Daftar dulu
          </Link>
        </p>
      </main>
  );
}

/**
 * Default-exported page entry. Wraps `<LoginPageContent />` in a
 * `<Suspense>` boundary so `useSearchParams()` (called inside the
 * content) doesn't blow up at static-prerender time — Next.js
 * prerenders the chrome (Navbar / Footer) and streams the
 * content in client-side. Mirrors `app/search/SearchPage.tsx:162-172`.
 */
export default function LoginPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <LoginPageContent />
      </Suspense>
      <Footer />
    </>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#EA3943"
        d="M12 11v3.2h7.6c-.3 1.7-2.1 5-7.6 5-4.6 0-8.3-3.8-8.3-8.4S7.4 2.4 12 2.4c2.6 0 4.4 1.1 5.4 2.1l3.7-3.6C18.7-1.5 15.6-3 12-3 5.1-3-.5 2.6-.5 9.5S5.1 22 12 22c6.9 0 11.5-4.8 11.5-11.7 0-.8-.1-1.4-.2-2H12z"
      />
    </svg>
  );
}
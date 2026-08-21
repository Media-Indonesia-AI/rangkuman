"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AtSign, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import {
  GoogleLogin,
  GoogleOAuthProvider,
  type PromptMomentNotification,
} from "@react-oauth/google";
import { Logo } from "@/components/Logo";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  dismissGoogleOneTap,
  getAuthRedirectTarget,
  isGoogleOneTapDismissed,
  loginWithGoogle,
  loginWithIdentifier,
} from "@/lib/auth";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { GUEST_LOGIN_DIALOG_OPEN_EVENT } from "@/components/GuestLoginDialog";
import { SESSION_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/storageKeys";
import { safeGetItem } from "@/lib/util/safeLocalStorage";
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  /** Whether the user has dismissed the Google One Tap prompt
   *  within the last 30 days. Initialised lazily from localStorage
   *  on mount (the SSR pass returns `false`; the `useEffect` below
   *  re-syncs after hydration). Toggles the `useOneTap` prop on the
   *  `<GoogleLogin />` component, so flipping `true` here cancels
   *  the prompt and prevents it from re-appearing on this page. */
  const [oneTapDismissed, setOneTapDismissed] = useState(false);

  // Hard fail at first render if the GSI client id is missing.
  // Next.js inlines `NEXT_PUBLIC_*` at build time, so this only
  // fires when the env is genuinely absent in a deploy — and we'd
  // rather see a loud render-time error than ship a silently broken
  // Google button.
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");
  }

  // If already logged in, jump straight to wherever the user was
  // headed — usually the page they were reading when they hit the
  // "Login" button (`/saham`, `/crypto`, …). Falls back to the
  // home page when no prior path was captured.
  useEffect(() => {
    if (user) router.replace(getAuthRedirectTarget(searchParams));
  }, [user, router, searchParams]);

  // Re-sync the One Tap dismissal flag from localStorage after the
  // initial render. The state is intentionally initialised to
  // `false` (the SSR-safe default) so the first paint of the page
  // doesn't flash the prompt before the hydration step completes.
  // On the client we read the flag and flip the state if the user
  // previously dismissed — the `<GoogleLogin>` `useOneTap` prop
  // picks up the change on the next render and the GSI client
  // cancels the prompt before it becomes visible.
  useEffect(() => {
    setOneTapDismissed(isGoogleOneTapDismissed());
  }, []);

  /**
   * One Tap prompt moment listener — fires for every display /
   * skipped / dismissed `PromptMomentNotification` the GSI
   * client emits. We use it to persist a 30-day opt-out when the
   * user closes the prompt (X button, tap outside), so the next
   * visit doesn't re-show it.
   *
   * Reason filter:
   *   - `cancel_called` → our own code called `cancel()`. Nothing
   *     to persist; the dismiss flow is already in motion.
   *   - `credential_returned` → the user successfully logged in.
   *     Nothing to persist; the success flow is already running.
   *   - `tap_outside` / `user_cancel` (skipped) → genuine opt-out.
   *     Persist.
   *   - `auto_cancel` / `issuing_failed` (skipped) → transient /
   *     one-off. Don't persist; the next visit is allowed to try
   *     again.
   */
  const handlePromptMomentNotification = (
    notification: PromptMomentNotification,
  ) => {
    if (notification.isDismissedMoment()) {
      const reason = notification.getDismissedReason();
      if (reason === "cancel_called" || reason === "credential_returned") {
        return;
      }
      dismissGoogleOneTap();
      setOneTapDismissed(true);
      return;
    }
    if (notification.isSkippedMoment()) {
      const reason = notification.getSkippedReason();
      if (reason === "tap_outside" || reason === "user_cancel") {
        dismissGoogleOneTap();
        setOneTapDismissed(true);
      }
    }
  };

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
      console.log("[login-success] localStorage user:", safeGetItem(STORAGE_KEYS.user));
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
            localStorage_user: safeGetItem(STORAGE_KEYS.user),
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

  const handleGoogleSuccess = async (
    credentialResponse: { credential?: string },
  ) => {
    // Clear any pre-existing field errors so a user retrying from a
    // failed email/password submit starts the OAuth flow with a
    // clean form. `loginWithGoogle` then runs the JWT exchange —
    // see its docstring in lib/auth.ts for the rest of the flow.
    setErrors({});
    setGoogleError(null);
    const credential = credentialResponse?.credential;
    if (!credential) {
      setGoogleError("Google gak ngirim kredensial — coba lagi.");
      return;
    }
    setGoogleLoading(true);
    try {
      await loginWithGoogle(credential);
      const target = getAuthRedirectTarget(searchParams);
      console.log("[google-login-success] reached success path");
      console.log("[google-login-success] redirect target:", target);
      window.location.assign(target);
      // Same 3s self-diagnostic as the email flow — catches HMR /
      // service-worker / App-Router races on the navigation commit.
      setTimeout(() => {
        if (typeof window === "undefined") return;
        if (window.location.pathname.startsWith("/login")) {
          console.error(
            "[google-login-success] STILL ON /login 3s after window.location.assign",
          );
        }
      }, 3000);
    } catch (err) {
      setGoogleError(
        err instanceof Error ? err.message : "Login Google gagal",
      );
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrors({});
    setGoogleLoading(false);
    setGoogleError("Login Google dibatalkan atau gagal.");
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
            {/* Google login — `GoogleOAuthProvider` scoped tight to
                this block so the GSI script is only fetched on /login.
                `<GoogleLogin />` renders its own branded Google icon,
                so the `GoogleIcon` helper at the bottom of the file
                is now unused (deleted below). The `relative` wrapper
                + absolute spinner lets us show an in-flight overlay
                without disabling the SDK's own button (which we
                don't have a `disabled` prop control over). */}
            <GoogleOAuthProvider clientId={clientId}>
              <div className="relative">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  width="100%"
                  // ─── Google One Tap / FedCM ─────────────────
                  // Enable the One Tap prompt. The GSI client
                  // transparently uses FedCM when the browser
                  // supports it (Chrome 117+, Edge 117+, Safari
                  // 17+); otherwise it falls back to the legacy
                  // iframe. Same `onSuccess` callback handles
                  // credential delivery from both the button and
                  // the One Tap prompt.
                  //
                  // Gated by `oneTapDismissed` so the prompt stays
                  // hidden for 30 days after the user closes it.
                  // The library's effect re-runs when this prop
                  // changes and calls `cancel()` on the way down.
                  //
                  // Also gated by `!user` so a logged-in user
                  // landing on `/login` (e.g. via the back button
                  // after signing in elsewhere) doesn't get a
                  // prompt briefly before the redirect effect
                  // navigates them away.
                  useOneTap={!oneTapDismissed && !user}
                  // Auto-select when there's a single trusted
                  // Google account — the prompt is shown briefly
                  // with a single tap to confirm, or auto-completes
                  // if there's a single account. FedCM handles this
                  // via the browser's account chooser instead of
                  // the iframe's, when supported.
                  auto_select={!oneTapDismissed && !user}
                  // Safari ITP blocks third-party cookies for the
                  // GSI iframe. This opts the GSI client into its
                  // same-site iframe shim so One Tap still works
                  // on Safari.
                  itp_support
                  // Opt into FedCM for the One Tap prompt. The GSI
                  // client uses the browser's native FedCM dialog
                  // when available, which keeps the prompt inside
                  // the browser chrome (no cross-origin iframe).
                  // Falls back to the legacy iframe prompt on
                  // browsers that don't support FedCM.
                  use_fedcm_for_prompt
                  // Opt into FedCM for the Sign-In With Google
                  // button too. The button flow is unchanged
                  // visually; the credential is just delivered via
                  // the FedCM API under the hood.
                  use_fedcm_for_button
                  // Stay visible until the user explicitly closes
                  // it. The default `true` dismisses the prompt
                  // when the user clicks anywhere outside it, which
                  // is too aggressive on a dedicated /login page
                  // — the user is here to log in, not to scroll
                  // their stocks feed.
                  cancel_on_tap_outside={false}
                  // Track every prompt moment so we can persist a
                  // 30-day opt-out when the user dismisses (X
                  // button, tap outside, etc.). See the handler
                  // for the reason filter.
                  promptMomentNotification={handlePromptMomentNotification}
                />
                {googleLoading && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-md bg-bg-card/70"
                  >
                    <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
                  </div>
                )}
              </div>
              {googleError && (
                <p
                  role="alert"
                  className="mt-2 font-mono text-[11px] text-bearish"
                >
                  ⚠ {googleError}
                </p>
              )}
            </GoogleOAuthProvider>

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
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import {
  GoogleLogin,
  GoogleOAuthProvider,
  type CredentialResponse,
  type PromptMomentNotification,
} from "@react-oauth/google";
import { Logo } from "@/components/Logo";
import {
  getAuthRedirectTarget,
  loginWithGoogle,
  loginWithIdentifier,
} from "@/lib/auth";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { useTheme } from "@/lib/hooks/useTheme";
import { cn } from "@/lib/utils";
import { commitLoginRedirect } from "./commitLoginRedirect";
import { useGoogleOneTap } from "./useGoogleOneTap";

/**
 * Client-side content of the `/login` page. Pulled into its own
 * `"use client"` module so the default-exported `LoginPage` (a
 * server component) can read `process.env.GOOGLE_CLIENT_ID` and
 * pass it down as a prop — non-`NEXT_PUBLIC_*` env vars are
 * server-only in Next.js, so reading them in a client component
 * throws "GOOGLE_CLIENT_ID is not set" even when the build env
 * has the value.
 *
 * Splitting the file in two also keeps the hook-heavy content
 * (`useState`, `useSearchParams`, the OAuth callbacks) in one
 * place and the server-rendered chrome (Navbar / Footer / env
 * validation) in another, matching the pattern other routes in
 * the app use for `useSearchParams` boundaries.
 *
 * Sub-components (`LoginCardHeader`, `IdentifierField`,
 * `PasswordField`, `SubmitButton`, `GoogleLoginSection`) live
 * here because each is used exactly once and is tightly coupled
 * to the page's state shape — splitting them across files would
 * just add ceremony without enabling reuse.
 */

type FieldErrors = {
  identifier?: string;
  password?: string;
};

interface LoginPageContentProps {
  /** GSI client id, resolved server-side from
   *  `process.env.GOOGLE_CLIENT_ID` by the route entry
   *  (`app/login/page.tsx`) and threaded through `LoginPage` to here.
   *  Non-`NEXT_PUBLIC_*` env vars are not inlined into the browser
   *  bundle, so the value must reach us as a prop — never read it
   *  directly from `process.env` inside a `"use client"` module. */
  googleClientId: string;
}

// ── Sub-components ────────────────────────────────────────────────

function LoginCardHeader() {
  return (
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
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 font-mono text-[11px] text-bearish">
      ⚠ {message}
    </p>
  );
}

function fieldClass(hasError: boolean) {
  return cn(
    "h-10 w-full rounded-md border bg-bg-input pl-8 pr-3 text-[13px] text-text-primary placeholder:text-text-faint focus:outline-none",
    hasError
      ? "border-bearish focus:border-bearish"
      : "border-border focus:border-brand",
  );
}

function IdentifierField({
  value,
  error,
  onChange,
  onClearError,
}: {
  value: string;
  error?: string;
  onChange: (v: string) => void;
  onClearError: () => void;
}) {
  return (
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
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onClearError();
          }}
          placeholder="kamu@email.com atau username"
          autoComplete="username"
          aria-invalid={!!error}
          aria-describedby={error ? "identifier-error" : undefined}
          className={fieldClass(!!error)}
        />
      </div>
      <p className="mt-1 font-mono text-[10.5px] text-text-faint">
        Bisa pakai email atau username yang terdaftar.
      </p>
      <FieldError id="identifier-error" message={error} />
    </div>
  );
}

function PasswordField({
  value,
  error,
  onChange,
  onClearError,
}: {
  value: string;
  error?: string;
  onChange: (v: string) => void;
  onClearError: () => void;
}) {
  return (
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
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onClearError();
          }}
          placeholder="••••••••"
          autoComplete="current-password"
          aria-invalid={!!error}
          aria-describedby={error ? "password-error" : undefined}
          minLength={6}
          className={fieldClass(!!error)}
        />
      </div>
      <FieldError id="password-error" message={error} />
    </div>
  );
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-brand py-2.5 text-[13px] font-semibold text-bg-primary transition-colors hover:bg-brand-hover disabled:opacity-60"
    >
      {pending ? (
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
  );
}

/**
 * Google Sign-In block. Scopes `GoogleOAuthProvider` tightly to
 * this section so the GSI script is only fetched on `/login`.
 *
 * The `relative` wrapper + absolute spinner lets us show an
 * in-flight overlay without disabling the SDK's own button (which
 * we don't have a `disabled` prop control over) — the spinner is
 * `pointer-events-none` so user clicks still pass through to the
 * underlying Google button.
 *
 * Error rendering: the `error` prop (typically a message from
 * `handleGoogleError` / the OAuth failure catch) is rendered
 * **directly beneath the button** with the same `<FieldError />`
 * styling used by the email fields. Storing the message here
 * (instead of in `errors.password`) keeps the visual association
 * clear — a Google login failure appears next to the button the
 * user clicked, never below the password field four rows away.
 *
 * One Tap / FedCM flags are documented inline at the prop sites.
 */
function GoogleLoginSection({
  googleClientId,
  onSuccess,
  onError,
  showPrompt,
  onPromptMomentNotification,
  error,
  pending,
}: {
  googleClientId: string;
  onSuccess: (r: CredentialResponse) => void;
  onError: () => void;
  showPrompt: boolean;
  onPromptMomentNotification: (n: PromptMomentNotification) => void;
  /** Error to display directly beneath the Google button. Rendered
   *  via the same `<FieldError />` styling as the email fields so
   *  the four error variants on the page all read consistently. */
  error?: string;
  /** `true` when the Google OAuth exchange is in flight. Drives
   *  the in-flight overlay; passed in (not read from the parent
   *  closure) so the section self-contains the loading state. */
  pending: boolean;
}) {
  // Subscribe to the site's active theme so the GSI button reads
  // as part of the card. We map our two-theme model onto GSI's
  // themed surfaces — `outline` for light, `filled_black` for
  // dark — and default to `outline` while `useTheme()` is in its
  // pre-hydration null state (matches GSI's own default and the
  // `:root` palette in `globals.css`). The MutationObserver inside
  // `useTheme` re-renders the section when the user toggles theme
  // via `<ThemeToggle />`, so the button stays in sync.
  const theme = useTheme();
  const gsiTheme: "outline" | "filled_black" =
    theme === "dark" ? "filled_black" : "outline";

  // The `@react-oauth/google` SDK expects its own `clientId` prop on
  // `<GoogleOAuthProvider>` — fixed by the SDK contract. We name our
  // own prop `googleClientId` to match the route entry's prop name
  // and avoid ambiguity at call sites.
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div>
        <div className="relative">
          <GoogleLogin
            onSuccess={onSuccess}
            onError={onError}
            // Tracks the site's active theme: `outline` in light
            // mode (white bg, dark text), `filled_black` in dark
            // mode (black bg, white text). Resolved from
            // `useTheme()` above — see that comment for the
            // pre-hydration default.
            theme={gsiTheme}
            size="large"
            text="continue_with"
            shape="rectangular"
            width="100%"
            // ─── One Tap / FedCM ─────────────────────────
            // Enable the One Tap prompt. The GSI client transparently
            // uses FedCM when the browser supports it (Chrome 117+,
            // Edge 117+, Safari 17+); otherwise it falls back to
            // the legacy iframe. Same `onSuccess` callback handles
            // credential delivery from both the button and the
            // One Tap prompt.
            //
            // Gated by `showPrompt` so the prompt stays hidden for
            // 30 days after the user dismisses it (hook owns the
            // resync on mount) and so a logged-in user landing on
            // `/login` (e.g. via the back button after signing in
            // elsewhere) doesn't see a prompt briefly before the
            // redirect effect navigates them away.
            useOneTap={showPrompt}
            // Auto-select when there's a single trusted Google
            // account — single-tap to confirm, or auto-complete.
            // FedCM handles this via the browser's account chooser
            // when supported.
            auto_select={showPrompt}
            // Safari ITP blocks third-party cookies for the GSI
            // iframe. This opts the GSI client into its same-site
            // iframe shim so One Tap still works on Safari.
            itp_support
            // Opt into FedCM for the One Tap prompt — keeps the
            // prompt inside the browser chrome. Falls back to the
            // legacy iframe on browsers without FedCM.
            use_fedcm_for_prompt
            // Opt into FedCM for the Sign-In With Google button
            // too. Visually unchanged; credential is delivered via
            // the FedCM API under the hood.
            use_fedcm_for_button
            // Stay visible until the user explicitly closes it.
            // Default `true` dismisses on outside click, which is
            // too aggressive on a dedicated /login page.
            cancel_on_tap_outside={false}
            // Track every prompt moment so we can persist a 30-day
            // opt-out when the user dismisses (X button, tap
            // outside). See `useGoogleOneTap` for the reason filter.
            promptMomentNotification={onPromptMomentNotification}
          />
          {pending && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-md bg-bg-card/70"
            >
              <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
            </div>
          )}
        </div>
        {/* Error sits in its own row directly below the button so
            the visual association stays unambiguous. `mt-1` mirrors
            the gap the email `<FieldError />` uses after its input;
            `mb-3` keeps the "atau" divider visually balanced when
            no error is showing. */}
        <FieldError id="google-login-error" message={error} />
      </div>
    </GoogleOAuthProvider>
  );
}

// ── Page content ──────────────────────────────────────────────────

export function LoginPageContent({ googleClientId }: LoginPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useCurrentUser();
  const { oneTapDismissed, onPromptMomentNotification } = useGoogleOneTap();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState<"identifier" | "google" | null>(null);
  // Google-login errors live in their own state (not in `errors`)
  // so they render directly below the Google button — the user's
  // request was that a Google login failure should appear next to
  // the button the user clicked, not four rows down under the
  // password field. Kept as a plain string instead of a
  // `FieldErrors` slot because the Google section has no field
  // identity to attribute the error to.
  const [googleError, setGoogleError] = useState<string | null>(null);

  // If already logged in, jump straight to wherever the user was
  // headed — usually the page they were reading when they hit the
  // "Login" button (`/saham`, `/crypto`, …). Falls back to the
  // home page when no prior path was captured.
  useEffect(() => {
    if (user) router.replace(getAuthRedirectTarget(searchParams));
  }, [user, router, searchParams]);

  /** Set per-field error to undefined; clears stale errors on retype. */
  const clearError = (field: keyof FieldErrors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!identifier.trim()) next.identifier = "Email atau username wajib diisi";
    if (!password) next.password = "Password wajib diisi";
    else if (password.length < 6) next.password = "Password minimal 6 karakter";
    return next;
  }

  function routeAuthError(msg: string): FieldErrors {
    // Server usually returns one generic "wrong credentials" message —
    // route it to the password field (the more common culprit UX-wise);
    // only fall back to the identifier field when the message itself
    // hints at the identifier.
    const lower = msg.toLowerCase();
    if (
      lower.includes("identifier") ||
      lower.includes("email") ||
      lower.includes("username")
    ) {
      return { identifier: msg };
    }
    return { password: msg };
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setPending("identifier");
    try {
      await loginWithIdentifier(identifier, password);
      commitLoginRedirect(searchParams, "identifier");
    } catch (err) {
      setErrors(routeAuthError(err instanceof Error ? err.message : "Gagal masuk"));
      setPending(null);
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    // Clear any pre-existing field errors so a user retrying from a
    // failed email/password submit starts the OAuth flow with a
    // clean form. We also clear the previous Google error so the
    // user sees a fresh attempt rather than stale text.
    setErrors({});
    setGoogleError(null);
    const credential = response?.credential;
    if (!credential) {
      setGoogleError("Google gak ngirim kredensial — coba lagi.");
      return;
    }
    setPending("google");
    try {
      await loginWithGoogle(credential);
      commitLoginRedirect(searchParams, "google");
    } catch (err) {
      setGoogleError(
        err instanceof Error ? err.message : "Login Google gagal",
      );
      setPending(null);
    }
  };

  const handleGoogleError = () => {
    setPending(null);
    setGoogleError("Login Google dibatalkan atau gagal.");
  };

  return (
    <main className="relative z-10 mx-auto max-w-md px-4 pb-16 pt-10 sm:px-6">
      <div className="overflow-hidden rounded-lg border border-border bg-bg-secondary">
        <LoginCardHeader />

        <div className="p-5">
          <GoogleLoginSection
            googleClientId={googleClientId}
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            showPrompt={!oneTapDismissed && !user}
            onPromptMomentNotification={onPromptMomentNotification}
            pending={pending === "google"}
            error={googleError ?? undefined}
          />

          {/* Divider */}
          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-faint">
              atau
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <IdentifierField
              value={identifier}
              error={errors.identifier}
              onChange={setIdentifier}
              onClearError={() => clearError("identifier")}
            />
            <PasswordField
              value={password}
              error={errors.password}
              onChange={setPassword}
              onClearError={() => clearError("password")}
            />
            <SubmitButton pending={pending === "identifier"} />

            <p className="text-center font-mono text-[10.5px] text-text-muted">
              Demo mode:{" "}
              <span className="text-text-secondary">
                email/username valid + password ≥ 6 char
              </span>{" "}
              udah cukup buat masuk.
            </p>
          </form>
        </div>
      </div>

      <p className="mt-4 text-center text-[11.5px] text-text-muted">
        Belum punya akun?{" "}
        <Link
          href="/daftar"
          className="font-semibold text-brand hover:text-brand-hover"
        >
          Daftar dulu
        </Link>
      </p>
    </main>
  );
}

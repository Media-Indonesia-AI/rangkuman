"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  type LucideIcon,
} from "lucide-react";
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
 * Client-side content of `/login`. Pulled into its own `"use client"`
 * module so the default-exported `LoginPage` (server component) can
 * read `process.env.GOOGLE_CLIENT_ID` and pass it down — non-`NEXT_PUBLIC_*`
 * env vars can't be read inside client components.
 */
export interface LoginPageContentProps {
  /** GSI client id, resolved server-side by the route entry. */
  googleClientId: string;
}

// ── Shared form primitives ────────────────────────────────────────

type FieldErrors = {
  identifier?: string;
  password?: string;
};

/** Single-line input with an icon, label, optional hint, and a sticky
 *  error row beneath. Replaces the previously duplicated Identifier /
 *  Password components — same shape, no drift. */
function TextField({
  id,
  label,
  icon: Icon,
  type = "text",
  inputMode,
  placeholder,
  autoComplete,
  minLength,
  hint,
  value,
  error,
  onChange,
  onClearError,
}: {
  id: keyof FieldErrors;
  label: string;
  icon: LucideIcon;
  type?: "text" | "password" | "email";
  inputMode?: "email" | "numeric" | "tel" | "url" | "search";
  placeholder: string;
  autoComplete: string;
  minLength?: number;
  hint?: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  onClearError: () => void;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-widest text-text-muted"
      >
        {label}
      </label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-faint"
          aria-hidden
        />
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onClearError();
          }}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-10 w-full rounded-md border bg-bg-input pl-8 pr-3 text-[13px] text-text-primary placeholder:text-text-faint focus:outline-none",
            error
              ? "border-bearish focus:border-bearish"
              : "border-border focus:border-brand",
          )}
        />
      </div>
      {hint && (
        <p className="mt-1 font-mono text-[10.5px] text-text-faint">{hint}</p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1 font-mono text-[11px] text-bearish"
        >
          ⚠ {error}
        </p>
      )}
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

// ── Login form (identifier + password) ────────────────────────────

/** State + handlers for the email/username + password form. The
 *  Google flow stays inline in `LoginPageContent` because it shares
 *  the page-level `pending`/`error` slot — pulling it here would
 *  force a context boundary without buying much. */
function useLoginForm(searchParams: ReturnType<typeof useSearchParams>) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  /** Drop one field's error — fired on every keystroke so a retype
   *  doesn't show stale text. */
  const clearError = (field: keyof FieldErrors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!identifier.trim()) next.identifier = "Email atau username wajib diisi";
    if (!password) next.password = "Password wajib diisi";
    else if (password.length < 6) next.password = "Password minimal 6 karakter";
    return next;
  }

  /** The server usually returns one generic "wrong credentials"
   *  message. Route it to the password field (the more common
   *  culprit); only fall back to the identifier field when the
   *  message itself hints at it. */
  function routeAuthError(msg: string): FieldErrors {
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

    setPending(true);
    try {
      await loginWithIdentifier(identifier, password);
      commitLoginRedirect(searchParams, "identifier");
    } catch (err) {
      setErrors(routeAuthError(err instanceof Error ? err.message : "Gagal masuk"));
      setPending(false);
    }
  };

  return {
    identifier,
    password,
    errors,
    pending,
    setIdentifier,
    setPassword,
    clearError,
    handleSubmit,
  };
}

// ── Google sign-in ────────────────────────────────────────────────

/** Google Sign-In block. Scopes `GoogleOAuthProvider` tightly so the
 *  GSI script is only fetched on `/login`.
 *
 *  The `relative` wrapper + absolute spinner shows an in-flight
 *  overlay without disabling the SDK's own button (which has no
 *  `disabled` prop) — the spinner is `pointer-events-none` so clicks
 *  still reach the underlying button.
 *
 *  Errors render directly beneath the button so a Google failure
 *  appears next to the button the user clicked, never four rows
 *  down under the password field. */
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
  error?: string;
  pending: boolean;
}) {
  // Match the site's active theme. `outline` for light, `filled_black`
  // for dark; the pre-hydration null from `useTheme()` falls back to
  // `outline` (matches GSI's default + the `:root` palette in
  // `globals.css`). The MutationObserver inside `useTheme` keeps this
  // in sync with `<ThemeToggle />`.
  const theme = useTheme();
  const gsiTheme: "outline" | "filled_black" =
    theme === "dark" ? "filled_black" : "outline";

  return (
    <GoogleOAuthProvider clientId={googleClientId} locale="id">
      <div>
        <div className="relative">
          <GoogleLogin
            onSuccess={onSuccess}
            onError={onError}
            theme={gsiTheme}
            size="large"
            text="continue_with"
            shape="rectangular"
            width="100%"
            // One Tap on, auto-select off: prompt is shown to
            // eligible users but every sign-in requires an explicit
            // click. `cancel_on_tap_outside={false}` keeps the
            // prompt sticky on a dedicated /login page.
            // `itp_support` + `use_fedcm_for_*` make One Tap work on
            // Safari ITP and route through FedCM where available.
            useOneTap={showPrompt}
            auto_select={false}
            itp_support
            use_fedcm_for_prompt
            use_fedcm_for_button
            cancel_on_tap_outside={false}
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
        {error && (
          <p
            id="google-login-error"
            role="alert"
            className="mt-1 font-mono text-[11px] text-bearish"
          >
            ⚠ {error}
          </p>
        )}
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

  const form = useLoginForm(searchParams);

  const [googlePending, setGooglePending] = useState(false);
  // Google errors live separately so they render under the Google
  // button, not under the password field.
  const [googleError, setGoogleError] = useState<string | null>(null);

  // If already logged in, send the user to wherever they were headed.
  useEffect(() => {
    if (user) router.replace(getAuthRedirectTarget(searchParams));
  }, [user, router, searchParams]);

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    form.clearError("identifier");
    form.clearError("password");
    setGoogleError(null);

    const credential = response?.credential;
    if (!credential) {
      setGoogleError("Google gak ngirim kredensial — coba lagi.");
      return;
    }
    setGooglePending(true);
    try {
      await loginWithGoogle(credential);
      commitLoginRedirect(searchParams, "google");
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : "Login Google gagal");
      setGooglePending(false);
    }
  };

  const handleGoogleError = () => {
    setGooglePending(false);
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
            pending={googlePending}
            error={googleError ?? undefined}
          />

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-faint">
              atau
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={form.handleSubmit} className="space-y-3" noValidate>
            <TextField
              id="identifier"
              label="Email atau Username"
              icon={Mail}
              inputMode="email"
              placeholder="kamu@email.com atau username"
              autoComplete="username"
              hint="Bisa pakai email atau username yang terdaftar."
              value={form.identifier}
              error={form.errors.identifier}
              onChange={form.setIdentifier}
              onClearError={() => form.clearError("identifier")}
            />
            <TextField
              id="password"
              label="Password"
              icon={Lock}
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              minLength={6}
              value={form.password}
              error={form.errors.password}
              onChange={form.setPassword}
              onClearError={() => form.clearError("password")}
            />
            <SubmitButton pending={form.pending} />

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

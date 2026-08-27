"use client";

/**
 * OTP-verification card. Sits between `PhoneNumberCard` (which
 * sets the candidate number) and `NotificationToggleCard` (which
 * is gated on `verifiedAt`). The parent renders this only when
 * `verifiedAt` is `null` — once the user completes verification,
 * `useVerifyPhone` invalidates the user-info cache, the parent
 * sees `verifiedAt` flip truthy, and the card unmounts.
 *
 * Flow:
 *
 *   1. **Idle** — single `Kirim kode OTP` button. Click fires
 *      `useReqOtp.req()`. Button shows "Mengirim…" while the
 *      request is in flight.
 *
 *   2. **Awaiting** — code dispatched, 6-digit OTP input is
 *      shown. A 60-second countdown runs alongside; when it
 *      hits 0 the timer is replaced by a `Kirim ulang` button
 *      that re-fires `useReqOtp.req()`. Each digit advances
 *      focus to the next slot; pasting a 6-digit code
 *      distributes across all slots; the form auto-submits
 *      once the last slot is filled.
 *
 *   3. **Verifying** — `useVerifyPhone.verify()` is in flight.
 *      The OTP inputs are disabled and a "Memverifikasi…" label
 *      renders in the verify row.
 *
 *   4. **On success** — `useVerifyPhone` invalidates the user-
 *      info cache. `phoneNumberVerifiedAt` flips truthy on the
 *      next render, the parent hides the card, and the user is
 *      back to the regular edit flow.
 *
 *   5. **On failure** — error message renders below the OTP
 *      inputs (e.g. "Kode salah", "Kode kadaluarsa"). The user
 *      can correct the digits and the form re-submits on the
 *      next valid entry.
 *
 * Owns its own OTP state and timer; no parent coordination.
 * Stays mounted across `phase` transitions so the slide-in
 * for the OTP input doesn't have to be replayed on every
 * re-render.
 */

import {
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useReqOtp } from "@/lib/hooks/useReqOtp";
import { useVerifyPhone } from "@/lib/hooks/useVerifyPhone";

import { cn } from "@/lib/utils";

import {
  Loader2,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

const OTP_LENGTH = 6;
/** One-minute cooldown between OTP requests, per the rate-limit
 *  hint at `useReqOtp`'s `error` field (server-side 429). 60s
 *  matches the typical Indonesian-operator OTP-resend window. */
const RESEND_COOLDOWN_SECONDS = 60;

type Phase = "idle" | "sending" | "awaiting" | "verifying";

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function VerificationCard({
  phoneNumber,
}: {
  /** Active user's phone number (the candidate the OTP was sent
   *  to). Used purely for the "dikirim ke +62…" helper so the
   *  user can confirm where the SMS landed. The card doesn't
   *  call any phone-number APIs itself. */
  phoneNumber?: string | null;
}) {
  const reqOtp = useReqOtp();
  const verifyPhone = useVerifyPhone();
  // Mirror `verifyPhone` into a ref so the auto-submit's
  // `.then` callback can read the LATEST `verifyPhone.error`
  // at call-time. Without this, the callback would close over
  // the `verifyPhone` object from the render where the effect
  // ran (when `error` was still `null` — the hook clears it at
  // the start of each `verify()` call) and miss the real error
  // the hook surfaces in the failure render.
  const verifyPhoneRef = useRef(verifyPhone);
  verifyPhoneRef.current = verifyPhone;

  const [phase, setPhase] = useState<Phase>("idle");
  // Six single-character slots. Each slot is either `""` (empty)
  // or a single digit. Driven by the OTP input handlers below.
  const [code, setCode] = useState<string[]>(() =>
    Array.from({ length: OTP_LENGTH }, () => ""),
  );
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);
  // Verify-side error string. Rendered below the OTP inputs on
  // a wrong / expired code. Distinct from `reqOtp.error`, which
  // surfaces request-side issues (rate-limit, network).
  const [submitError, setSubmitError] = useState<string | null>(null);

  // One ref per input slot so we can drive focus on digit-entry,
  // backspace, and paste. Stored as a mutable array — `useRef`
  // only memoises, the array itself is plain.
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Countdown effect — runs only while in the `awaiting` phase
  // and the timer is still above zero. Each tick decrements by
  // 1; when it hits 0 the timer is effectively "expired" and
  // the UI swaps to the `Kirim ulang` button. The interval is
  // cleaned up on unmount and on phase exit.
  useEffect(() => {
    if (phase !== "awaiting") return;
    if (secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [phase, secondsLeft]);

  // Auto-submit when the user fills the last slot. Re-runs on
  // `code` / `phase` changes so the user's typing drives it;
  // guards below keep it from double-firing on the verifying
  // hook's own state flips (the early-return on `isLoading`
  // and on an incomplete `code`).
  useEffect(() => {
    if (phase !== "awaiting") return;
    if (verifyPhone.isLoading) return;
    if (code.some((c) => !c)) return;
    const joined = code.join("");
    setSubmitError(null);
    setPhase("verifying");
    // Unmount guard — the parent hides the card the moment
    // `useVerifyPhone` invalidates the user-info cache on
    // success. The `.then` callback runs after that unmount
    // could have happened, so we bail before touching state
    // on an unmounted tree.
    let cancelled = false;
    verifyPhone.verify({ code: joined }).then((result) => {
      if (cancelled) return;
      // Whether ok or not, exit the verifying phase — the hook
      // flips `isLoading` off in its `finally`, so the inputs
      // re-enable automatically. Success → parent unmounts the
      // card; failure → user stays in awaiting and retries.
      setPhase("awaiting");
      if (!result.ok) {
        // Read the LATEST `verifyPhone.error` via the ref.
        // Without this the closure captures the render-time
        // object where `error` was still `null` (the hook
        // clears it at the start of each `verify()` call), so
        // the fallback message would fire even when the hook
        // has a real, localised error to show.
        setSubmitError(
          verifyPhoneRef.current.error ??
            "Kode OTP salah atau udah kadaluarsa.",
        );
        // Clear the slots and drop focus back into the first
        // one so the user can correct + retry immediately
        // without re-tabbing through the row.
        setCode(Array.from({ length: OTP_LENGTH }, () => ""));
        queueMicrotask(() => inputRefs.current[0]?.focus());
      }
    });
    return () => {
      cancelled = true;
    };
  }, [code, phase, verifyPhone]);

  const handleSend = useCallback(async () => {
    setSubmitError(null);
    // Optimistic state flip so the button shows its loading
    // treatment immediately. `useReqOtp` clears its own error
    // at the start of each `req()` call, so any stale error
    // from a previous attempt is wiped here.
    setPhase("sending");
    // `reqOtp.req()` never throws — it returns
    // `{ ok: true, data }` on success or `{ ok: false, data: null }`
    // on failure (with `error` populated). Branch on `ok`
    // instead of try/catch.
    const result = await reqOtp.req();
    if (result.ok) {
      // Successful dispatch — flip to awaiting, restart the
      // cooldown, and queueMicrotask the focus into the first
      // input slot. The microtask defer is required because
      // `setPhase("awaiting")` is async — the OTP inputs
      // aren't mounted yet when we reach this line, so a
      // direct `.focus()` would no-op.
      setCode(Array.from({ length: OTP_LENGTH }, () => ""));
      setSecondsLeft(RESEND_COOLDOWN_SECONDS);
      setPhase("awaiting");
      queueMicrotask(() => inputRefs.current[0]?.focus());
    } else {
      // Failure: stay in idle so the user can retry the
      // initial send. `reqOtp.error` already holds the
      // localised message and renders below the button.
      setPhase("idle");
    }
  }, [reqOtp]);

  const handleResend = useCallback(async () => {
    setSubmitError(null);
    // Optimistic timer reset on click — gives the user a
    // consistent 60s cooldown whether the request succeeds
    // or fails (e.g. server-side rate-limit). The error
    // message below tells them what went wrong.
    setSecondsLeft(RESEND_COOLDOWN_SECONDS);
    const result = await reqOtp.req();
    if (result.ok) {
      // New OTP dispatched server-side (old code is now
      // invalidated by the rotation). Clear the slots and
      // refocus the first input. The inputs are already
      // mounted (we're in the awaiting phase), so no
      // queueMicrotask needed — focus() is synchronous and
      // safe to call here.
      setCode(Array.from({ length: OTP_LENGTH }, () => ""));
      inputRefs.current[0]?.focus();
    }
    // On failure: leave the slots intact. If the failure was
    // a transient network error, the previous OTP may still
    // be valid — letting the user retry the same code is
    // friendlier than forcing them to re-type. The error
    // message below tells them what went wrong.
  }, [reqOtp]);

  // OTP input handlers --------------------------------------------------

  const setSlot = useCallback((index: number, value: string) => {
    // Strip non-digits defensively (input mode + maxLength
    // already do most of the work, but paste-from-clipboard
    // can sneak letters in).
    const digit = value.replace(/\D/g, "").slice(-1);
    setCode((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    return digit;
  }, []);

  const handleSlotChange = useCallback(
    (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
      const digit = setSlot(index, e.target.value);
      if (digit && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [setSlot],
  );

  const handleSlotKeyDown = useCallback(
    (index: number) => (e: KeyboardEvent<HTMLInputElement>) => {
      // Backspace at an empty slot should jump back to the
      // previous one — common pattern for OTP inputs so the
      // user doesn't have to manually click back.
      if (e.key === "Backspace" && !code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [code],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
      if (pasted.length === 0) return;
      e.preventDefault();
      const next = Array.from({ length: OTP_LENGTH }, (_, i) =>
        pasted[i] ?? "",
      );
      // Only treat as a full paste when the user actually
      // dropped 6 digits. Anything shorter gets dropped into
      // the focused slot and leaves the rest alone — typing
      // continues normally afterwards.
      if (pasted.length >= OTP_LENGTH) {
        setCode(next);
        // Focus the last slot so the next keystroke (or the
        // auto-submit effect) lands cleanly.
        inputRefs.current[OTP_LENGTH - 1]?.focus();
      } else {
        const startIndex = inputRefs.current.indexOf(
          e.currentTarget as HTMLInputElement,
        );
        setCode((prev) => {
          const out = [...prev];
          for (let i = 0; i < pasted.length; i++) {
            const target = startIndex + i;
            if (target < OTP_LENGTH) out[target] = pasted[i];
          }
          return out;
        });
        const focusIndex = Math.min(
          OTP_LENGTH - 1,
          startIndex + pasted.length,
        );
        inputRefs.current[focusIndex]?.focus();
      }
    },
    [],
  );

  // Render --------------------------------------------------------------

  // Helper for the "dikirim ke +62…" message — only renders
  // when we have a phone number on file. The page passes the
  // wire E.164 form (e.g. `+6281234567890`) straight through
  // from `user.phoneNumber`, so we use it as-is. (Previous
  // version prepended `+62` and produced `+62+6281234567890`.)
  const phoneHint = phoneNumber ?? null;

  const canResend = phase === "awaiting" && secondsLeft <= 0;
  const showTimer = phase === "awaiting" && secondsLeft > 0;

  return (
    <section className="rounded-lg border border-border bg-bg-secondary p-4">
      {/* Header row — shield icon + label, mirrors the
          WhatsApp-card style so the two read as part of the
          same family. */}
      <div className="mb-2 flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-brand" aria-hidden />
        <p className="label">Verifikasi nomor</p>
      </div>

      {/* Idle / sending — the entry-point button. Hidden once
          we're in awaiting / verifying so the OTP input takes
          over the row. */}
      {(phase === "idle" || phase === "sending") && (
        <div className="flex flex-col gap-2">
          <p className="text-[12px] leading-[1.55] text-text-muted">
            Verifikasi nomor WhatsApp kamu untuk aktifin notifikasi
            broadcast.
          </p>
          <button
            type="button"
            onClick={handleSend}
            disabled={phase === "sending"}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-1.5 rounded-md px-4 font-mono text-[12px] font-semibold transition-colors",
              "bg-brand text-bg-primary hover:opacity-90",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {phase === "sending" ? (
              <>
                <Loader2
                  className="h-3.5 w-3.5 animate-spin"
                  aria-hidden
                />
                Mengirim…
              </>
            ) : (
              <>
                <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                Kirim kode OTP
              </>
            )}
          </button>
          {reqOtp.error && (
            <p className="font-mono text-[10.5px] text-bearish">
              ⚠ {reqOtp.error}
            </p>
          )}
        </div>
      )}

      {/* Awaiting / verifying — the OTP input row + countdown +
          reload button. Stays mounted across both sub-phases so
          the input doesn't pop in/out on the verifying
          transition. */}
      {(phase === "awaiting" || phase === "verifying") && (
        <div className="flex flex-col gap-2.5">
          <p className="text-[12px] leading-[1.55] text-text-muted">
            {phase === "verifying"
              ? "Lagi ngecek kode OTP…"
              : phoneHint
                ? `Masukin 6 digit kode yang dikirim ke ${phoneHint}.`
                : "Masukin 6 digit kode yang dikirim ke WhatsApp kamu."}
          </p>

          {/* Six-slot OTP input. `inputMode="numeric"` brings up
              the numeric keypad on mobile; `autoComplete="one-time-code"`
              lets iOS / Android auto-fill from the SMS. Each
              slot has maxLength=1 so the browser caps entry. */}
          <div
            className="flex items-center justify-between gap-1.5"
            role="group"
            aria-label="Kode OTP 6 digit"
          >
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={digit}
                disabled={phase === "verifying"}
                onChange={handleSlotChange(index)}
                onKeyDown={handleSlotKeyDown(index)}
                onPaste={index === 0 ? handlePaste : undefined}
                aria-label={`Digit ${index + 1}`}
                className={cn(
                  "block h-11 w-10 rounded-md border bg-bg-card text-center font-mono text-[18px] font-semibold tabular-nums text-text-primary",
                  "focus:outline-none focus:border-brand",
                  // Subtle bullish ring on filled slots so the
                  // user can see progress as they type.
                  digit
                    ? "border-bullish-line"
                    : "border-border",
                  phase === "verifying" && "opacity-60",
                )}
              />
            ))}
          </div>

          {/* Resend row — timer when counting down, button when
              expired. The button is the only way to request a
              fresh OTP during this phase. */}
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[10.5px] text-text-faint">
              {showTimer
                ? // MM:SS countdown — compact, fits the inline
                  // row without wrapping on small viewports.
                  `Kirim ulang dalam ${formatCountdown(secondsLeft)}`
                : phase === "verifying"
                  ? " "
                  : "Bisa minta kode baru."}
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend || reqOtp.isLoading}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-md px-3 font-mono text-[11px] font-semibold transition-colors",
                "border border-border bg-bg-card text-text-primary",
                "hover:border-brand hover:text-brand",
                "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:text-text-primary",
              )}
            >
              {reqOtp.isLoading ? (
                <Loader2
                  className="h-3 w-3 animate-spin"
                  aria-hidden
                />
              ) : (
                <RefreshCw className="h-3 w-3" aria-hidden />
              )}
              Kirim ulang
            </button>
          </div>

          {/* Verify-side error — wrong / expired code. Single
              source of truth is `submitError` (local state).
              We deliberately do NOT fall back to
              `verifyPhone.error` here: that hook-level state
              is only cleared by the next `verify()` call, so
              falling back would let the error persist across
              a resend (which clears `submitError` but not the
              hook's error). With `submitError` as the only
              source, the resend handler's `setSubmitError(null)`
              reliably hides the message. */}
          {submitError && (
            <p className="font-mono text-[10.5px] text-bearish">
              ⚠ {submitError}
            </p>
          )}

          {/* Request-side error — surfaces when a resend fails
              mid-awaiting (e.g. server-side 429 rate-limit, or a
              transient network error on `POST users/me/otp/`).
              Distinct from the verify-side error above so the
              user can tell which step failed; the cooldown
              timer keeps ticking so the next retry has to wait
              out the full 60s window. */}
          {reqOtp.error && (
            <p className="font-mono text-[10.5px] text-bearish">
              ⚠ {reqOtp.error}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

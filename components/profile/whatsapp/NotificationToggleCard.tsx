"use client";

/**
 * Master "aktifkan notifikasi" toggle card. Controlled component —
 * the page owns the `enabled` boolean and decides what the click
 * does; the widget only renders the visual switch.
 *
 * Off-by-default so the user has to opt-in. The toggle is the
 * single source-of-truth signal that something has fundamentally
 * changed (the Perbarui button gates on `enabled !== savedEnabled`),
 * even though the frequency-card state may drift independently.
 *
 * The `disabled` prop gates the entire row on a precondition the
 * page owns — currently `phoneNumberVerifiedAt`. When the user's
 * WhatsApp number isn't verified yet, the toggle is rendered inert
 * (button can't fire, visual is muted, subtitle swaps to the
 * verification-required message). The page is also expected to
 * no-op the `onToggle` callback while disabled as defense-in-depth
 * so a programmatic state flip can't sneak the toggle on.
 */

import { Lock, ToggleLeft, ToggleRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function NotificationToggleCard({
  enabled,
  onToggle,
  disabled = false,
}: {
  enabled: boolean;
  onToggle: () => void;
  /** When `true`, the toggle is rendered inert and the subtitle
   *  swaps to the verification-required message. Driven by the
   *  page from `phoneNumberVerifiedAt` — no WhatsApp messages
   *  can be sent to an unverified number, so flipping the
   *  master switch on would just queue a no-op. */
  disabled?: boolean;
}) {
  return (
    <section
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-secondary p-4 transition-opacity",
        // Mute the whole row when disabled so the title text
        // reads as part of the same inert block as the toggle.
        disabled && "opacity-60",
      )}
    >
      <div className="min-w-0">
        {/* Title row — title on the left, an optional lock
            chip on the right of the title when disabled so the
            user can tell at a glance why the row is inert. */}
        <div className="flex items-center gap-1.5">
          <p className="text-[13px] font-semibold text-text-primary">
            Aktifkan Pengiriman Berita Ke Whatsapp
          </p>
          {disabled && (
            <Lock
              className="h-3 w-3 text-text-faint"
              aria-hidden
            />
          )}
        </div>
        <p className="mt-0.5 text-[11.5px] text-text-muted">
          {disabled
            ? // When unverified, point the user at the field
              // above — they need to verify their number before
              // notifications can be turned on. The copy is
              // action-oriented so the next step is obvious.
              "Verifikasi nomor WhatsApp kamu dulu untuk aktifin notifikasi."
            : "Kirim ringkasan cerita langsung ke WhatsApp."}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Aktifkan notifikasi WhatsApp"
        // `disabled` on the button blocks the click AND
        // removes the row from the focus order. We keep
        // `aria-checked` reflecting the real `enabled` so the
        // screen reader still announces the underlying state.
        disabled={disabled}
        onClick={onToggle}
        className={cn(
          "inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors",
          enabled ? "bg-brand" : "bg-bg-tertiary",
          disabled && "cursor-not-allowed",
        )}
      >
        {enabled ? (
          <ToggleRight className="h-6 w-6 text-bg-primary" aria-hidden />
        ) : (
          <ToggleLeft className="h-6 w-6 text-text-faint" aria-hidden />
        )}
      </button>
    </section>
  );
}
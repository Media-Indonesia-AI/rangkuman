"use client";

/**
 * Inline `Perbarui` (Update) button for the WhatsApp phone-number
 * field. Sits to the right of the input inside `PhoneNumberCard`,
 * on the same row.
 *
 * Intentionally distinct from `PerbaruiButton`: that widget owns
 * the broadcast-settings save action (toggle + frequency
 * checkboxes), this one owns the phone-field save action. They
 * share styling so the user reads both as "save what I just
 * changed" without learning two visual languages.
 *
 * Purely presentational. The page owns the dirty check, the
 * `isSaving` flag, and the click handler; the widget just
 * reflects them.
 */

import { cn } from "@/lib/utils";

export function UpdateWhatsappButton({
  disabled,
  isSaving = false,
  onClick,
}: {
  /** When `true`, the button is rendered as inert. Driven by
   *  the page's phone-dirty check — the button is enabled only
   *  when the local input differs from the saved active number. */
  disabled: boolean;
  /** Saving in flight — flips the label to "Memperbarui…". The
   *  page owns this flag (driven by the in-flight `updatePhone`
   *  call); the widget just reflects it. */
  isSaving?: boolean;
  /** Click handler — the page owns this. */
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isSaving}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md px-4 font-mono text-[12px] font-semibold transition-colors",
        "bg-brand text-bg-primary hover:opacity-90",
        "disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      {isSaving ? "Memperbarui…" : "Perbarui"}
    </button>
  );
}

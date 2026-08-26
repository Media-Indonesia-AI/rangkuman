"use client";

import { UpdateWhatsappButton } from "@/components/profile/whatsapp/UpdateWhatsappButton";

/**
 * WhatsApp phone-number card. Controlled component — the page owns
 * the `phone` string and passes it down with a setter. No prefix
 * widget and no format validation: the field is full-width minus
 * the inline save button, the helper text says only "Masukkan
 * nomor WhatsApp kamu.", and the user is free to type the number
 * in whatever form they have on hand. The input strips non-digits
 * on type so the page-side state stays a clean digit string.
 *
 * The save button (`<UpdateWhatsappButton />`) lives inline to
 * the right of the input — same row, no separate section. It's
 * a peer of `<PerbaruiButton />` (which drives broadcast settings)
 * but its own widget, because the two save different fields.
 * The page owns the dirty check that gates `disabled` here, the
 * in-flight `isSaving` flag, and the click handler.
 */

export function PhoneNumberCard({
  phone,
  onPhoneChange,
  saveDisabled,
  isSaving,
  onSave,
}: {
  phone: string;
  onPhoneChange: (next: string) => void;
  /** Disable the inline save button. The page sets this when the
   *  local input matches the saved active number (no diff to
   *  flush). */
  saveDisabled: boolean;
  /** In-flight flag — flips the button label to "Memperbarui…". */
  isSaving: boolean;
  /** Save handler — the page owns the actual `api.updatePhone`
   *  call. */
  onSave: () => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-bg-secondary p-4">
      <p className="label">Nomor WhatsApp</p>
      <div className="mt-2.5 flex items-stretch gap-2">
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => {
            // Strip non-digits so the field stays clean even when
            // the user pastes a formatted number.
            onPhoneChange(e.target.value.replace(/\D/g, ""));
          }}
          placeholder="081234567890"
          aria-label="Nomor WhatsApp"
          className="block h-10 flex-1 rounded-md border border-border bg-bg-card px-3 font-mono text-[13px] tabular-nums text-text-primary placeholder:text-text-faint focus:border-brand focus:outline-none"
        />
        <UpdateWhatsappButton
          disabled={saveDisabled}
          isSaving={isSaving}
          onClick={onSave}
        />
      </div>
      <p className="mt-1.5 font-mono text-[10.5px] text-text-faint">
        Masukkan nomor WhatsApp kamu.
      </p>
    </section>
  );
}

"use client";

import { UpdateWhatsappButton } from "@/components/profile/whatsapp/UpdateWhatsappButton";
import { validateIndonesianPhone } from "@/components/profile/whatsapp/constants";
import { cn } from "@/lib/utils";

/**
 * WhatsApp phone-number card. Controlled component — the page owns
 * the `phone` string and passes it down with a setter.
 *
 * Layout: `🇮🇩 +62` prefix chip on the left (visual only — the
 * user never types the country code), local-digit input on the
 * right, and the inline `<UpdateWhatsappButton />` at the end of
 * the row. The prefix is rendered as a static element (not
 * prepended on every keystroke) so the field stays a clean
 * `<input>` that the page can read directly.
 *
 * Inline messages live in a single slot below the row so they
 * never compete with the input/button for horizontal space. The
 * slot is filled by the first non-null signal of:
 *   1. Field-validation failure (`validateIndonesianPhone` on
 *      the current digits), bearish text + bearish input border.
 *   2. Save failure from the most recent `useUpdatePhone`
 *      attempt, bearish text only.
 *   3. Otherwise, the neutral helper text.
 *
 * The page drives `showSave` from the same validator (via
 * `usePhoneForm`), so the inline `Perbarui` button is only
 * rendered when both the local field differs from the saved
 * active number AND the new value passes validation. Single
 * source of truth. When `showSave` is `false` the button is
 * hidden entirely — same pattern as the broadcast-settings
 * `PerbaruiButton` at the page level, so the user sees a clean
 * row (prefix + input only) until there's actually something to
 * flush.
 */

export function PhoneNumberCard({
  phone,
  onPhoneChange,
  showSave,
  isSaving,
  error,
  onSave,
}: {
  phone: string;
  onPhoneChange: (next: string) => void;
  /** Render the inline save button. The page sets this when both
   *  (a) the local input differs from the saved active number
   *  (a real diff to flush), and (b) the new value passes
   *  `validateIndonesianPhone`. `false` hides the button. */
  showSave: boolean;
  /** In-flight flag — flips the button label to "Memperbarui…". */
  isSaving: boolean;
  /** Inline error from the most recent `useUpdatePhone` save
   *  attempt. Rendered below the field on failure. */
  error?: string | null;
  /** Save handler — the page owns the actual `api.updatePhone`
   *  call. */
  onSave: () => void;
}) {
  // Validation runs on every keystroke; the inline field error
  // takes priority over the save error so the user sees the
  // typing-time problem before any stale save failure.
  const validation = phone
    ? validateIndonesianPhone(phone)
    : { ok: true as const };
  const showFieldError = phone.length > 0 && !validation.ok;
  const message = showFieldError
    ? `⚠ ${validation.reason}`
    : error
      ? `⚠ ${error}`
      : "Masukkan nomor WhatsApp kamu.";
  const messageTone = showFieldError || error ? "text-bearish" : "text-text-faint";

  return (
    <section className="rounded-lg border border-border bg-bg-secondary p-4">
      <p className="label">WhatsApp</p>
      <div className="mt-2.5 flex items-stretch gap-2">
        {/* Static prefix widget — visual only, never receives
            focus. Sits inline with the input so the user sees
            the full E.164 form (`+62 8XX…`) without having to
            type the country code themselves. */}
        <div
          aria-hidden
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md border border-border bg-bg-card px-2.5 font-mono text-[13px] font-semibold text-text-secondary"
        >
          <span>🇮🇩</span>
          <span>+62</span>
        </div>
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => {
            // Strip non-digits so the field stays clean even
            // when the user pastes a formatted number. The
            // prefix widget is static; the input carries the
            // local-digit portion only.
            onPhoneChange(e.target.value.replace(/\D/g, ""));
          }}
          placeholder="81234567890"
          aria-label="Nomor WhatsApp"
          aria-invalid={showFieldError || undefined}
          className={cn(
            "block h-10 flex-1 rounded-md border bg-bg-card px-3 font-mono text-[13px] tabular-nums text-text-primary placeholder:text-text-faint focus:outline-none",
            showFieldError
              ? "border-bearish focus:border-bearish"
              : "border-border focus:border-brand",
          )}
        />
        {/* Slide-in / slide-out wrapper. The button stays
            mounted across the show/hide transition so the CSS
            `max-width` + `opacity` transition runs in both
            directions (true conditional render would just
            pop in/out). Matches the mobile-menu drawer pattern
            in `Navbar.tsx` (`transition-[max-height,opacity]
            duration-200`) — here we animate the horizontal axis
            instead. `min-w-0` is required so flex honours the
            collapsed `max-w-0` (default flex `min-width: auto`
            would otherwise hold the wrapper at content width);
            `overflow-hidden` clips the button body while the
            wrapper is collapsed; `pointer-events-none` removes
            the collapsed wrapper from the click target; and
            `aria-hidden` keeps it out of the AT tree. */}
        <div
          aria-hidden={!showSave}
          className={cn(
            "min-w-0 overflow-hidden transition-[max-width,opacity,margin] duration-200 ease-out",
            showSave
              ? "max-w-32 opacity-100"
              : "pointer-events-none max-w-0 opacity-0",
          )}
        >
          <UpdateWhatsappButton
            disabled={false}
            isSaving={isSaving}
            onClick={onSave}
          />
        </div>
      </div>
      {/* Single message slot below the row — field validation
          > save error > neutral helper text, in that order. */}
      <p className={cn("mt-1.5 font-mono text-[10.5px]", messageTone)}>
        {message}
      </p>
    </section>
  );
}

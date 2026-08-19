"use client";

/**
 * WhatsApp phone-number card. Controlled component — the page owns
 * the `phone` string and passes it down with a setter; the widget
 * only normalises the input (strips non-digits) before calling
 * back, so the page-side state stays a clean digit string.
 *
 * The +62 prefix is rendered inside the field as a static chip
 * (rather than prepending it on every change) so the user sees
 * the canonical E.164 form while typing only the local digits.
 */

export function PhoneNumberCard({
  phone,
  onPhoneChange,
}: {
  phone: string;
  onPhoneChange: (next: string) => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-bg-secondary p-4">
      <p className="label">Nomor WhatsApp</p>
      <div className="mt-2.5 flex items-stretch gap-2">
        <div className="inline-flex h-10 items-center gap-1.5 rounded-md border border-border bg-bg-card px-2.5 font-mono text-[13px] font-semibold text-text-secondary">
          <span aria-hidden>🇮🇩</span>
          <span>+62</span>
        </div>
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => {
            // Strip non-digits so the field stays clean even
            // when the user pastes a formatted number.
            onPhoneChange(e.target.value.replace(/\D/g, ""));
          }}
          placeholder="81234567890"
          aria-label="Nomor WhatsApp"
          className="block h-10 flex-1 rounded-md border border-border bg-bg-card px-3 font-mono text-[13px] tabular-nums text-text-primary placeholder:text-text-faint focus:border-brand focus:outline-none"
        />
      </div>
      <p className="mt-1.5 font-mono text-[10.5px] text-text-faint">
        Format E.164. Contoh: 81234567890 (tanpa +62 / 0 di depan).
      </p>
    </section>
  );
}
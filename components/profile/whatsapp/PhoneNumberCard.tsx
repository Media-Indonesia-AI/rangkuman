"use client";

/**
 * WhatsApp phone-number card. Controlled component — the page owns
 * the `phone` string and passes it down with a setter. No prefix
 * widget and no format validation: the field is full-width, the
 * helper text says only "Masukkan nomor WhatsApp kamu.", and the
 * user is free to type the number in whatever form they have on
 * hand. The input strips non-digits on type so the page-side
 * state stays a clean digit string.
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
      <input
        type="tel"
        inputMode="numeric"
        value={phone}
        onChange={(e) => {
          // Strip non-digits so the field stays clean even when
          // the user pastes a formatted number.
          onPhoneChange(e.target.value.replace(/\D/g, ""));
        }}
        placeholder="81234567890"
        aria-label="Nomor WhatsApp"
        className="mt-2.5 block h-10 w-full rounded-md border border-border bg-bg-card px-3 font-mono text-[13px] tabular-nums text-text-primary placeholder:text-text-faint focus:border-brand focus:outline-none"
      />
      <p className="mt-1.5 font-mono text-[10.5px] text-text-faint">
        Masukkan nomor WhatsApp kamu.
      </p>
    </section>
  );
}

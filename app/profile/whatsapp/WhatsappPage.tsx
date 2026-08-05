"use client";

import { useState } from "react";
import { MessageCircle, Send, Sparkles, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Frequency options — exposed as a small list so the terminology
 *  stays consistent across the UI. `daily` = one morning brief with
 *  the day's top story; `realtime` = breaking-news ping only (the
 *  highest-impact events). `off` is implicit in the toggle — we
 *  always pass an explicit value so the saved preference is
 *  unambiguous even when the user disables the integration. */
const FREQUENCY: ReadonlyArray<{
  id: "off" | "daily" | "realtime";
  label: string;
  description: string;
}> = [
  {
    id: "daily",
    label: "Harian",
    description: "1 cerita terbaik tiap pagi, sekitar jam 07.00 WIB.",
  },
  {
    id: "realtime",
    label: "Real-time",
    description: "Cuma breaking news — cerita yang gerak-gerakin pasar.",
  },
];

/**
 * `/profile/whatsapp/` — Kirim Berita ke WhatsApp tab.
 *
 * Renders five sub-blocks, each in its own card:
 *
 *   1. **Nomor WhatsApp** — country code selector + phone number
 *      input. Defaults to `+62 🇮🇩` (the user's primary market).
 *   2. **Aktifkan notifikasi** — toggle. Off by default.
 *   3. **Frekuensi** — radio group (Harian / Real-time). Hidden
 *      when the toggle is off.
 *   4. **Tes kirim pesan** — disabled until the toggle is on and
 *      a valid number is entered. Fires a "Coming soon" toast.
 *   5. **Sample pesan** — preview card showing the kind of
 *      message the user will receive when the integration lands.
 *
 * Submitting any block fires a "Coming soon" toast (same stub
 * pattern as the other two profile sections) so the affordance
 * exists for the user.
 */
export default function WhatsappPage() {
  const [enabled, setEnabled] = useState(false);
  const [phone, setPhone] = useState("");
  const [frequency, setFrequency] = useState<"off" | "daily" | "realtime">(
    "daily",
  );

  const handleNotImplemented = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("berita-investor:toast", {
        detail: "Coming soon — lagi digarap.",
      }),
    );
  };

  // Minimal phone validation — strip non-digits, require at least
  // 8 digits once the country code is assumed. The real
  // integration will use a proper E.164 validator; this is just
  // enough to gate the "Tes kirim" button.
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneValid = phoneDigits.length >= 8;
  const canTest = enabled && phoneValid;

  return (
    <div className="flex flex-col gap-4">
      <header className="border-b border-border-strong pb-3">
        <div className="mb-1 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden />
          <span className="label text-text-secondary">WhatsApp</span>
        </div>
        <h1 className="text-[22px] font-bold leading-tight tracking-tight text-text-primary sm:text-[26px]">
          Kirim berita ke WhatsApp
        </h1>
        <p className="mt-1 text-[12.5px] leading-[1.55] text-text-muted">
          Aktifin notifikasi WhatsApp biar gak ketinggalan cerita
          penting. Coming soon.
        </p>
      </header>

      {/* Phone number — country code dropdown (static for now —
          only ID is supported) + the actual number input. The
          +62 prefix is rendered inside the field so the user
          sees the canonical E.164 form. */}
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
              const v = e.target.value.replace(/\D/g, "");
              setPhone(v);
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

      {/* Toggle — primary affordance. Off by default so the user
          has to opt-in. Records an explicit frequency so the
          saved preference is unambiguous even when the toggle
          is off (the API will receive `frequency: "off"`). */}
      <section className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-secondary p-4">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-text-primary">
            Aktifkan notifikasi WhatsApp
          </p>
          <p className="mt-0.5 text-[11.5px] text-text-muted">
            Kirim ringkasan cerita langsung ke WhatsApp lo.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Aktifkan notifikasi WhatsApp"
          onClick={() => setEnabled((v) => !v)}
          className={cn(
            "inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors",
            enabled ? "bg-brand" : "bg-bg-tertiary",
          )}
        >
          {enabled ? (
            <ToggleRight className="h-6 w-6 text-bg-primary" aria-hidden />
          ) : (
            <ToggleLeft className="h-6 w-6 text-text-faint" aria-hidden />
          )}
        </button>
      </section>

      {/* Frequency — visible only when the toggle is on. Radio
          group with a description per option so the user knows
          what each frequency actually delivers. */}
      {enabled && (
        <section className="rounded-lg border border-border bg-bg-secondary p-4">
          <p className="label">Frekuensi</p>
          <div className="mt-2.5 space-y-2">
            {FREQUENCY.map((f) => {
              const active = frequency === f.id;
              return (
                <label
                  key={f.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2.5 transition-colors",
                    active
                      ? "border-brand bg-brand-soft"
                      : "border-border bg-bg-card hover:border-border-strong",
                  )}
                >
                  <input
                    type="radio"
                    name="wa-frequency"
                    value={f.id}
                    checked={active}
                    onChange={() => setFrequency(f.id)}
                    className="mt-0.5 h-3.5 w-3.5 accent-brand"
                  />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-text-primary">
                      {f.label}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-text-muted">
                      {f.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </section>
      )}

      {/* Test send — disabled until the toggle is on and a valid
          number is entered. The underlying "Coming soon" toast
          is wired up so the click still surfaces feedback. */}
      <section className="rounded-lg border border-border bg-bg-secondary p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-text-primary">
              Tes kirim pesan
            </p>
            <p className="mt-0.5 text-[11.5px] text-text-muted">
              Kirim satu pesan contoh ke nomor lo buat ngecek format & tampilannya.
            </p>
          </div>
          <button
            type="button"
            onClick={handleNotImplemented}
            disabled={!canTest}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-[12.5px] font-semibold transition-colors",
              !canTest
                ? "cursor-not-allowed bg-bg-tertiary text-text-faint"
                : "bg-brand text-bg-primary hover:bg-brand-hover",
            )}
          >
            <Send className="h-3.5 w-3.5" aria-hidden />
            Tes kirim
          </button>
        </div>
      </section>

      {/* Sample preview — visual constraint: the user has to
          see what the message will look like before opting in. We
          render a static <StoryEditorial />-shaped card so the
          visual rhythm matches the rest of the app. Live data
          will land here once the preview-API exists. */}
      <section className="rounded-lg border border-border bg-bg-secondary p-4">
        <div className="mb-2 flex items-center gap-1.5">
          <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" aria-hidden />
          <p className="label">Preview pesan</p>
        </div>
        <div className="overflow-hidden rounded-lg border border-border bg-bg-secondary">
          <div className="h-1.5 w-full bg-cat-global" aria-hidden />
          <div className="space-y-2 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-cat-global">
                GLOBAL
              </span>
              <span className="font-mono text-[9.5px] text-text-faint">
                1 jam lalu
              </span>
            </div>
            <p className="font-serif text-[14.5px] font-bold leading-snug text-text-primary">
              The Fed pangkas suku bunga 25 bps — sinyal dovish untuk
              pasar Asia.
            </p>
            <p className="line-clamp-3 text-[11.5px] leading-[1.5] text-text-secondary">
              The Fed pangkas suku bunga acuan dari 5,50% ke 5,25%
              setelah FOMC September. Powell: &ldquo;ekonomi solid,
              tapi kami lihat tekanan di tenaga kerja&rdquo;.
              IHSG rebound 0,87%, rupiah terapresiasi 0,4%.
            </p>
            <div className="flex items-center justify-between border-t border-border pt-2 font-mono text-[9.5px] text-text-muted">
              <span>Reuters · Bloomberg · Kontan</span>
              <span>2 mnt baca</span>
            </div>
          </div>
        </div>
        <p className="mt-3 font-mono text-[10.5px] text-text-faint">
          Pesan dikirim via WhatsApp Business API. Tarif operator
          berlaku untuk pesan masuk.
        </p>
      </section>
    </div>
  );
}

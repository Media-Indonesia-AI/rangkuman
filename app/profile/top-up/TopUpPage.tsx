"use client";

import { useState } from "react";
import { Banknote, CreditCard, Smartphone, Sparkles, Wallet, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Quick-pick amounts — exposed as a small fixed list so the
 *  formatting stays consistent across the chips. Wider amounts
 *  (e.g. Rp 1.000.000) can be entered via the custom input
 *  below. Matches the typical Indonesian e-wallet / pulsa
 *  top-up UX. */
const QUICK_PICKS: ReadonlyArray<{ id: string; label: string; value: number }> = [
  { id: "50k", label: "Rp 50.000", value: 50_000 },
  { id: "100k", label: "Rp 100.000", value: 100_000 },
  { id: "250k", label: "Rp 250.000", value: 250_000 },
];

/** Payment methods — placeholder until the gateway lands. Each
 *  option is rendered as a disabled radio so the user can see
 *  what _will_ be available. The "Coming soon" toast on submit
 *  maintains the same "stub" pattern as the Akun section. */
const PAYMENT_METHODS: ReadonlyArray<{
  id: string;
  label: string;
  Icon: LucideIcon;
}> = [
  { id: "gopay", label: "GoPay", Icon: Smartphone },
  { id: "ovo", label: "OVO", Icon: Smartphone },
  { id: "dana", label: "DANA", Icon: Smartphone },
  { id: "va-bca", label: "Virtual Account BCA", Icon: Banknote },
];

/**
 * `/profile/top-up/` — Top Up section.
 *
 * Renders four sub-blocks, each in its own card:
 *
 *   1. **Saldo** — current wallet balance (placeholder zero with
 *      a "Coming soon" note until the wallet backend lands).
 *   2. **Pilih nominal** — three quick-pick amount chips + a
 *      custom-amount input.
 *   3. **Metode pembayaran** — radio group of e-wallet / VA
 *      options (currently disabled pending gateway integration).
 *   4. **Riwayat top-up** — empty-state list ("Belum ada top-up").
 *
 * Submitting fires a "Coming soon" toast (same stub pattern as
 * the Akun section) so the affordance exists for the user.
 */
export default function TopUpPage() {
  const [amount, setAmount] = useState<number | null>(100_000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [method, setMethod] = useState<string | null>(null);

  const handleNotImplemented = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("berita-investor:toast", {
        detail: "Coming soon — lagi digarap.",
      }),
    );
  };

  // Custom-amount parsing — only accept clean digit strings;
  // anything else is treated as "no value". Caps at Rp 10jt
  // until the gateway validates larger amounts.
  const customParsed = (() => {
    const digits = customAmount.replace(/\D/g, "");
    if (!digits) return null;
    const n = parseInt(digits, 10);
    if (Number.isNaN(n) || n <= 0) return null;
    return Math.min(n, 10_000_000);
  })();

  const effectiveAmount = amount ?? customParsed;
  const formattedAmount = effectiveAmount
    ? `Rp ${effectiveAmount.toLocaleString("id-ID")}`
    : "—";

  return (
    <div className="flex flex-col gap-4">
      <header className="border-b border-border-strong pb-3">
        <div className="mb-1 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden />
          <span className="label text-text-secondary">Top Up</span>
        </div>
        <h1 className="text-[22px] font-bold leading-tight tracking-tight text-text-primary sm:text-[26px]">
          Top Up saldo
        </h1>
        <p className="mt-1 text-[12.5px] leading-[1.55] text-text-muted">
          Top up saldo lo buat pakai fitur premium Rangkuman. Coming soon.
        </p>
      </header>

      {/* Saldo card — current balance placeholder. The "Coming
          soon" badge keeps the field honest about its stub
          status. */}
      <section className="flex items-center gap-3 rounded-lg border border-border bg-bg-secondary p-4">
        <span
          aria-hidden
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand"
        >
          <Wallet className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-semibold uppercase tracking-widest text-text-muted">
            Saldo saat ini
          </p>
          <p className="mt-0.5 font-mono text-[20px] font-bold tabular-nums text-text-primary">
            Rp 0
          </p>
        </div>
        <span className="inline-flex items-center rounded-full border border-border bg-bg-tertiary px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-muted">
          Coming soon
        </span>
      </section>

      {/* Nominal — quick-pick chips + custom input. Selecting a
          quick-pick clears the custom input; entering a custom
          amount clears the quick-pick. Mutually exclusive by
          design so the displayed total is unambiguous. */}
      <section className="rounded-lg border border-border bg-bg-secondary p-4">
        <p className="label">Pilih nominal</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {QUICK_PICKS.map((q) => {
            const active = amount === q.value;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setAmount(q.value);
                  setCustomAmount("");
                }}
                aria-pressed={active}
                className={cn(
                  "inline-flex h-9 items-center rounded-md border px-3 font-mono text-[12.5px] font-semibold tabular-nums transition-colors",
                  active
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-border bg-bg-card text-text-secondary hover:border-border-strong hover:text-text-primary",
                )}
              >
                {q.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3">
          <label
            htmlFor="top-up-custom"
            className="font-mono text-[10.5px] font-semibold uppercase tracking-widest text-text-muted"
          >
            Nominal lain (Rp)
          </label>
          <input
            id="top-up-custom"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={customAmount}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "");
              setCustomAmount(v);
              if (v) setAmount(null);
            }}
            placeholder="cth: 150000"
            className="mt-1 block h-10 w-full rounded-md border border-border bg-bg-card px-3 font-mono text-[13px] tabular-nums text-text-primary placeholder:text-text-faint focus:border-brand focus:outline-none"
          />
        </div>
      </section>

      {/* Metode pembayaran — disabled radios so the layout is
          visible but no real selection is recorded. The form
          below uses the same disabled state. */}
      <section className="rounded-lg border border-border bg-bg-secondary p-4">
        <p className="label">Metode pembayaran</p>
        <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
          {PAYMENT_METHODS.map((m) => {
            const active = method === m.id;
            return (
              <label
                key={m.id}
                className={cn(
                  "flex cursor-not-allowed items-center gap-2.5 rounded-md border px-3 py-2.5 opacity-60",
                  active
                    ? "border-brand bg-brand-soft"
                    : "border-border bg-bg-card",
                )}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value={m.id}
                  disabled
                  checked={active}
                  onChange={() => setMethod(m.id)}
                  className="h-3.5 w-3.5 accent-brand"
                />
                <m.Icon className="h-4 w-4 text-text-muted" aria-hidden />
                <span className="text-[12.5px] font-medium text-text-primary">
                  {m.label}
                </span>
              </label>
            );
          })}
        </div>
        <p className="mt-2 font-mono text-[10.5px] text-text-faint">
          Metode pembayaran akan tersedia setelah payment gateway live.
        </p>
      </section>

      {/* Submit — sticky-style CTA at the bottom of the section.
          Disabled because no method is selected; the underlying
          "Coming soon" toast is wired up so the click still
          surfaces feedback. */}
      <div className="sticky bottom-3 z-10 rounded-lg border border-border-strong bg-bg-secondary/95 p-3 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-widest text-text-muted">
              Total top-up
            </p>
            <p className="font-mono text-[18px] font-bold tabular-nums text-text-primary">
              {formattedAmount}
            </p>
          </div>
          <button
            type="button"
            onClick={handleNotImplemented}
            disabled={!effectiveAmount || !method}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-md px-4 text-[13px] font-semibold transition-colors",
              !effectiveAmount || !method
                ? "cursor-not-allowed bg-bg-tertiary text-text-faint"
                : "bg-brand text-bg-primary hover:bg-brand-hover",
            )}
          >
            <CreditCard className="h-3.5 w-3.5" aria-hidden />
            Lanjut ke Pembayaran
          </button>
        </div>
      </div>

      {/* Riwayat — empty state by default. Once the wallet API
          ships, swap this for a list of recent top-ups. */}
      <section className="rounded-lg border border-dashed border-border bg-bg-secondary px-4 py-8 text-center">
        <p className="text-[13px] font-medium text-text-primary">
          Belum ada top-up
        </p>
        <p className="mt-1 text-[11.5px] text-text-muted">
          Riwayat top-up lo bakal muncul di sini.
        </p>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Banknote, CreditCard, Smartphone, Sparkles, Wallet, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Coin-to-IDR rate. 1 koin costs Rp 3.000 — surfaced in the
 *  balance card, on every quick-pick chip, and in the total
 *  block so the value is visible at the moment of decision. */
const RUPIAH_PER_KOIN = 3_000;

/** Quick-pick amounts — exposed as a small fixed list so the
 *  formatting stays consistent across the chips. Wider amounts
 *  (e.g. Rp 1.000.000) can be entered via the custom input
 *  below. Matches the typical Indonesian e-wallet / pulsa
 *  top-up UX. Each chip carries its coin equivalent so the
 *  user sees the value they're buying, not just the price. */
const QUICK_PICKS: ReadonlyArray<{
  id: string;
  label: string;
  koinLabel: string;
  value: number;
}> = [
  {
    id: "50k",
    label: "Rp 50.000",
    koinLabel: `≈ ${Math.floor(50_000 / RUPIAH_PER_KOIN).toLocaleString("id-ID")} koin`,
    value: 50_000,
  },
  {
    id: "100k",
    label: "Rp 100.000",
    koinLabel: `≈ ${Math.floor(100_000 / RUPIAH_PER_KOIN).toLocaleString("id-ID")} koin`,
    value: 100_000,
  },
  {
    id: "250k",
    label: "Rp 250.000",
    koinLabel: `≈ ${Math.floor(250_000 / RUPIAH_PER_KOIN).toLocaleString("id-ID")} koin`,
    value: 250_000,
  },
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

/** Minimum custom top-up amount. Matches the smallest quick-pick
 *  chip (Rp 50.000) so the user gets a clear "your value is too
 *  low" error if they enter, e.g., 5.000. */
const MIN_AMOUNT = 50_000;

/** Maximum custom top-up amount — 10.000.000 minus the 11% PPN
 *  implied in the grand-total math (10.000.000 - 11% = 8.900.000).
 *  Caps the base input so the user can't type a number whose
 *  grand total exceeds the platform's per-transaction ceiling. */
const MAX_AMOUNT = 8_900_000;

/** Coin-count equivalents of the Rp limits above. MIN_KOIN is
 *  ceil'd so a user typing the smallest valid count actually
 *  meets the Rp minimum (16 × 3.000 = 48.000 < 50.000, so the
 *  floor doesn't qualify). MAX_KOIN is floor'd for the opposite
 *  reason — keep both ends honest. */
const MIN_KOIN = Math.ceil(MIN_AMOUNT / RUPIAH_PER_KOIN);
const MAX_KOIN = Math.floor(MAX_AMOUNT / RUPIAH_PER_KOIN);

/** Indonesian PPN (Pajak Pertambahan Nilai) rate. Effective 11% as
 *  of 2022; the same rate applies to most digital goods and
 *  services. Surfaced as a separate line item so the user can see
 *  the tax breakdown, not just an opaque grand total. */
const PPN_RATE = 0.11;

/**
 * `/profile/top-up/` — Top Up section.
 *
 * Renders four sub-blocks, each in its own card:
 *
 *   1. **Koin** — current wallet balance (placeholder zero with
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

  // Custom-amount parsing — user enters a coin count; we return
  // the Rp equivalent so the rest of the pipeline (PPN, total)
  // can stay in currency. Only accepts clean digit strings;
  // anything else is treated as "no value". Caps the returned
  // Rp value at MAX_AMOUNT so a too-large coin entry is clamped
  // instead of overflowing the formatter.
  const customValidation = (() => {
    const digits = customAmount.replace(/\D/g, "");
    if (!digits) return { value: null as number | null, error: null as string | null };
    const koin = parseInt(digits, 10);
    if (Number.isNaN(koin) || koin <= 0) return { value: null, error: null };
    if (koin < MIN_KOIN) {
      return {
        value: null,
        error: `Minimum top-up adalah ${MIN_KOIN.toLocaleString("id-ID")} koin`,
      };
    }
    if (koin > MAX_KOIN) {
      const clampedKoin = Math.min(koin, MAX_KOIN);
      return {
        value: clampedKoin * RUPIAH_PER_KOIN,
        error: `Maksimum top-up adalah ${MAX_KOIN.toLocaleString("id-ID")} koin`,
      };
    }
    return { value: koin * RUPIAH_PER_KOIN, error: null };
  })();

  const effectiveAmount = amount ?? customValidation.value;
  const ppnAmount =
    effectiveAmount != null ? Math.round(effectiveAmount * PPN_RATE) : null;
  const grandTotal =
    effectiveAmount != null && ppnAmount != null
      ? effectiveAmount + ppnAmount
      : null;
  // Coins the user actually receives — floored so the user never
  // sees a fractional count, and any unspent remainder from a
  // non-multiple top-up is honestly dropped (the "≈" prefix in
  // the UI signals the approximation).
  const koinAmount =
    effectiveAmount != null
      ? Math.floor(effectiveAmount / RUPIAH_PER_KOIN)
      : null;

  const fmt = (n: number) =>
    `Rp ${n.toLocaleString("id-ID")}`;
  const formattedAmount = effectiveAmount ? fmt(effectiveAmount) : "—";
  const formattedPpn = ppnAmount != null ? fmt(ppnAmount) : "—";
  const formattedGrandTotal = grandTotal != null ? fmt(grandTotal) : "—";

  return (
    <div className="flex flex-col gap-4">
      <header className="border-b border-border-strong pb-3">
        <div className="mb-1 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden />
          <h1 className="text-[22px] font-bold leading-tight tracking-tight text-text-primary sm:text-[26px]">
            Top Up Koin
          </h1>
        </div>
      </header>

      {/* Koin card — current balance placeholder. The "Coming
          soon" badge keeps the field honest about its stub
          status. Conversion rate sits right below the balance
          so the value of one koin is always in context. */}
      <section className="flex items-center gap-3 rounded-lg border border-border bg-bg-secondary p-4">
        <span
          aria-hidden
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand"
        >
          <Wallet className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-semibold uppercase tracking-widest text-text-muted">
            Koin saat ini
          </p>
          <p className="mt-0.5 font-mono text-[20px] font-bold tabular-nums text-text-primary">
            0
          </p>
        </div>
      </section>

      {/* Nominal — quick-pick chips + custom input. Selecting a
          quick-pick clears the custom input; entering a custom
          amount clears the quick-pick. Mutually exclusive by
          design so the displayed total is unambiguous. */}
      <section className="rounded-lg border border-border bg-bg-secondary p-4">
        <p className="label">Pilih Paket Bundling</p>
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
                  "inline-flex h-auto min-h-9 flex-col items-center justify-center gap-0 rounded-md border px-3 py-1.5 font-mono text-[12.5px] font-semibold tabular-nums transition-colors",
                  active
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-border bg-bg-card text-text-secondary hover:border-border-strong hover:text-text-primary",
                )}
              >
                <span className="text-[10px] font-medium opacity-80">
                  {q.koinLabel}
                </span>
                <span>{q.label}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-3">
          <label
            htmlFor="top-up-custom"
            className="font-mono text-[10.5px] font-semibold uppercase tracking-widest text-text-muted"
          >
            Mau top-up berapa koin?
          </label>
          <div className="relative mt-1">
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
              placeholder="cth: 50"
              aria-invalid={customValidation.error ? true : undefined}
              aria-describedby={
                customValidation.error ? "top-up-custom-error" : undefined
              }
              className={cn(
                "block h-10 w-full rounded-md border bg-bg-card pl-3 pr-14 font-mono text-[13px] tabular-nums text-text-primary placeholder:text-text-faint focus:outline-none",
                customValidation.error
                  ? "border-bearish focus:border-bearish"
                  : "border-border focus:border-brand",
              )}
            />
            {/* "koin" suffix — makes the unit unambiguous without
                needing a separate label or icon. Padded to clear
                the longest coin count (2.966 → 4 chars). */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-[11.5px] font-semibold uppercase tracking-widest text-text-faint"
            >
              koin
            </span>
          </div>
          {customValidation.error && (
            <p
              id="top-up-custom-error"
              role="alert"
              className="mt-1 font-mono text-[10.5px] text-bearish"
            >
              {customValidation.error}
            </p>
          )}
          {!customValidation.error && (
            <p className="mt-1 font-mono text-[10.5px] text-text-faint">
              Minimum {MIN_KOIN.toLocaleString("id-ID")} koin · 1 koin = Rp {RUPIAH_PER_KOIN.toLocaleString("id-ID")}
            </p>
          )}
        </div>
      </section>

      {/* Submit — sticky-style CTA at the bottom of the section.
          Disabled because no method is selected; the underlying
          "Coming soon" toast is wired up so the click still
          surfaces feedback. */}
      <div className="sticky bottom-3 z-10 rounded-lg border border-border-strong bg-bg-secondary/95 p-3 backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10.5px] font-semibold uppercase tracking-widest text-text-muted">
              Total top-up
            </p>
            <p className="font-mono text-[11.5px] tabular-nums text-text-secondary">
              PPN (11%) {formattedPpn}
            </p>
            {/* Coin-equivalent line — appears above the grand total
                so the eye reads "tax → coins → amount you pay".
                Brand color ties it visually to the coin balance
                card at the top of the section. */}
            {koinAmount != null && koinAmount > 0 && (
              <p className="mt-0.5 font-mono text-[12px] font-semibold tabular-nums text-brand">
                ≈ {koinAmount.toLocaleString("id-ID")} koin
              </p>
            )}
            <p className="mt-1 font-mono text-[18px] font-bold tabular-nums text-text-primary">
              {formattedGrandTotal}
            </p>
          </div>
          <button
            type="button"
            onClick={handleNotImplemented}
            disabled={!effectiveAmount || !method || customValidation.error !== null}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-md px-4 text-[13px] font-semibold transition-colors",
              !effectiveAmount || !method || customValidation.error !== null
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

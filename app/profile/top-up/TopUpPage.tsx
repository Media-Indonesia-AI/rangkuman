"use client";

import { useState } from "react";
import { Banknote, CreditCard, Smartphone, Sparkles, Wallet, type LucideIcon } from "lucide-react";
import type { TopupBundle } from "@/lib/api";
import { useGetTopupBundle } from "@/lib/hooks/useGetTopupBundle";
import { useGetWallet } from "@/lib/hooks/useGetWallet";
import { formatTanggalIndonesia } from "@/lib/util/formatDate";
import { Shimmer } from "@/components/Shimmer";
import { cn } from "@/lib/utils";

/** Coin-to-IDR rate. 1 koin costs Rp 3.000 — surfaced in the
 *  balance card and in the custom-input helper so the value of
 *  one koin is always in context when the user is entering
 *  arbitrary amounts. The bundle chips don't need it: their
 *  `coin_amount` comes straight from the API. */
const RUPIAH_PER_KOIN = 3_000;

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
 *   1. **Koin** — current wallet balance sourced from
 *      `GET wallet` via `useGetWallet()`. Shows the aggregate
 *      `balance` and, when the oldest lot still has unspent
 *      coins, the formatted `expire_at` so the user can see
 *      when the next lot hangus.
 *   2. **Pilih paket bundling** — bundle chips sourced from
 *      `GET wallet/topup/bundle` via `useGetTopupBundle()`, plus
 *      a custom-amount input that lets the user enter a coin
 *      count outside the catalogue. Bundle and custom input are
 *      mutually exclusive — picking a chip clears the custom
 *      input and vice-versa.
 *   3. **Metode pembayaran** — radio group of e-wallet / VA
 *      options (currently disabled pending gateway integration).
 *   4. **Riwayat top-up** — empty-state list ("Belum ada top-up").
 *
 * Submitting fires a "Coming soon" toast (same stub pattern as
 * the Akun section) so the affordance exists for the user.
 */
export default function TopUpPage() {
  // ID of the currently-selected bundle chip, or `null` when
  // the user is entering a custom amount (or hasn't picked
  // anything yet). Drives `selectedBundle` below; `effectiveAmount`
  // falls back to the custom-input value when no bundle is picked.
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [method, setMethod] = useState<string | null>(null);

  // Curated top-up catalogue — small fixed list owned by the
  // wallet API. Sorted by `sort` ascending inside the hook so
  // the API's "front" bundle always renders first regardless of
  // the wire order. While loading, the section renders a
  // "Memuat…" placeholder; the totals block stays empty until
  // either a bundle is picked or the custom input is typed.
  const { data: bundles, isLoading: bundlesLoading } = useGetTopupBundle();
  const selectedBundle: TopupBundle | undefined = selectedBundleId
    ? bundles.find((b) => b.id === selectedBundleId)
    : undefined;

  // Active wallet — server-aggregated `balance` plus the FIFO lot
  // stack. The earliest expiry lives in `lots[0]` because the
  // backend returns lots oldest-first; `remaining_balance` may
  // have dropped to 0 on consumed lots, but the expiry is still
  // the next hangus event the user needs to know about. We only
  // surface the expiry line when there's a positive `remaining`
  // balance on the oldest lot — otherwise the date refers to
  // coins that are already gone and the copy would mislead.
  const { data: wallet, isLoading: walletLoading } = useGetWallet();
  const earliestLot = wallet?.lots?.[0];
  const earliestExpire =
    earliestLot && earliestLot.remaining_balance > 0
      ? formatTanggalIndonesia(earliestLot.expire_at)
      : null;

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

  // Bundle's price wins when a chip is selected; otherwise fall
  // through to the custom-input value. `null` until either path
  // produces a number, which keeps the totals block and the
  // submit button correctly disabled.
  const effectiveAmount = selectedBundle?.price ?? customValidation.value;
  const ppnAmount =
    effectiveAmount != null ? Math.round(effectiveAmount * PPN_RATE) : null;
  const grandTotal =
    effectiveAmount != null && ppnAmount != null
      ? effectiveAmount + ppnAmount
      : null;
  // Coins the user actually receives. When a bundle is selected,
  // the count comes straight from `bundle.coin_amount` (the API
  // is authoritative — a bundle might be priced independently of
  // the Rp/koin rate, e.g. a promo that gives 17 koin for
  // Rp 50.000 even though 17 × 3.000 = 51.000). When a custom
  // amount is typed, we floor the derived count so the user
  // never sees a fractional number; the "≈" prefix in the UI
  // signals the approximation.
  const koinAmount = selectedBundle
    ? selectedBundle.coin_amount
    : effectiveAmount != null
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

      {/* Koin card — live balance sourced from `useGetWallet()`.
          While loading, the number renders a Shimmer block at the
          same height as the resolved value so the layout doesn't
          shift when the data lands. The earliest lot's expiry is
          shown beneath the balance so the user can see when the
          oldest unspent coins hangus — the copy is hidden when
          the oldest lot has no remaining balance or the wallet
          has no lots yet (freshly-registered user). */}
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
          {walletLoading ? (
            <Shimmer
              aria-busy="true"
              className="mt-1 h-6 w-24"
            />
          ) : (
            <p
              className="mt-0.5 font-mono text-[28px] font-bold tabular-nums text-text-primary"
              aria-label={`${wallet?.balance ?? 0} koin`}
            >
              {(wallet?.balance ?? 0).toLocaleString("id-ID")}
              <span className="ml-1 font-mono text-[12px] font-medium text-text-muted">
                koin
              </span>
            </p>
          )}
          {earliestExpire && !walletLoading && (
            <p className="mt-0.5 font-mono text-[10.5px] text-text-faint">
              Hangus - {earliestExpire}
            </p>
          )}
        </div>
      </section>

      {/* Paket bundling — bundle chips sourced from
          `useGetTopupBundle()`. Each chip's top line carries the
          coin count (with the bonus — `add_up_coin_amount` —
          highlighted in brand color when present); the bundle
          name is the action-target on the second line. The full
          breakdown (base + bonus + price) lives in `aria-label`
          so screen readers get the same context sighted users
          derive from the totals block below. */}
      <section className="rounded-lg border border-border bg-bg-secondary p-4">
        <p className="label">Pilih Paket Bundling</p>
        {bundlesLoading ? (
          <p className="mt-2.5 font-mono text-[11.5px] text-text-muted">
            Memuat paket bundling…
          </p>
        ) : bundles.length === 0 ? (
          <p className="mt-2.5 text-[11.5px] text-text-muted">
            Paket bundling belum tersedia.
          </p>
        ) : (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {bundles.map((bundle) => {
              const active = selectedBundleId === bundle.id;
              const bonusLabel =
                bundle.add_up_coin_amount > 0
                  ? ` +${bundle.add_up_coin_amount.toLocaleString("id-ID")}`
                  : "";
              return (
                <button
                  key={bundle.id}
                  type="button"
                  onClick={() => {
                    setSelectedBundleId(bundle.id);
                    setCustomAmount("");
                  }}
                  aria-pressed={active}
                  aria-label={
                    `${bundle.name} — ${bundle.base_coin_amount.toLocaleString("id-ID")} koin` +
                    (bonusLabel ? ` (${bonusLabel.trim()} bonus)` : "") +
                    `, Rp ${bundle.price.toLocaleString("id-ID")}`
                  }
                  className={cn(
                    "inline-flex h-auto min-h-9 flex-col items-center justify-center gap-0 rounded-md border px-3 py-1.5 font-mono text-[12.5px] font-semibold tabular-nums transition-colors",
                    active
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-border bg-bg-card text-text-secondary hover:border-border-strong hover:text-text-primary",
                  )}
                >
                  <span className="text-[10px] font-medium opacity-80">
                    {bundle.base_coin_amount.toLocaleString("id-ID")} koin
                    {bonusLabel && (
                      <span className="ml-1 text-[12px] font-semibold text-brand">{bonusLabel}</span>
                    )}
                  </span>
                  <span>{bundle.name}</span>
                </button>
              );
            })}
          </div>
        )}
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
                if (v) setSelectedBundleId(null);
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

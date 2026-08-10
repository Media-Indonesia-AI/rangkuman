import type { TopupBundle } from "@/lib/api";
import {
  MAX_KOIN,
  MIN_KOIN,
  RUPIAH_PER_KOIN,
} from "./constants";
import { cn } from "@/lib/utils";

export interface BundleCustomValidation {
  /** Parsed Rp value of the custom-amount input, or `null` when
   *  the input is empty / invalid / below MIN. Used by the
   *  totals block to compute `effectiveAmount`. */
  value: number | null;
  /** Validation error copy ("Minimum top-up adalah …"), or `null`
   *  when the input is clean. The submit button stays disabled
   *  while this is non-null. */
  error: string | null;
}

interface BundleSelectorProps {
  /** Curated top-up catalogue from `useGetTopupBundle()`. */
  bundles: TopupBundle[];
  /** Bundle-fetch loading state. While true, the chip row is
   *  replaced with a "Memuat…" line. */
  isLoading: boolean;
  /** ID of the currently-selected chip, or `null` when the user
   *  is typing a custom amount (or hasn't picked anything). */
  selectedBundleId: string | null;
  /** Raw string from the custom-amount input. */
  customAmount: string;
  /** Parsed validation result for the custom amount — drives
   *  the inline error and disables the submit button. */
  customValidation: BundleCustomValidation;
  onSelectBundle: (id: string) => void;
  onChangeCustomAmount: (raw: string) => void;
}

/**
 * "Pilih Paket Bundling" card — bundle chips from the wallet API
 * plus a custom-amount input that lets the user enter a coin
 * count outside the catalogue.
 *
 * Bundle and custom input are mutually exclusive — picking a chip
 * clears the custom input and vice-versa. The orchestrator owns
 * that coupling via `onSelectBundle` (which clears `customAmount`)
 * and `onChangeCustomAmount` (which clears `selectedBundleId` when
 * a digit is typed).
 *
 * Each chip's top line carries the coin count (with the bonus —
 * `add_up_coin_amount` — highlighted in brand color when
 * present); the bundle name is the action-target on the second
 * line. The full breakdown (base + bonus + price) lives in
 * `aria-label` so screen readers get the same context sighted
 * users derive from the totals block.
 */
export function BundleSelector({
  bundles,
  isLoading,
  selectedBundleId,
  customAmount,
  customValidation,
  onSelectBundle,
  onChangeCustomAmount,
}: BundleSelectorProps) {
  return (
    <section className="rounded-lg border border-border bg-bg-secondary p-4">
      <p className="label">Pilih Paket Bundling</p>
      {isLoading ? (
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
                onClick={() => onSelectBundle(bundle.id)}
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
            onChange={(e) => onChangeCustomAmount(e.target.value)}
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
        {customValidation.error ? (
          <p
            id="top-up-custom-error"
            role="alert"
            className="mt-1 font-mono text-[10.5px] text-bearish"
          >
            {customValidation.error}
          </p>
        ) : (
          <p className="mt-1 font-mono text-[10.5px] text-text-faint">
            Minimum {MIN_KOIN.toLocaleString("id-ID")} koin · 1 koin = Rp {RUPIAH_PER_KOIN.toLocaleString("id-ID")}
          </p>
        )}
      </div>
    </section>
  );
}

/**
 * Validate a raw custom-amount input string against the
 * Rp/koin rate and the platform's MIN/MAX bounds. Pure helper —
 * no React state — so the orchestrator can re-run it whenever
 * `customAmount` changes. Returns:
 *
 *   - `value`: the parsed Rp value (`null` when the input is
 *              empty / invalid / below MIN).
 *   - `error`: a localised message, or `null` when the input is
 *              clean (or empty — empty is allowed, it just
 *              produces `value: null`).
 *
 * On overflow (over MAX_KOIN) the parsed Rp is clamped to
 * `MAX_AMOUNT` so the totals block can still render a
 * predictable number; the error message tells the user the
 * input was over the limit.
 */
export function validateCustomAmount(raw: string): BundleCustomValidation {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return { value: null, error: null };
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
}
import { CreditCard, Loader2 } from "lucide-react";
import { formatIdr } from "./constants";
import { cn } from "@/lib/utils";

interface TopUpTotalsProps {
  /** PPN line (11% of the base amount), formatted. */
  formattedPpn: string;
  /** Grand total (base + PPN), formatted. */
  formattedGrandTotal: string;
  /** Whole-number coin count the user actually receives, or
   *  `null` until either a bundle is picked or the custom input
   *  is typed. Hidden when `null` / `0`. */
  koinAmount: number | null;
  /** Whether the submit button should be disabled. The orchestrator
   *  composes this from `!effectiveAmount ||
   *  customValidation.error !== null || isSubmitting`. */
  disabled: boolean;
  /** True while the topup request is in flight. Swaps the
   *  button label + icon to a spinner ("Memproses…") and
   *  forces the disabled styling so the click can't be
   *  re-fired. Defaults to `false`. */
  isSubmitting?: boolean;
  onSubmit: () => void;
}

/**
 * Sticky-style CTA at the bottom of the top-up flow. Shows the
 * tax breakdown, the coin-equivalent line (above the grand total
 * so the eye reads "tax → coins → amount you pay"), and the
 * "Lanjut ke Pembayaran" button. Disabled when the orchestrator
 * says so; while the payment request is in flight the button
 * shows a spinner + "Memproses…" label so the user gets
 * visible feedback that the request is processing.
 */
export function TopUpTotals({
  formattedPpn,
  formattedGrandTotal,
  koinAmount,
  disabled,
  isSubmitting = false,
  onSubmit,
}: TopUpTotalsProps) {
  return (
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
          onClick={onSubmit}
          // Submitting forces `disabled` regardless of the
          // orchestrator's value — the in-flight request already
          // holds a single-flight guard in the hook, but locking
          // the button at the UI layer too keeps the visual
          // feedback consistent (spinner + label) even if the
          // orchestrator forgets to fold `isSubmitting` into
          // `disabled`.
          disabled={disabled || isSubmitting}
          aria-busy={isSubmitting || undefined}
          className={cn(
            "inline-flex h-10 items-center gap-1.5 rounded-md px-4 text-[13px] font-semibold transition-colors",
            disabled || isSubmitting
              ? "cursor-not-allowed bg-bg-tertiary text-text-faint"
              : "bg-brand text-bg-primary hover:bg-brand-hover",
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Memproses…
            </>
          ) : (
            <>
              <CreditCard className="h-3.5 w-3.5" aria-hidden />
              Lanjut ke Pembayaran
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/** Compose the three formatted strings from raw Rp values. */
export function formatTotals(
  effectiveAmount: number | null,
  ppnAmount: number | null,
  grandTotal: number | null,
): { formattedPpn: string; formattedGrandTotal: string } {
  return {
    formattedPpn: ppnAmount != null ? formatIdr(ppnAmount) : "—",
    formattedGrandTotal:
      grandTotal != null ? formatIdr(grandTotal) : "—",
  };
}
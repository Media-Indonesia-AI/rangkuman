import { Wallet } from "lucide-react";
import type { Wallet as WalletType } from "@/lib/api";
import { Shimmer } from "@/components/Shimmer";

interface CoinBalanceCardProps {
  /** Active wallet from `useGetWallet()`. `null` while loading or
   *  on error. The card renders "0 koin" as a fallback so a
   *  failed fetch doesn't crash the page. */
  wallet: WalletType | null;
  /** Whether the wallet fetch is still in flight. Drives the
   *  Shimmer placeholder so the value slot doesn't flash. */
  isLoading: boolean;
  /** Earliest lot expiry, formatted via `formatTanggalIndonesia`.
   *  Hidden when `null` (no lots yet, or the oldest lot has no
   *  remaining balance — the latter is filtered at the
   *  orchestrator so this widget stays presentational). */
  earliestExpire: string | null;
}

/**
 * "Koin saat ini" card — live balance sourced from `useGetWallet()`
 * and surfaced to the page. While loading, the number renders a
 * Shimmer block at the same height as the resolved value so the
 * layout doesn't shift when the data lands. The earliest lot's
 * expiry is shown beneath the balance so the user can see when
 * the oldest unspent coins hangus.
 */
export function CoinBalanceCard({
  wallet,
  isLoading,
  earliestExpire,
}: CoinBalanceCardProps) {
  return (
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
        {isLoading ? (
          <Shimmer aria-busy="true" className="mt-1 h-6 w-24" />
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
        {earliestExpire && !isLoading && (
          <p className="mt-0.5 font-mono text-[10.5px] text-text-faint">
            Hangus - {earliestExpire}
          </p>
        )}
      </div>
    </section>
  );
}
import { useId, useState } from "react";
import { ChevronDown, Wallet } from "lucide-react";
import type { Wallet as WalletType, WalletLot } from "@/lib/api";
import { formatSingkat, formatTanggalIndonesia } from "@/lib/util/formatDate";
import { cn } from "@/lib/utils";
import { Shimmer } from "@/components/Shimmer";

interface CoinBalanceCardProps {
  /** Active wallet from `useGetWallet()`. `null` while loading or
   *  on error. The card renders "0 koin" as a fallback so a
   *  failed fetch doesn't crash the page. */
  wallet: WalletType | null;
  /** Whether the wallet fetch is still in flight. Drives the
   *  Shimmer placeholder so the value slot doesn't flash. */
  isLoading: boolean;
  /** Lots that still hold koin, FIFO (oldest first). May be empty
   *  for users who haven't topped up yet. The first entry drives
   *  the headline "X koin hangus - <date>" notice; when more
   *  than one entry is present, a small toggle reveals the rest
   *  so the user can see every upcoming expiry in one place. */
  expiringLots: WalletLot[];
}

/**
 * "Koin saat ini" card — live balance sourced from `useGetWallet()`
 * and surfaced to the page. While loading, the number renders a
 * Shimmer block at the same height as the resolved value so the
 * layout doesn't shift when the data lands.
 *
 * When the wallet has at least one unspent lot, the soonest-to-
 * expire one surfaces beneath the balance as a "X koin hangus -
 * <date>" headline. Users with several active lots see a small
 * "Lihat N lagi / Sembunyikan" toggle that expands to the full
 * FIFO list without leaving the card — kept inline rather than
 * behind a modal so the expiry timeline stays scannable in one
 * glance.
 */
export function CoinBalanceCard({
  wallet,
  isLoading,
  expiringLots,
}: CoinBalanceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const headline = expiringLots[0];
  const hasMany = expiringLots.length > 1;

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
        {headline && !isLoading && (
          <div className="mt-0.5">
            <p className="font-mono text-[10.5px] text-text-faint">
              {headline.remaining_balance.toLocaleString("id-ID")} koin hangus
              {" - "}
              {formatSingkat(headline.expire_at, "d MMM y, HH:mm") + ' WIB'}
            </p>
            {hasMany && (
              <>
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  aria-expanded={expanded}
                  aria-controls={listId}
                  className="mt-1 inline-flex items-center gap-1 font-mono text-[10.5px] font-medium text-text-muted transition-colors hover:text-text-primary"
                >
                  {expanded
                    ? "Sembunyikan"
                    : `Lihat ${expiringLots.length - 1} lagi`}
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 transition-transform",
                      expanded && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>
                {expanded && (
                  <ul
                    id={listId}
                    className="mt-1 flex flex-col gap-0.5 border-l border-border pl-2"
                  >
                    {expiringLots.slice(1).map((lot) => (
                      <li
                        key={lot.id}
                        className="font-mono text-[10.5px] text-text-faint"
                      >
                        {lot.remaining_balance.toLocaleString("id-ID")} koin
                        hangus
                        {" - "}
                        {formatTanggalIndonesia(lot.expire_at)}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

import type { WalletTransaction } from "@/lib/api";
import { ChevronDown, Loader2 } from "lucide-react";
import { Shimmer } from "@/components/Shimmer";
import { TransactionRow } from "./TransactionRow";

interface TransactionHistoryProps {
  /** Top-up invoice history from `useGetTransactionHistory()`. */
  transactions: WalletTransaction[];
  /** Whether the history fetch is still in flight. While true,
   *  the section renders 3 skeleton rows so it doesn't flash from
   *  "empty" → "data" once the data lands. */
  isLoading: boolean;
  /** ID of the invoice currently shown in `<PaymentQrCard />`,
   *   when one is on screen. The matching row gets the
   *   brand-tinted highlight so the user can see the QR they're
   *   scanning is the same row that will eventually land at the
   *   top of the history list. Optional — no row is highlighted
   *   when the QR card isn't rendered (e.g. on first paint, or
   *   after the invoice resolves into a "success" row). */
  highlightedId?: string;
  /** Click handler for pending rows. When provided, every row
   *  with `tx.status === "pending"` becomes interactive (button
   *  role + keyboard activation). Clicking surfaces that
   *  invoice in the QR card. Optional — leave undefined to
   *  render the list as plain (non-clickable) rows. */
  onSelectPending?: (tx: WalletTransaction) => void;
  /** Click handler for the "Muat lebih banyak" button. When
   *  provided alongside `hasMore`, the button renders below
   *  the list and triggers the parent to fetch the next page.
   *  Leave undefined to render the list without pagination —
   *  the button stays hidden regardless of `hasMore`. */
  onLoadMore?: () => void;
  /** Whether more pages exist beyond the current
   *  `transactions` array. Controls the visibility of the
   *  load-more button. Default `false` so the button stays
   *  hidden when pagination isn't wired. */
  hasMore?: boolean;
  /** Loading state for the load-more fetch. Distinct from
   *  `isLoading` so the initial skeleton doesn't flash on
   *  every Load more — only the button itself flips state
   *  (spinner + "Memuat…" + disabled) while the existing
   *  rows stay put. */
  isLoadingMore?: boolean;
}

/**
 * "Riwayat Top-up" card — paginated list of the active user's
 * top-up invoices, sorted newest-first at the consumer layer
 * (the backend doesn't guarantee order).
 *
 * Three render branches:
 *
 *   1. Loading → 3 skeleton rows in the same shape as the
 *      resolved rows (icon + meta + status pill) so the section
 *      doesn't shift when the data lands.
 *   2. Empty → the "Belum ada top-up" copy inside a dashed-border
 *      card so the user knows the section is wired but no
 *      invoices exist yet.
 *   3. Populated → one `TransactionRow` per invoice. When
 *      `onLoadMore` is provided alongside `hasMore`, a
 *      "Muat lebih banyak" button renders below the list for
 *      pagination support (the button stays hidden when the
 *      prop pair isn't supplied so non-paginated parents get
 *      the same compact list as before).
 */
export function TransactionHistory({
  transactions,
  isLoading,
  highlightedId,
  onSelectPending,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: TransactionHistoryProps) {
  return (
    <section className="rounded-lg border border-border bg-bg-secondary p-4">
      <p className="label">Riwayat Top-up</p>
      {isLoading ? (
        <div className="mt-2.5 flex flex-col gap-2" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-md border border-border bg-bg-card p-3"
            >
              <Shimmer className="h-8 w-8 rounded-full" />
              <div className="min-w-0 flex-1">
                <Shimmer className="h-3 w-24" />
                <Shimmer className="mt-1.5 h-3 w-16" />
              </div>
              <Shimmer className="h-4 w-20" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="mt-2.5 rounded-md border border-dashed border-border px-4 py-8 text-center">
          <p className="text-[13px] font-medium text-text-primary">
            Belum ada top-up
          </p>
          <p className="mt-1 text-[11.5px] text-text-muted">
            Riwayat top-up lo bakal muncul di sini.
          </p>
        </div>
      ) : (
        <>
          <ul className="mt-2.5 flex flex-col gap-2">
            {transactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                highlighted={tx.id === highlightedId}
                onSelect={
                  onSelectPending && tx.status === "pending"
                    ? () => onSelectPending(tx)
                    : undefined
                }
              />
            ))}
          </ul>

          {/* 📥 LOAD MORE — paginates the wallet history. Only
              rendered when the parent supplies both `onLoadMore`
              AND `hasMore=true`; otherwise this slot stays
              empty so non-paginated callers (e.g. embedded
              previews) keep their compact single-list look.
              While `isLoadingMore` is true the same button stays
              in place (so the user sees the affordance they
              just clicked) but flips to a spinner + "Memuat…"
              and is disabled, preventing rapid double-clicks
              from queuing multiple page-2 fetches. The skeleton
              gate above (`isLoading`) means this branch never
              tears down the existing rows during a load-more —
              only the button itself changes state. */}
          {onLoadMore && hasMore && (
            <div className="mt-2.5 flex justify-center">
              <button
                type="button"
                onClick={onLoadMore}
                disabled={isLoadingMore}
                aria-busy={isLoadingMore}
                className="group inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-secondary px-3.5 py-2 text-[12.5px] font-semibold text-text-secondary transition-all hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                    Memuat…
                  </>
                ) : (
                  <>
                    Muat lebih banyak
                    <ChevronDown
                      className="h-3 w-3 transition-transform group-hover:translate-y-px"
                      aria-hidden
                    />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
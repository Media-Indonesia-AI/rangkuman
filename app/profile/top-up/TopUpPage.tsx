"use client";

import { useCallback, useEffect, useState } from "react";
import type { TopupBundle, TopupRequest, WalletTransaction } from "@/lib/api";
import { loadTransactionHistory } from "@/lib/api/cache";
import { useGetTopupBundle } from "@/lib/hooks/useGetTopupBundle";
import { useGetTransactionHistory } from "@/lib/hooks/useGetTransactionHistory";
import { useGetWallet } from "@/lib/hooks/useGetWallet";
import { useRequestTopup } from "@/lib/hooks/useRequestTopup";
import { useWalletTransactionStream } from "@/lib/hooks/useWalletTransactionStream";
import {
  BundleSelector,
  CoinBalanceCard,
  PaymentQrCard,
  PPN_RATE,
  RUPIAH_PER_KOIN,
  TopUpHeader,
  TopUpTotals,
  TransactionHistory,
  formatTotals,
  validateCustomAmount,
} from "@/components/top-up";

/**
 * `/profile/top-up/` — Top Up section orchestrator.
 *
 * Owns local UI state, the wallet read fetches, the `POST
 * wallet/topup` mutation, and derived totals. Renders each
 * card from `@/components/top-up` in order: header → balance
 * → bundle selector → totals → QR card (when the displayed
 * transaction is the newest, i.e. index 0 of the history) → history.
 *
 * On submit failure the API error is forwarded via the
 * `berita-investor:toast` event so the existing toast widget
 * picks it up.
 */
export default function TopUpPage() {
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");

  const { data: bundles, isLoading: bundlesLoading } = useGetTopupBundle();
  const selectedBundle: TopupBundle | undefined = selectedBundleId
    ? bundles.find((b) => b.id === selectedBundleId)
    : undefined;

  const {
    data: wallet,
    isLoading: walletLoading,
    refresh: refreshWallet,
  } = useGetWallet();
  // Strip fully-consumed lots (`remaining_balance === 0`) so the
  // hangus notice surfaces the *next* upcoming expiry instead of
  // an already-spent one. FIFO order is preserved since the API
  // sorts the array oldest-first; the consumer's `.filter` keeps
  // that stable. The full filtered list is forwarded so the
  // card can offer a "show all" disclosure for users with many
  // active lots.
  const expiringLots = (wallet?.lots ?? []).filter(
    (l) => l.remaining_balance > 0,
  );

  const PAGE_SIZE = 10;
  const {
    data: initialTransactions,
    isLoading: transactionsLoading,
    refresh: refreshTransactions,
  } = useGetTransactionHistory(PAGE_SIZE, 0);

  // Accumulated list shown by `TransactionHistory`. Lives in
  // component state (not inside the hook) so the user can
  // paginate past the first page without losing older rows
  // when the hook re-fetches after a new top-up — the sync
  // effect below either replaces (initial load) or splices
  // (refresh after a new invoice landed). `hasMore` flips
  // to false the first time a page comes back short (no
  // `total` field on the wire — heuristic only).
  const [accumulated, setAccumulated] = useState<WalletTransaction[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Sync hook data into `accumulated`. Distinguishes the two
  // paths by the length of the previous accumulated list:
  // `prev.length <= PAGE_SIZE` → initial load (replace);
  // `prev.length > PAGE_SIZE` → refresh (the user has
  // already paginated past page 1, so splice in the new
  // head and shift the older tail by 1 to account for the
  // single row the top-up flow inserted at the top). The
  // shift-by-1 assumes the top-up flow only inserts one row
  // per cycle, which it does — `useRequestTopup` creates a
  // single invoice per `POST wallet/topup` call.
  useEffect(() => {
    if (transactionsLoading) return;
    setAccumulated((prev) => {
      if (prev.length <= PAGE_SIZE) {
        setHasMore(initialTransactions.length === PAGE_SIZE);
        return initialTransactions;
      }
      const tail = prev.slice(PAGE_SIZE - 1, prev.length - 1);
      const seen = new Set(initialTransactions.map((t) => t.id));
      const dedupTail = tail.filter((t) => !seen.has(t.id));
      setHasMore(initialTransactions.length === PAGE_SIZE);
      return [...initialTransactions, ...dedupTail];
    });
  }, [initialTransactions, transactionsLoading]);

  const handleLoadMore = useCallback(async () => {
    setIsLoadingMore(true);
    try {
      const nextSkip = accumulated.length;
      const res = await loadTransactionHistory(PAGE_SIZE, nextSkip);
      setAccumulated((prev) => {
        const seen = new Set(prev.map((t) => t.id));
        const fresh = res.data.filter((t) => !seen.has(t.id));
        return fresh.length > 0 ? [...prev, ...fresh] : prev;
      });
      if (res.data.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch {
      // Swallow — `accumulated` stays at its prior length and
      // the button re-enables on the next render. A toast
      // would be nice but the parent doesn't surface one for
      // background pagination failures today.
    } finally {
      setIsLoadingMore(false);
    }
  }, [accumulated.length]);

  // Backend doesn't guarantee order — sort newest-first here.
  const sortedTransactions = [...accumulated].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const customValidation = validateCustomAmount(customAmount);

  const effectiveAmount = selectedBundle?.price ?? customValidation.value;
  const ppnAmount =
    effectiveAmount != null ? Math.round(effectiveAmount * PPN_RATE) : null;
  const grandTotal =
    effectiveAmount != null && ppnAmount != null
      ? effectiveAmount + ppnAmount
      : null;
  const koinAmount = selectedBundle
    ? selectedBundle.coin_amount
    : effectiveAmount != null
      ? Math.floor(effectiveAmount / RUPIAH_PER_KOIN)
      : null;

  const { formattedPpn, formattedGrandTotal } = formatTotals(
    effectiveAmount,
    ppnAmount,
    grandTotal,
  );

  const {
    data: lastTransaction,
    isLoading: isSubmitting,
    error: submitError,
    request: requestTopup,
    reset: resetLastTransaction,
  } = useRequestTopup();

  // Re-fetch history when a fresh invoice lands so it appears
  // at the top of the list without waiting for a remount.
  useEffect(() => {
    if (lastTransaction?.id) {
      refreshTransactions();
    }
  }, [lastTransaction?.id, refreshTransactions]);

  // Pending invoice the user picked from the history list.
  // Clicking a pending row in `<TransactionHistory />` sets
  // this so the QR card surfaces that invoice — the user's
  // pick wins over `lastTransaction` so they can re-open the
  // QR for an older unfinished invoice even right after a
  // fresh submit.
  const [selectedPending, setSelectedPending] = useState<WalletTransaction | null>(
    null,
  );
  const displayedTransaction = selectedPending ?? lastTransaction;

  // Standalone `<PaymentQrCard />` gate — only renders for the
  // *newest* row, i.e. the one sitting at index 0 of the sorted
  // history. This keeps the top of the page free of duplicate
  // QRs when the user clicks an older pending row from the list:
  // the standalone card hides and the inline `<PaymentQrCard />`
  // inside that row's Fragment takes over.
  //
  // The first OR-clause (`displayedTransaction === lastTransaction`)
  // covers the brief window between POST resolution and the
  // history refresh landing — without it, the pure index-0 check
  // below would hide the QR just after submit because
  // `lastTransaction` isn't yet at index 0 of `sortedTransactions`
  // (the `refreshTransactions()` call is async, so the new row
  // takes a tick to land). After refresh, both clauses collapse
  // to the same row.
  const showStandaloneQr =
    displayedTransaction === lastTransaction ||
    (displayedTransaction != null &&
      displayedTransaction.id === sortedTransactions[0]?.id);

  // While a pending invoice is on screen, subscribe to the
  // upstream wallet-top-up SSE stream so close-out (paid,
  // expired, failed) lands without needing a remount. The
  // hook is a no-op when `displayedRef` is null — i.e. no
  // card on screen, or it just transitioned to null as the
  // `success` row replaced the pending one in Riayat.
  //
  // `onCloseOut` is the parent's side of the same handshake:
  // the hook fires it on a terminal-status event and we use
  // it to drop the active payment (so the QR card unmounts)
  // and re-fetch wallet + history so the new koin and the
  // `success` row both land. The hook also closes its
  // EventSource on the same event so the browser stops
  // trying to reconnect after a terminal status.
  const displayedRef = displayedTransaction?.payment_ref ?? null;
  const handleStreamCloseOut = useCallback(() => {
    setSelectedPending(null);
    resetLastTransaction();
    refreshWallet();
    refreshTransactions();
  }, [resetLastTransaction, refreshWallet, refreshTransactions]);
  useWalletTransactionStream(displayedRef, handleStreamCloseOut);

  const dispatchToast = (detail: string) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("berita-investor:toast", { detail }),
    );
  };

  /**
   * `POST wallet/topup` with an XOR body — bundle chip sends
   * `bundle_code`, custom field sends base IDR `amount` (no
   * PPN — backend adds VAT itself; sending the grand total
   * would double-count).
   */
  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!effectiveAmount) return;

    const body: TopupRequest = selectedBundle
      ? { bundle_code: selectedBundle.code }
      : { amount: effectiveAmount };

    const result = await requestTopup(body);
    if (result) {
      // Reset the form so the next top-up starts blank, and
      // clear any pending-row pick so the QR card shows the
      // freshly-generated invoice (`lastTransaction` now wins
      // via the `?? ` precedence).
      setSelectedBundleId(null);
      setCustomAmount("");
      setSelectedPending(null);
      dispatchToast(`Invoice dibuat · ref ${result.payment_ref}`);
    } else if (submitError) {
      dispatchToast(submitError);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <TopUpHeader />

      <CoinBalanceCard
        wallet={wallet}
        isLoading={walletLoading}
        expiringLots={expiringLots}
      />

      <BundleSelector
        bundles={bundles}
        isLoading={bundlesLoading}
        selectedBundleId={selectedBundleId}
        customAmount={customAmount}
        customValidation={customValidation}
        onSelectBundle={(id) => {
          setSelectedBundleId(id);
          setCustomAmount("");
        }}
        onChangeCustomAmount={(raw) => {
          const digits = raw.replace(/\D/g, "");
          setCustomAmount(digits);
          if (digits) setSelectedBundleId(null);
        }}
      />

      <TopUpTotals
        formattedPpn={formattedPpn}
        formattedGrandTotal={formattedGrandTotal}
        koinAmount={koinAmount}
        isSubmitting={isSubmitting}
        disabled={!effectiveAmount || customValidation.error !== null}
        onSubmit={handleSubmit}
      />

      {showStandaloneQr && displayedTransaction && (
        <PaymentQrCard transaction={displayedTransaction} />
      )}

      <TransactionHistory
        transactions={sortedTransactions}
        isLoading={transactionsLoading}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
        highlightedId={displayedTransaction?.id}
        // Toggle off when the user re-clicks the same pending
        // row — covers the "I'm done with this invoice, hide
        // the QR" gesture without needing a separate dismiss
        // button on the card.
        onSelectPending={(tx) =>
          setSelectedPending((prev) =>
            prev?.id === tx.id ? null : tx,
          )
        }
      />
    </div>
  );
}
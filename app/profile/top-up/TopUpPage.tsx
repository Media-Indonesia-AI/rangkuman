"use client";

import { useEffect, useState } from "react";
import type { TopupBundle, TopupRequest, WalletTransaction } from "@/lib/api";
import { useGetTopupBundle } from "@/lib/hooks/useGetTopupBundle";
import { useGetTransactionHistory } from "@/lib/hooks/useGetTransactionHistory";
import { useGetWallet } from "@/lib/hooks/useGetWallet";
import { useRequestTopup } from "@/lib/hooks/useRequestTopup";
import { formatTanggalIndonesia } from "@/lib/util/formatDate";
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
 * → bundle selector → totals → QR card (when an invoice
 * exists) → history.
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

  const { data: wallet, isLoading: walletLoading } = useGetWallet();
  const earliestLot = wallet?.lots?.[0];
  const earliestExpire =
    earliestLot && earliestLot.remaining_balance > 0
      ? formatTanggalIndonesia(earliestLot.expire_at)
      : null;

  const {
    data: transactions,
    isLoading: transactionsLoading,
    refresh: refreshTransactions,
  } = useGetTransactionHistory(10, 0);
  // Backend doesn't guarantee order — sort newest-first here.
  const sortedTransactions = [...transactions].sort(
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
  // this so the QR card surfaces that invoice. A fresh mutation
  // result (`lastTransaction`) wins when both exist so the QR
  // always shows the latest active invoice.
  const [selectedPending, setSelectedPending] = useState<WalletTransaction | null>(
    null,
  );
  const displayedTransaction = lastTransaction ?? selectedPending;

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
        earliestExpire={earliestExpire}
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

      {displayedTransaction && (
        <PaymentQrCard transaction={displayedTransaction} />
      )}

      <TransactionHistory
        transactions={sortedTransactions}
        isLoading={transactionsLoading}
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
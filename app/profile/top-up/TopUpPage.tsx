"use client";

import { useState } from "react";
import type { TopupBundle } from "@/lib/api";
import { useGetTopupBundle } from "@/lib/hooks/useGetTopupBundle";
import { useGetTransactionHistory } from "@/lib/hooks/useGetTransactionHistory";
import { useGetWallet } from "@/lib/hooks/useGetWallet";
import { formatTanggalIndonesia } from "@/lib/util/formatDate";
import {
  BundleSelector,
  CoinBalanceCard,
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
 * Thin orchestrator that owns:
 *   - local UI state (`selectedBundleId`, `customAmount`,
 *     `method`),
 *   - the three wallet-side fetches
 *     (`useGetTopupBundle`, `useGetWallet`,
 *     `useGetTransactionHistory`),
 *   - derived totals (effective amount, PPN, grand total, koin
 *     credited),
 *   - the "Coming soon" stub toast on submit.
 *
 * Each card is its own widget under `@/components/top-up`:
 *
 *   - `<TopUpHeader />`             — page title
 *   - `<CoinBalanceCard />`         — live balance + earliest expiry
 *   - `<BundleSelector />`          — chips + custom amount input
 *   - `<TopUpTotals />`             — sticky tax/coin/total + CTA
 *   - `<TransactionHistory />`      — Riwayat list (rows + empty state)
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

  // Curated top-up catalogue — small fixed list owned by the
  // wallet API. Sorted by `sort` ascending inside the hook so
  // the API's "front" bundle always renders first regardless of
  // the wire order.
  const { data: bundles, isLoading: bundlesLoading } = useGetTopupBundle();
  const selectedBundle: TopupBundle | undefined = selectedBundleId
    ? bundles.find((b) => b.id === selectedBundleId)
    : undefined;

  // Active wallet — server-aggregated `balance` plus the FIFO lot
  // stack. The earliest expiry lives in `lots[0]` because the
  // backend returns lots oldest-first. We only surface the expiry
  // line when the oldest lot still has unspent coins — otherwise
  // the date refers to coins that are already gone.
  const { data: wallet, isLoading: walletLoading } = useGetWallet();
  const earliestLot = wallet?.lots?.[0];
  const earliestExpire =
    earliestLot && earliestLot.remaining_balance > 0
      ? formatTanggalIndonesia(earliestLot.expire_at)
      : null;

  // Top-up invoice history for the Riwayat section. Backend
  // doesn't guarantee order, so we sort by `created_at`
  // descending at the consumer layer to get a stable newest-first
  // list. Spread first so we don't mutate the cached payload.
  const { data: transactions, isLoading: transactionsLoading } =
    useGetTransactionHistory(10, 0);
  const sortedTransactions = [...transactions].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  // Custom-amount parsing — user enters a coin count; we return
  // the Rp equivalent so the totals block can stay in currency.
  // Pure helper lives next to `<BundleSelector />` so both the
  // input error message and the totals disabled-state can read
  // the same validation result without re-parsing.
  const customValidation = validateCustomAmount(customAmount);

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

  const { formattedPpn, formattedGrandTotal } = formatTotals(
    effectiveAmount,
    ppnAmount,
    grandTotal,
  );

  const handleNotImplemented = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("berita-investor:toast", {
        detail: "Coming soon — lagi digarap.",
      }),
    );
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
        disabled={!effectiveAmount || customValidation.error !== null}
        onSubmit={handleNotImplemented}
      />

      <TransactionHistory
        transactions={sortedTransactions}
        isLoading={transactionsLoading}
      />
    </div>
  );
}
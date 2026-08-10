"use client";

import { useState } from "react";
import type { TopupBundle, TopupRequest } from "@/lib/api";
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
 * Thin orchestrator that owns:
 *   - local UI state (`selectedBundleId`, `customAmount`),
 *   - the three wallet-side read fetches
 *     (`useGetTopupBundle`, `useGetWallet`,
 *     `useGetTransactionHistory`),
 *   - the topup mutation (`useRequestTopup`) — wires the
 *     submit button to `POST wallet/topup` and renders the
 *     resulting QR card on success,
 *   - derived totals (effective amount, PPN, grand total, koin
 *     credited).
 *
 * Each card is its own widget under `@/components/top-up`:
 *
 *   - `<TopUpHeader />`         — page title
 *   - `<CoinBalanceCard />`     — live balance + earliest expiry
 *   - `<BundleSelector />`      — chips + custom amount input
 *   - `<TopUpTotals />`         — sticky tax/coin/total + CTA
 *   - `<PaymentQrCard />`       — gateway QR + invoice meta
 *                                 (rendered between totals and
 *                                 history once the mutation
 *                                 resolves with a fresh invoice)
 *   - `<TransactionHistory />`  — Riwayat list (rows + empty state)
 *
 * On submit failure the orchestrator surfaces the API error
 * message via the existing `berita-investor:toast` event so the
 * existing toast widget picks it up — same channel as the other
 * stub toasts.
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

  // Mutation hook — `request(body)` fires `POST wallet/topup`,
  // surfaces `data` (the fresh invoice) for the QR card, and
  // tracks `isLoading` / `error` for the submit button. See
  // `lib/hooks/useRequestTopup.ts` for the full shape.
  const {
    data: lastTransaction,
    isLoading: isSubmitting,
    error: submitError,
    request: requestTopup,
  } = useRequestTopup();

  const dispatchToast = (detail: string) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("berita-investor:toast", { detail }),
    );
  };

  /**
   * Submit handler — dispatches `POST wallet/topup` with an XOR
   * body.
   *
   *   - Bundle selected → `{ bundle_code: bundle.code }`. The
   *     backend applies the bundle's own price / coin math.
   *   - Custom-amount field → `{ amount: effectiveAmount }`,
   *     where `effectiveAmount` is the BASE IDR (pre-PPN). The
   *     request intentionally omits the PPN / grand total — the
   *     backend adds the VAT itself when it builds the invoice,
   *     and the response's `topup_amount` reflects that
   *     (basic_fee + vat). Sending the grand total would
   *     double-count the VAT.
   *
   * The XOR union (`TopupRequest`) means TypeScript narrows
   * correctly per branch — we can't accidentally send both.
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
        // Button activates the moment the user has a total value
        // (a chip is picked or a valid custom amount is entered).
        // The custom-amount validation error keeps the button
        // disabled when the input is over-range, and `isSubmitting`
        // locks it during the in-flight request so a second click
        // can't create a duplicate invoice. The `!method` gate is
        // intentionally dropped today because the "Metode
        // Pembayaran" section isn't rendered yet — once that UI
        // lands, restore `|| !method` here.
        disabled={
          !effectiveAmount ||
          customValidation.error !== null ||
          isSubmitting
        }
        onSubmit={handleSubmit}
      />

      {lastTransaction && (
        <PaymentQrCard transaction={lastTransaction} />
      )}

      <TransactionHistory
        transactions={sortedTransactions}
        isLoading={transactionsLoading}
      />
    </div>
  );
}
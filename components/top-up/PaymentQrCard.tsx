import type { WalletTransaction } from "@/lib/api";
import { formatTanggalIndonesia } from "@/lib/util/formatDate";
import { formatIdr } from "./constants";
import { cn } from "@/lib/utils";

interface PaymentQrCardProps {
  /** Freshly-created invoice from `useRequestTopup().data`.
   *  `payment_url` is a base64-encoded PNG `data:` URL the
   *  gateway returned — render it directly via `<img src>` so
   *  the user can scan it without a separate download. */
  transaction: WalletTransaction;
  /** Optional "Bayar" handler — the onramp flow may want to
   *  re-confirm the QR is still valid before re-issuing the
   *  invoice. Today the section is display-only, so the prop
   *  is optional and the button is hidden when not supplied. */
  onDismiss?: () => void;
}

/**
 * Payment card rendered between `<TopUpTotals />` and
 * `<TransactionHistory />` once a `POST wallet/topup` succeeds.
 *
 * Shows:
 *   - the gateway-issued QR (`payment_url` as inline `<img src>`)
 *   - the invoice amount + koin credited
 *   - the `payment_ref` (for support / dispute flows)
 *   - the `expire_at` formatted in Indonesian, with the
 *     `"pending"` status pill in brand color
 *
 * Once the gateway reports `status === "success"` on a refetch
 * (not part of this widget — handled by the transaction-history
 * list), the parent should drop this card; the invoice then
 * lives on as a row in the Riwayat list below.
 */
export function PaymentQrCard({ transaction, onDismiss }: PaymentQrCardProps) {
  const koin = Math.round(transaction.coin_amount);
  const isPending = transaction.status === "pending";
  return (
    <section
      aria-label="Pembayaran Top-up"
      className={cn(
        "rounded-lg border p-4",
        isPending
          ? "border-brand bg-brand-soft/30"
          : "border-border bg-bg-secondary",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="label">Pembayaran</p>
          <p className="mt-0.5 truncate font-mono text-[10.5px] text-text-faint">
            Ref {transaction.payment_ref}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
            isPending
              ? "bg-brand text-bg-primary"
              : "bg-bg-tertiary text-text-muted",
          )}
        >
          {isPending ? "Pending" : transaction.status}
        </span>
      </div>

      {/* QR + amount side by side on sm+, stacked on mobile */}
      <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="flex shrink-0 justify-center rounded-md border border-border bg-bg-card p-2">
          {/* `payment_url` is a base64 PNG data URL — render
              directly so the browser handles decoding. The
              QR encodes `metadata.qr_string` (or the gateway's
              equivalent), which the user's payment app picks
              up when scanned. `next/image` isn't useful here:
              the payload is already a self-contained ~few-KB
              data URL with no upstream to optimise, and we
              need the raw <img> so the browser hands the
              pixels straight to the user's payment app's
              scanner without any image-processor intermediation. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={transaction.payment_url}
            alt={`QR code untuk invoice ${transaction.payment_ref}`}
            width={160}
            height={160}
            className="h-40 w-40"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-semibold uppercase tracking-widest text-text-muted">
            Total tagihan
          </p>
          <p className="mt-0.5 font-mono text-[20px] font-bold tabular-nums text-text-primary">
            {formatIdr(transaction.topup_amount)}
          </p>
          <p className="mt-1 font-mono text-[12px] font-semibold tabular-nums text-brand">
            ≈ {koin.toLocaleString("id-ID")} koin
          </p>

          <dl className="mt-3 space-y-1 font-mono text-[10.5px] text-text-muted">
            <div className="flex justify-between gap-2">
              <dt>Hangus</dt>
              <dd className="text-text-secondary">
                {formatTanggalIndonesia(transaction.expire_at)}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Dibuat</dt>
              <dd className="text-text-secondary">
                {formatTanggalIndonesia(transaction.created_at)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {onDismiss && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onDismiss}
            className="font-mono text-[10.5px] text-text-faint underline-offset-2 hover:text-text-primary hover:underline"
          >
            Tutup invoice ini
          </button>
        </div>
      )}
    </section>
  );
}
import { CheckCircle2 } from "lucide-react";
import type { WalletTransaction } from "@/lib/api";
import { formatTanggalIndonesia } from "@/lib/util/formatDate";
import { formatIdr } from "./constants";
import { cn } from "@/lib/utils";

/**
 * One row in the Riwayat Top-up list. Renders the date, the IDR
 * amount paid, the koin credited (rounded — the wire sends
 * fractional koin like `33.333…` from the Rp / koin math), the
 * payment source if the gateway reported one, and a status pill
 * keyed on `tx.status` (only "success" gets a brand-coloured
 * pill today; everything else falls through to a neutral pill
 * with the raw status text).
 */
export function TransactionRow({ tx }: { tx: WalletTransaction }) {
  const koin = Math.round(tx.coin_amount);
  // `metadata` can be `null` on pending / failed invoices (see
  // `WalletTransaction.metadata`'s nullable union), so guard the
  // whole chain before reading `payment_details.source`.
  const source = tx.metadata?.payment_details?.source;
  const dateLabel = formatTanggalIndonesia(tx.created_at);
  const isSuccess = tx.status === "success";
  return (
    <li className="flex items-center gap-3 rounded-md border border-border bg-bg-card p-3">
      <span
        aria-hidden
        className={cn(
          "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isSuccess
            ? "bg-brand-soft text-brand"
            : "bg-bg-tertiary text-text-muted",
        )}
      >
        <CheckCircle2 className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-[12.5px] font-semibold tabular-nums text-text-primary">
          {formatIdr(tx.topup_amount)}
          <span className="ml-1 font-mono text-[11px] font-medium text-text-muted">
            · {koin.toLocaleString("id-ID")} koin
          </span>
        </p>
        <p className="mt-0.5 truncate font-mono text-[10.5px] text-text-faint">
          {dateLabel}
          {source && ` · ${source}`}
        </p>
      </div>
      <span
        className={cn(
          "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
          isSuccess
            ? "bg-brand-soft text-brand"
            : "bg-bg-tertiary text-text-muted",
        )}
      >
        {isSuccess ? "Sukses" : tx.status}
      </span>
    </li>
  );
}
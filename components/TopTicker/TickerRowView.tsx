/**
 * Single marquee cell. Pulled out of the render loop so the parent
 * JSX stays focused on iteration + duplication rather than per-row
 * formatting rules.
 *
 * Pure display — no `<a>` / no `href`, no click affordance. The
 * ticker is informational only; the parent application owns any
 * navigation that should follow a click on a row.
 *
 * The `key` lives on the element at the call site (React reserves
 * the prop name).
 */
import { cn } from "@/lib/utils";
import type { TickerRow } from "./types";
import { formatCoinPrice, formatStockPrice } from "./formatters";

interface TickerRowViewProps {
  row: TickerRow;
}

export function TickerRowView({ row }: TickerRowViewProps) {
  const positive = row.changePercent >= 0;
  const isCoin = row.kind === "crypto";
  const priceLabel = isCoin
    ? `$${formatCoinPrice(row.price)}`
    : formatStockPrice(row.price);
  return (
    <div className="inline-flex shrink-0 items-center gap-1.5 px-3 font-mono text-[11px] text-text-secondary sm:gap-2 sm:px-4 sm:text-[12px]">
      <span className="font-semibold tracking-tight text-text-primary">
        {row.kode}
      </span>
      <span className="num-tabular text-text-secondary">{priceLabel}</span>
      <span
        className={cn(
          "num-tabular",
          positive ? "text-bullish" : "text-bearish",
        )}
      >
        {positive ? "▲" : "▼"} {Math.abs(row.changePercent).toFixed(2)}%
      </span>
      <span className="text-text-faint">·</span>
    </div>
  );
}

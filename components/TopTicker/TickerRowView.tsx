/**
 * Single marquee cell. Pulled out of the render loop so the parent
 * JSX stays focused on iteration + duplication rather than per-row
 * formatting rules.
 *
 * The `key` lives on the element at the call site (React reserves
 * the prop name).
 */
import { cn } from "@/lib/utils";
import type { TickerRow } from "./types";
import { cryptoRecapHref } from "./tickerData";
import { formatCoinPrice, formatStockPrice } from "./formatters";

interface TickerRowViewProps {
  row: TickerRow;
}

export function TickerRowView({ row }: TickerRowViewProps) {
  const positive = row.changePercent >= 0;
  const isCoin = row.kind === "crypto";
  const href = isCoin ? cryptoRecapHref(row.kode) : `/stock/${row.kode}`;
  const priceLabel = isCoin
    ? `$${formatCoinPrice(row.price)}`
    : formatStockPrice(row.price);
  return (
    <a
      href={href}
      className="group inline-flex shrink-0 items-center gap-1.5 px-3 font-mono text-[11px] text-text-secondary transition-colors hover:text-text-primary sm:gap-2 sm:px-4 sm:text-[12px]"
    >
      <span className="font-semibold tracking-tight text-text-primary group-hover:text-brand">
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
    </a>
  );
}

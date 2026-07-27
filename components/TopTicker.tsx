"use client";

import { useEffect, useState } from "react";
import { stocks as mockStocks } from "@/lib/mock/stocks";
import { COINS } from "@/lib/mock/crypto";
import { GLOBAL_INDICES } from "@/lib/mock/category-widgets";
import { loadTickers, peekTickers } from "@/lib/api/cache";
import type { TickerItem } from "@/lib/api";
import { cn } from "@/lib/utils";

export type TopTickerVariant = "stocks" | "crypto" | "global";

interface TopTickerProps {
  /** Which dataset to scroll. */
  variant?: TopTickerVariant;
}

function formatStockPrice(value: number): string {
  if (value >= 1000) {
    return value.toLocaleString("id-ID");
  }
  return String(value);
}

function formatCoinPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  if (price >= 1) {
    return price.toFixed(2);
  }
  if (price >= 0.01) {
    return price.toFixed(3);
  }
  return price.toFixed(4);
}

function formatIndexValue(value: string): string {
  // Indices have comma-decimal like "5.842,15" — keep as is
  return value;
}

/**
 * Render shape for a single stock row. `Saham` (mock) is a superset
 * of this; `TickerItem` (API) maps onto it via `tickerToEntry`. Both
 * sources flow into the same render path.
 */
interface StockEntry {
  kode: string;
  nama: string;
  price: number;
  changePercent: number;
}

function tickerToEntry(t: TickerItem): StockEntry {
  return {
    kode: t.ticker,
    nama: t.company_name,
    price: t.price,
    changePercent: t.percent_change,
  };
}

/**
 * Sticky horizontal price ticker — swaps content based on `variant`.
 *   - "stocks" (default): Indonesian stocks (IHSG) — fetched from
 *     /stocks/ticker, with the mock catalog as fallback during the
 *     initial load and on error
 *   - "crypto": crypto prices (BTC, ETH, SOL, etc.)
 *   - "global": world indices (S&P 500, HSI, Nikkei, etc.)
 *
 * Pure CSS marquee (no JS animation) with duplicated content for seamless loop.
 */
export function TopTicker({ variant = "stocks" }: TopTickerProps) {
  const label =
    variant === "crypto"
      ? "Harga crypto real-time"
      : variant === "global"
        ? "Indeks global real-time"
        : "Harga saham real-time";

  // Live ticker data for the "stocks" variant. Initialized lazily from
  // the shared cache so a remount that happens after another instance
  // has already fetched shows the data on the first render (no flash
  // of the mock fallback). We store the unwrapped array (`.data`) so
  // the rest of this component can treat it as a plain list.
  const [apiStocks, setApiStocks] = useState<TickerItem[] | null>(
    () => peekTickers()?.data ?? null,
  );

  useEffect(() => {
    if (variant !== "stocks") return;
    let cancelled = false;
    void loadTickers()
      .then((res) => {
        if (!cancelled) setApiStocks(res.data);
      })
      .catch(() => {
        // Swallow — the mock list below is the fallback for any failure
        // (auth, network, server error, malformed response).
      });
    return () => {
      cancelled = true;
    };
  }, [variant]);

  // Prefer live data when it arrived with content; otherwise fall back
  // to the mock catalog so the ticker is never empty. (Saham[] is
  // assignable to StockEntry[] via structural typing — the mock is a
  // superset of what we need.)
  const stockSource: StockEntry[] =
    apiStocks !== null && apiStocks.length > 0
      ? apiStocks.map(tickerToEntry)
      : mockStocks;

  return (
    <div
      className="relative overflow-hidden border-b border-border bg-bg-secondary"
      aria-label={label}
    >
      {/* Edge fades so the marquee doesn't clip harshly */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-bg-secondary to-transparent sm:w-12" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-bg-secondary to-transparent sm:w-12" />

      <div className="flex animate-marquee whitespace-nowrap py-1.5 will-change-transform sm:py-2">
        {/* Render items twice for seamless infinite loop (when first set scrolls off, second set is already in view) */}
        {[0, 1].flatMap((dupIdx) =>
          variant === "crypto"
            ? COINS.map((c, idx) => (
                <a
                  key={`coin-d${dupIdx}-${c.kode}-${idx}`}
                  href={`/crypto/detail/${c.kode === "BTC" ? "cr-btc-2026-06-07" : c.kode === "ETH" ? "cr-eth-2026-06-07" : c.kode === "SOL" ? "cr-sol-2026-06-07" : c.kode === "FET" ? "cr-fet-2026-06-07" : c.kode === "LINK" ? "cr-link-2026-06-07" : c.kode === "DOGE" ? "cr-doge-2026-06-07" : ""}`}
                  className="group inline-flex shrink-0 items-center gap-1.5 px-3 font-mono text-[11px] text-text-secondary transition-colors hover:text-text-primary sm:gap-2 sm:px-4 sm:text-[12px]"
                >
                  <span className="font-semibold tracking-tight text-text-primary group-hover:text-brand">
                    {c.kode}
                  </span>
                  <span className="num-tabular text-text-secondary">
                    ${formatCoinPrice(c.price)}
                  </span>
                  <span
                    className={cn(
                      "num-tabular",
                      c.changePercent >= 0 ? "text-bullish" : "text-bearish",
                    )}
                  >
                    {c.changePercent >= 0 ? "▲" : "▼"}{" "}
                    {Math.abs(c.changePercent).toFixed(2)}%
                  </span>
                  <span className="text-text-faint">·</span>
                </a>
              ))
            : variant === "global"
              ? GLOBAL_INDICES.map((idx, i) => (
                  <a
                    key={`idx-d${dupIdx}-${idx.id}-${i}`}
                    href="#"
                    className="group inline-flex shrink-0 items-center gap-1.5 px-3 font-mono text-[11px] text-text-secondary transition-colors hover:text-text-primary sm:gap-2 sm:px-4 sm:text-[12px]"
                  >
                    <span className="font-semibold tracking-tight text-text-primary group-hover:text-brand">
                      {idx.name}
                    </span>
                    <span className="num-tabular text-text-secondary">
                      {formatIndexValue(idx.value)}
                    </span>
                    <span
                      className={cn(
                        "num-tabular",
                        idx.change >= 0 ? "text-bullish" : "text-bearish",
                      )}
                    >
                      {idx.change >= 0 ? "▲" : "▼"}{" "}
                      {Math.abs(idx.change).toFixed(2)}%
                    </span>
                    <span className="text-text-faint">·</span>
                  </a>
                ))
              : stockSource.map((s, idx) => {
                  const positive = s.changePercent >= 0;
                  const href = `/stock/${s.kode}`;
                  return (
                    <a
                      key={`stk-d${dupIdx}-${s.kode}-${idx}`}
                      href={href}
                      className="group inline-flex shrink-0 items-center gap-1.5 px-3 font-mono text-[11px] text-text-secondary transition-colors hover:text-text-primary sm:gap-2 sm:px-4 sm:text-[12px]"
                    >
                      <span className="font-semibold tracking-tight text-text-primary group-hover:text-brand">
                        {s.kode}
                      </span>
                      <span className="num-tabular text-text-secondary">
                        {formatStockPrice(s.price)}
                      </span>
                      <span
                        className={cn(
                          "num-tabular",
                          positive ? "text-bullish" : "text-bearish",
                        )}
                      >
                        {positive ? "▲" : "▼"} {Math.abs(s.changePercent).toFixed(2)}%
                      </span>
                      <span className="text-text-faint">·</span>
                    </a>
                  );
                }),
        )}
      </div>
    </div>
  );
}

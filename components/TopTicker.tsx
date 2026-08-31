"use client";

import { useEffect, useMemo, useState } from "react";
import { stocks as mockStocks, type Saham } from "@/lib/mock/stocks";
import { COINS, type Coin } from "@/lib/mock/crypto";
import { COIN_KODE_TO_STORY_ID } from "@/components/crypto-page/cryptoStories";
import { useTickers } from "@/lib/hooks/useTickers";
import { useCoinTicker } from "@/lib/hooks/useCoinTicker";
import type { CoinTickerItem, TickerItem } from "@/lib/api";
import { cn } from "@/lib/utils";

export type TopTickerVariant = "stocks" | "crypto" | "home";

/** Section discriminator for the `label` prop. Drives the render branch:
 *  - `"saham"`            → only the stocks list
 *  - `"crypto"`           → only the crypto list
 *  - anything else / unset → combined: up to 15 random stocks + up to
 *                            15 random crypto, interleaved
 *
 *  Overrides `variant` when both are set. */
export type TopTickerLabel = "saham" | "crypto" | (string & {});

interface TopTickerProps {
  /** Legacy default when `label` is not provided. Ignored if `label` is set.
   *  - `"stocks"` → `"saham"` branch
   *  - `"crypto"` → `"crypto"` branch
   *  - `"home"`   → combined branch */
  variant?: TopTickerVariant;
  label?: TopTickerLabel;
}

const COMBINED_RANDOM_LIMIT = 10;

/** Resolve the actual label the component renders against.
 *  `label` wins when both are set; otherwise `variant` seeds the
 *  default. `undefined` (and any non-`"saham"`/non-`"crypto"` label)
 *  falls through to the combined branch. */
function resolveEffectiveLabel(
  label: TopTickerLabel | undefined,
  variant: TopTickerVariant,
): TopTickerLabel | undefined {
  if (label) return label;
  if (variant === "crypto") return "crypto";
  if (variant === "home") return undefined;
  return "saham";
}

/** Screen-reader string for the marquee container. Mirrors the
 *  resolved label so the announced list matches what's visible. */
function ariaLabelFor(label: TopTickerLabel | undefined): string {
  if (label === "crypto") return "Harga crypto real-time";
  if (label === "saham") return "Harga saham real-time";
  return "Harga saham & crypto real-time";
}

/** Fisher–Yates shuffle. Pure / non-mutating — returns a new
 *  array. Used to draw the random subset for the combined label
 *  branch. */
function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
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

/** Unified row shape — both the stock and crypto feeds land here
 *  via `tickerToEntry` / `coinToEntry` / `coinTickerToEntry`. The
 *  `kind` tag drives the per-row `href` (stocks → `/stock/<kode>`,
 *  crypto → the recap-detail story-id lookup) without forcing the
 *  render loop to special-case the link shape. */
interface TickerRow {
  kind: "stock" | "crypto";
  kode: string;
  nama: string;
  price: number;
  changePercent: number;
}

function tickerToEntry(t: TickerItem): TickerRow {
  return {
    kind: "stock",
    kode: t.ticker,
    nama: t.company_name,
    price: t.price,
    changePercent: t.percent_change,
  };
}

function coinToEntry(c: Coin): TickerRow {
  return {
    kind: "crypto",
    kode: c.kode,
    nama: c.nama,
    price: c.price,
    changePercent: c.changePercent,
  };
}

function coinTickerToEntry(item: CoinTickerItem): TickerRow {
  // Wire shape ships lowercase tickers (`"btc"`); the rest of the
  // app's recap-id lookup is keyed on the uppercase form.
  return {
    kind: "crypto",
    kode: item.ticker.toUpperCase(),
    nama: item.ticker_name,
    price: item.price,
    // The wire field is a signed percent — keep the sign, the
    // render path formats it the same as the mock feed.
    changePercent: item.price_change,
  };
}

/** Build the recap-detail URL for a crypto ticker. Returns the
 *  stock-detail page when the ticker isn't in the lookup so the
 *  link still navigates somewhere rather than landing on a
 *  dangling URL. */
function cryptoRecapHref(kode: string): string {
  const storyId = COIN_KODE_TO_STORY_ID[kode];
  return storyId ? `/sorotan/detail/${storyId}` : `/stock/${kode}`;
}

/** Single marquee cell. Pulled out of the render loop so the JSX
 *  in the parent stays focused on iteration + duplication rather
 *  than formatting rules. The `key` lives on the element at the
 *  call site (React reserves the prop name). */
function TickerRowView({ row }: { row: TickerRow }) {
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

/**
 * Sticky horizontal price ticker. Renders one row per
 * `TickerRow` (stock or crypto) — the rows a visitor sees depend
 * on the `label` prop:
 *
 *   - `"saham"`           → only stocks
 *   - `"crypto"`          → only crypto
 *   - anything else       → up to 15 random stocks + up to 15
 *                           random crypto, interleaved
 *
 * Pure CSS marquee (no JS animation) with duplicated content for
 * seamless loop. Stocks prefer the live `GET stocks/ticker` data
 * (seeded from the cache so the first render shows it without a
 * flash), and fall back to the mock catalog on error or empty.
 * Crypto prefers the live `GET coin/ticker/` feed, and falls back
 * to `COINS` on error or empty.
 */
export function TopTicker({
  variant = "stocks",
  label,
}: TopTickerProps) {
  // `label` wins when both are set so the new prop drives
  // dispatch; `variant` only seeds the default when `label` is
  // omitted (existing call sites that only pass `variant` keep
  // working). `undefined` falls through to the combined branch —
  // any non-`"saham"`/non-`"crypto"` label (including absent)
  // renders the random interleaved feed.
  const effectiveLabel = resolveEffectiveLabel(label, variant);
  const ariaLabel = ariaLabelFor(effectiveLabel);

  // Live ticker data for both feeds. Both hooks are called
  // unconditionally so the combined branch has both lists ready
  // when the user lands on a non-specific label.
  const apiStocks = useTickers();
  const apiCoins = useCoinTicker();

  // Memoize the resolved source so the downstream shuffle
  // doesn't fire on every parent re-render — `apiStocks.map(...)`
  // produces a fresh array each call.
  const stockSource: TickerRow[] = useMemo(
    () =>
      apiStocks.length > 0 ? apiStocks.map(tickerToEntry) : mockStocks.map(
        (s: Saham): TickerRow => ({
          kind: "stock",
          kode: s.kode,
          nama: s.nama,
          price: s.price,
          changePercent: s.changePercent,
        }),
      ),
    [apiStocks],
  );

  const cryptoSource: TickerRow[] = useMemo(
    () =>
      apiCoins.length > 0
        ? apiCoins.map(coinTickerToEntry)
        : COINS.map(coinToEntry),
    [apiCoins],
  );

  // Pick the row set the visitor actually sees. The combined
  // branch draws a fresh random subset of 15 from each side and
  // interleaves them so the marquee doesn't read as "stocks then
  // crypto".
  //
  // The initial state is a deterministic concat (no `Math.random()`)
  // — the lazy initializer runs exactly once at mount, with the same
  // inputs on the server and the client's first render, so both agree
  // on the first paint (avoids the React hydration mismatch that a
  // non-deterministic shuffle would cause).
  const [rows, setRows] = useState<TickerRow[]>(() => {
    if (effectiveLabel === "saham") {
      return stockSource;
    }
    if (effectiveLabel === "crypto") {
      return cryptoSource;
    }
    return [
      ...stockSource.slice(0, COMBINED_RANDOM_LIMIT),
      ...cryptoSource.slice(0, COMBINED_RANDOM_LIMIT),
    ];
  });

  // Post-mount shuffle — only runs on the client, so the
  // server-rendered HTML stays in sync with the client's first
  // render. When the source feeds update (live data lands, label
  // changes) we recompute from the new sources and re-shuffle the
  // combined branch.
  useEffect(() => {
    if (effectiveLabel === "saham") {
      setRows(stockSource);
      return;
    }
    if (effectiveLabel === "crypto") {
      setRows(cryptoSource);
      return;
    }
    const stockPick = shuffle(stockSource).slice(0, COMBINED_RANDOM_LIMIT);
    const cryptoPick = shuffle(cryptoSource).slice(0, COMBINED_RANDOM_LIMIT);
    setRows(shuffle([...stockPick, ...cryptoPick]));
  }, [effectiveLabel, stockSource, cryptoSource]);

  return (
    <div
      className="relative overflow-hidden border-b border-border bg-bg-secondary"
      aria-label={ariaLabel}
    >
      {/* Edge fades so the marquee doesn't clip harshly */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-bg-secondary to-transparent sm:w-12" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-bg-secondary to-transparent sm:w-12" />

      <div className="flex animate-marquee whitespace-nowrap py-1.5 will-change-transform sm:py-2">
        {/* Render items twice for seamless infinite loop (when first set scrolls off, second set is already in view) */}
        {[0, 1].flatMap((dupIdx) =>
          rows.map((row, idx) => (
            <TickerRowView
              key={`row-d${dupIdx}-${row.kind}-${row.kode}-${idx}`}
              row={row}
            />
          )),
        )}
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useMarketMoodData } from "@/lib/hooks/useMarketMoodData";
import { Shimmer } from "@/components/Shimmer";
import { formatCompactIdr } from "@/lib/util/formatNumber";
import { cn, formatNumber } from "@/lib/utils";

interface MarketIndicator {
  label: string;
  value: string;
  change: number;
  /** "%" or absolute value (for FX). */
  unit?: string;
}

interface MarketsStripProps {
  indicators?: MarketIndicator[];
  className?: string;
}

/** Placeholder rendered for any field whose live source is still
 *  `null` (fetch in flight or returned nothing). Using `n/a`
 *  rather than `—` so the missing-value rows scan as "data not
 *  available" rather than decorative dash separators. */
const NA = "n/a";

/** Derive the 4 live indicator rows from the bundle returned by
 *  `useMarketMoodData()`. Mirrors the row list the
 *  `MarketSnapshotCompact` component builds from the same hook
 *  (sans the `Mood` row that lives only in the sidebar variant).
 *  `Emas` (the old hardcoded gold indicator) has been replaced
 *  with `Foreign Flow`, sourced from
 *  `foreignFlow.summary.net_value` — the cross-market net buy/sell
 *  in raw IDR, compact-formatted. Each row carries a `change` that
 *  feeds the `Direction` arrow; the foreign-flow `change` is the
 *  sign of the net value (magnitude alone doesn't read as a
 *  direction in a single-character widget). */
function buildIndicators(
  biRate: ReturnType<typeof useMarketMoodData>["biRate"],
  exchangeRate: ReturnType<typeof useMarketMoodData>["exchangeRate"],
  foreignFlow: ReturnType<typeof useMarketMoodData>["foreignFlow"],
  compositeChart: ReturnType<typeof useMarketMoodData>["compositeChart"],
  mood: ReturnType<typeof useMarketMoodData>["mood"],
): MarketIndicator[] {
  // IHSG — composite chart's last point is the freshest closing
  // value. The mood snapshot's `ihsg_pct_change` is the matching
  // day-change percent, so we pair them: value = price, change =
  // pct move.
  const ihsgClose = compositeChart?.[compositeChart.length - 1]?.price;
  const ihsgRow: MarketIndicator = {
    label: "IHSG",
    value: ihsgClose != null ? formatNumber(ihsgClose, 2) : NA,
    change: mood?.ihsg_pct_change ?? 0,
    unit: "%",
  };

  // USD/IDR — exchange rate series' last point. Pair with the
  // mood's `usd_idr_pct_change` for the day delta.
  const usdIdr = exchangeRate?.data?.[exchangeRate.data.length - 1]?.rate;
  const usdRow: MarketIndicator = {
    label: "USD/IDR",
    value: usdIdr != null ? formatNumber(usdIdr, 0) : NA,
    change: mood?.usd_idr_pct_change ?? 0,
    unit: "%",
  };

  // BI Rate — dedicated `biRate` snapshot. The `rate` field is
  // already a percent (e.g. 6.25 → "6,25%"); the matching `bps`
  // change uses the `bps` unit, not percent.
  const biRow: MarketIndicator = {
    label: "BI Rate",
    value: biRate ? `${formatNumber(biRate.rate, 2).replace(",", ".")}%` : NA,
    change: biRate?.bps ?? 0,
    unit: "bps",
  };

  // Foreign Flow — `summary.net_value` is the cross-market net
  // buy/sell in raw IDR. Compact-ify for the strip; the `change`
  // field is the sign (magnitude alone doesn't read as a direction
  // at this widget width). Uses `formatCompactIdr` (not
  // `formatCurrency`) so the rendered value is `"+1,2 T"` / `"-412,5 M"`
  // without the `Rp` prefix — the strip is a tight horizontal
  // snapshot, not a full currency cell, and the `Rp` symbol eats
  // space the percentage arrow needs.
  const netValue = foreignFlow?.summary.net_value;
  const foreignRow: MarketIndicator = {
    label: "Foreign Flow",
    value: netValue != null ? formatCompactIdr(netValue) : NA,
    change: netValue != null ? Math.sign(netValue) : 0,
    unit: "%",
  };

  return [ihsgRow, usdRow, biRow, foreignRow];
}

function Direction({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono text-[10.5px] font-semibold text-cat-saham">
        <TrendingUp className="h-2.5 w-2.5" aria-hidden />
        +{value.toFixed(2)}
        {!value.toString().includes("bps") && "%"}
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono text-[10.5px] font-semibold text-cat-kebijakan">
        <TrendingDown className="h-2.5 w-2.5" aria-hidden />
        {value.toFixed(2)}
        {!value.toString().includes("bps") && "%"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 font-mono text-[10.5px] font-semibold text-text-muted">
      <Minus className="h-2.5 w-2.5" aria-hidden />
      0.00%
    </span>
  );
}

/** WSJ-style horizontal market snapshot bar.
 *
 *  Sourced from `useMarketMoodData()` — 4 indicators (IHSG, USD/IDR,
 *  BI Rate, Foreign Flow) built from the matching live fetches.
 *  The `indicators` prop is kept for backward compatibility (and
 *  for the "use it for tests" path): when callers pass their own
 *  array it short-circuits the hook, so a unit test can render the
 *  strip with a static fixture and avoid wiring up the whole
 *  cache + fetcher chain. In production usage callers omit the
 *  prop and the live hook is used.
 *
 *  Per-source loading: each row's shimmer state is bound to the
 *  matching `isLoading.*` flag from the hook, so an indicator
 *  whose fetch is still in flight shows a `<Shimmer />` for both
 *  its value and its direction arrow. Rows whose fetch has
 *  settled (success or failure) render their real data. The label
 *  stays visible during loading — same convention the rest of the
 *  app uses — so the user always sees *which* indicator is
 *  loading, not just a row of empty pulses. */
export function MarketsStrip({
  indicators,
  className,
}: MarketsStripProps) {
  // Only call the hook when the caller didn't pre-supply
 // indicators. Conditionally invoking a hook would break the
 // rules-of-hooks; the early `??` keeps the hook unconditional
 // by deriving `liveIndicators` first, then preferring the prop
 // when present.
  const { biRate, exchangeRate, foreignFlow, compositeChart, mood, isLoading } =
    useMarketMoodData();

  const liveIndicators = useMemo(
    () => buildIndicators(biRate, exchangeRate, foreignFlow, compositeChart, mood),
    [biRate, exchangeRate, foreignFlow, compositeChart, mood],
  );

  const rows = indicators ?? liveIndicators;

  // Per-row loading lookup. Keys match `buildIndicators()` labels
 // exactly — when the hook bundle says a source is still in
 // flight, the matching row renders shimmer for its value +
 // direction. When a caller supplies their own `indicators` prop
 // (test fixture path), every row gets `false` since no
 // `isLoading` state applies; shimmer is purely a live-data
 // concern.
  const rowLoading: Record<string, boolean> = {
    IHSG: isLoading.compositeChart,
    "USD/IDR": isLoading.exchangeRate,
    "BI Rate": isLoading.biRate,
    "Foreign Flow": isLoading.foreignFlow,
  };

  return (
    <div
      aria-busy={indicators === undefined && Object.values(isLoading).some(Boolean) ? true : undefined}
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 border-y border-border-strong bg-bg-secondary/50 px-4 py-2.5 sm:gap-4 sm:px-5",
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
        <span className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-muted">
          Markets
        </span>
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-x-5 gap-y-1.5 sm:justify-end">
        {rows.map((ind) => {
          const loading = rowLoading[ind.label] ?? false;
          return (
            <div key={ind.label} className="flex items-center gap-1.5">
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-text-muted">
                {ind.label}
              </span>
              {loading ? (
                <Shimmer className="h-4 w-16" />
              ) : (
                <span className="font-mono text-[12px] font-semibold tabular-nums text-text-primary">
                  {ind.value}
                </span>
              )}
              {loading ? (
                <Shimmer className="h-3 w-10" />
              ) : (
                <Direction value={ind.change} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

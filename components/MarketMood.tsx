"use client";

import { useEffect, useState } from "react";
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  type CompositeChartPoint,
  type ExchangeRate,
  type ForeignStocksResponse,
  type InterestRate,
} from "@/lib/api";
import {
  loadCompositeChart,
  loadExchangeRate,
  loadForeignStocks,
  loadInterestRate,
} from "@/lib/api/cache";
import type { MarketFactor, MarketWidget } from "@/lib/mock/market-mood";
import type { Sentimen } from "@/lib/mock/recaps";
import { cn } from "@/lib/utils";
import { SparklineChart } from "./SparklineChart";
import { GaugeChart } from "./GaugeChart";
import { ProgressBarChart } from "./ProgressBarChart";

interface MarketMoodProps {
  sentiment: Sentimen;
  sentimentLabel: string;
  summary: string;
  factors: MarketFactor[];
  widgets: MarketWidget[];
}

const sentimentConfig: Record<Sentimen, { label: string; bg: string; text: string; border: string; Icon: typeof TrendingUp }> = {
  positif: { label: "Positif", bg: "bg-bullish-soft", text: "text-bullish", border: "border-bullish-line", Icon: TrendingUp },
  netral: { label: "Netral", bg: "bg-mixed-soft", text: "text-mixed", border: "border-mixed-line", Icon: Minus },
  negatif: { label: "Negatif", bg: "bg-bearish-soft", text: "text-bearish", border: "border-bearish-line", Icon: TrendingDown },
};

const factorSentimentColors: Record<Sentimen, string> = {
  positif: "text-bullish",
  negatif: "text-bearish",
  netral: "text-mixed",
};

/** Format a rate number as Indonesian-style "5,75%". */
function formatRate(rate: number): string {
  return `${rate.toString().replace(".", ",")}%`;
}

/** Format a signed bps value as "+25 bps" / "-25 bps" / "0 bps". */
function formatBps(bps: number): string {
  if (bps === 0) return "0 bps";
  return `${bps > 0 ? "+" : ""}${bps} bps`;
}

/**
 * Map the rate change to a market-color badge:
 *   rate cut (bps < 0) → bullish (dovish, supportive of equities)
 *   rate hike (bps > 0) → bearish (hawkish, headwind for equities)
 *   unchanged (bps = 0) → mixed
 */
function bpsBadge(bps: number): NonNullable<MarketWidget["staticBadge"]> {
  if (bps < 0) return "bullish";
  if (bps > 0) return "bearish";
  return "mixed";
}

/**
 * Replace the `bi-rate` widget in the list with live data from the API.
 * The mock widget is kept as a fallback until the fetch resolves, and
 * stays in place if the request fails (auth, network, etc.).
 */
function mergeBiRate(
  widgets: MarketWidget[],
  biRate: InterestRate | null,
): MarketWidget[] {
  if (!biRate) return widgets;
  return widgets.map((w) =>
    w.id === "bi-rate"
      ? {
          ...w,
          value: formatRate(biRate.rate),
          staticSubLabel: formatBps(biRate.bps),
          staticBadge: bpsBadge(biRate.bps),
        }
      : w,
  );
}

/**
 * Format an exchange-rate value (IDR per unit of foreign currency) as
 * Indonesian-locale with no decimals, matching the existing `USD/IDR`
 * mock display style ("16.320", "17.950", etc.). The value is rounded
 * to a whole number since exchange rates are typically shown without
 * fractional rupiah in the strip.
 */
function formatIdrRate(value: number): string {
  return Math.round(value).toLocaleString("id-ID");
}

/**
 * Replace the `usd-idr` widget with the live USD rate from the exchange
 * snapshot. The mock widget stays in place until the fetch resolves and
 * on any error (auth, network, missing key in the response, etc.).
 */
function mergeUsdIdr(
  widgets: MarketWidget[],
  exchangeRate: ExchangeRate | null,
): MarketWidget[] {
  if (!exchangeRate) return widgets;
  const usd = exchangeRate.USD;
  if (typeof usd !== "number") return widgets;
  return widgets.map((w) =>
    w.id === "usd-idr"
      ? { ...w, value: formatIdrRate(usd) }
      : w,
  );
}

/**
 * Compact IDR formatter with Indonesian suffix scale.
 *
 * Used for large monetary values that don't fit in a widget cell at full
 * precision. Picks the largest unit that keeps the leading number below
 * 1000, then appends the matching suffix:
 *
 *   | 1.000           → "1,0 rb"   (ribu / thousand)
 *   | 1.000.000       → "1,0 jt"   (juta / million)
 *   | 1.000.000.000   → "1,0 M"    (miliar / billion)
 *   | 1.000.000.000.000 → "1,0 T"  (triliun / trillion)
 *   | 10^15+         → "1,0 Kd"   (kuadriliun / quadrillion)
 *
 * Decimal separator is `,` (Indonesian locale). One decimal place —
 * enough for visual precision in a 12-17px widget, not so much that
 * the digits overflow the cell. Sign prefix: `+` for positive, `-` for
 * negative, nothing for zero.
 */
function formatCompactIdr(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : value > 0 ? "+" : "";

  const fmt = (divisor: number, suffix: string): string =>
    `${sign}${(abs / divisor).toFixed(1).replace(".", ",")}${suffix}`;

  if (abs >= 1e15) return fmt(1e15, "Kd");
  if (abs >= 1e12) return fmt(1e12, "T");
  if (abs >= 1e9) return fmt(1e9, "M");
  if (abs >= 1e6) return fmt(1e6, "jt");
  if (abs >= 1e3) return fmt(1e3, "rb");
  return `${sign}${abs}`;
}

/**
 * Compute the bar position (0–100, where 100 = fully buy, 0 = fully sell)
 * from the absolute buy and sell volumes. Returns `undefined` when either
 * volume is missing or both are zero (avoids division by zero).
 */
function buyRatioPercent(buyVolume: number, sellVolume: number): number | undefined {
  const total = buyVolume + sellVolume;
  if (total <= 0) return undefined;
  return Math.round((buyVolume / total) * 100);
}

/**
 * `true` when the summary has no meaningful flow to display — either
 * the snapshot hasn't loaded (`null`) or the buy/sell/net values are
 * all zero (no trading activity). In either case the widget should
 * show `'-'` instead of a formatted number that would read as "+0,0 rb"
 * or hide the fact that nothing happened.
 */
function isEmptyForeignFlow(
  flow: ForeignStocksResponse | null,
): boolean {
  if (!flow) return true;
  const s = flow.summary;
  return s.buy_value === 0 && s.sell_value === 0 && s.net_value === 0;
}

/**
 * Replace the `foreign-flow` widget with live data from the
 * `/stocks/foreign-stocks` summary row. Updates both `value` (formatted
 * net_value) and `barValue` (buy-volume ratio, used by the progress
 * bar to indicate the buy/sell balance visually).
 *
 * Falls back to `'-'` when the snapshot is missing or has no flow to
 * display (all zero). The mock widget's other fields (`label`, `type`,
 * `barLeftLabel`, `barRightLabel`, etc.) are preserved either way.
 */
function mergeForeignFlow(
  widgets: MarketWidget[],
  foreignFlow: ForeignStocksResponse | null,
): MarketWidget[] {
  return widgets.map((w) => {
    if (w.id !== "foreign-flow") return w;
    if (isEmptyForeignFlow(foreignFlow)) {
      return { ...w, value: "-", barValue: undefined };
    }
    const s = foreignFlow!.summary;
    const barValue = buyRatioPercent(s.buy_volume, s.sell_volume);
    return {
      ...w,
      value: formatCompactIdr(s.net_value),
      ...(barValue !== undefined ? { barValue } : {}),
    };
  });
}

/**
 * Format a composite-chart `price` as Indonesian-locale with two
 * decimal places, matching the existing IHSG mock display style
 * ("7.245,50", "608,42", etc.).
 */
function formatIhsgPrice(price: number): string {
  return price.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Replace the `ihsg` widget's `value` with the price from the **last**
 * data point of the composite-chart series. The widget's other fields
 * (`changePercent`, `sparklineData`, `label`, etc.) are preserved from
 * the mock — the sparkline keeps its deterministic mock shape for now.
 *
 * Falls back to the mock value when the chart is missing or empty.
 */
function mergeIhsg(
  widgets: MarketWidget[],
  chart: CompositeChartPoint[] | null,
): MarketWidget[] {
  if (!chart || chart.length === 0) return widgets;
  const last = chart[chart.length - 1];
  return widgets.map((w) =>
    w.id === "ihsg"
      ? { ...w, value: formatIhsgPrice(last.price) }
      : w,
  );
}

export function MarketMood({
  sentiment,
  sentimentLabel,
  summary,
  factors,
  widgets,
}: MarketMoodProps) {
  const sc = sentimentConfig[sentiment];
  const Icon = sc.Icon;
  const topFactors = factors.slice(0, 3);

  // Live BI Rate for the bi-rate widget. Null = not yet loaded or failed
  // (in which case the mock widget stays put as the fallback).
  const [biRate, setBiRate] = useState<InterestRate | null>(null);
  // Live exchange-rate snapshot for the usd-idr widget. Null = not yet
  // loaded or failed (mock widget stays as the fallback).
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  // Live foreign-flow snapshot for the foreign-flow widget. Null = not
  // yet loaded or failed (mock widget stays as the fallback).
  const [foreignFlow, setForeignFlow] = useState<ForeignStocksResponse | null>(null);
  // Live composite-chart series for the IHSG widget. Null = not yet
  // loaded or failed (mock widget stays as the fallback).
  const [compositeChart, setCompositeChart] = useState<CompositeChartPoint[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadInterestRate()
      .then((data) => {
        if (!cancelled) setBiRate(data);
      })
      .catch(() => {
        // Swallow — the mock bi-rate widget is the fallback.
      });
    void loadExchangeRate()
      .then((res) => {
        // Response is wrapped in `{ data: [snapshot] }`; the snapshot is
        // a single object keyed by currency code.
        const snapshot = res.data[0];
        if (!cancelled) setExchangeRate(snapshot ?? null);
      })
      .catch(() => {
        // Swallow — the mock usd-idr widget is the fallback.
      });
    void loadForeignStocks()
      .then((data) => {
        if (!cancelled) setForeignFlow(data);
      })
      .catch(() => {
        // Swallow — the mock foreign-flow widget is the fallback.
      });
    void loadCompositeChart()
      .then((data) => {
        if (!cancelled) setCompositeChart(data);
      })
      .catch(() => {
        // Swallow — the mock IHSG widget stays as the fallback.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Compose all four merges. Each function is a no-op when its data
  // source is null, and each only mutates the widget it owns — so
  // order is safe and any source can land first.
  const effectiveWidgets = mergeIhsg(
    mergeBiRate(
      mergeForeignFlow(mergeUsdIdr(widgets, exchangeRate), foreignFlow),
      biRate,
    ),
    compositeChart,
  );

  return (
    <section
      className="overflow-hidden rounded-lg border border-border bg-bg-secondary"
      aria-label="Market mood IHSG"
    >
      <div className="flex flex-col divide-y divide-border lg:flex-row lg:divide-x lg:divide-y-0">
        {/* Left: title + sentiment badge — narrow column on desktop */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-bg-tertiary px-3 py-1.5 lg:w-[200px] lg:border-b-0 lg:py-2.5">
          <div className="flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-brand" aria-hidden />
            <span className="label">Market Mood</span>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-widest",
              sc.bg, sc.text, sc.border, "border",
            )}
          >
            <Icon className="h-2.5 w-2.5" aria-hidden />
            {sentimentLabel}
          </span>
        </div>

        {/* 4 compact widget cells */}
        <div className="grid flex-1 grid-cols-2 divide-x divide-y divide-border md:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
          {effectiveWidgets.map((w) => (
            <CompactWidgetCell key={w.id} widget={w} />
          ))}
        </div>
      </div>

      {/* Single-line summary + top factors */}
      <div className="border-t border-border bg-bg-tertiary px-3 py-1.5">
        <p className="text-[11.5px] leading-[1.5] text-text-secondary">
          {summary}{" "}
          <span className="hidden sm:inline">
            {topFactors.map((f, i) => (
              <span key={f.label} className="whitespace-nowrap">
                <span className={cn("font-mono font-semibold", factorSentimentColors[f.sentiment])}>
                  {f.label} {f.value}
                </span>
                {i < topFactors.length - 1 ? " · " : ""}
              </span>
            ))}
          </span>
        </p>
      </div>
    </section>
  );
}

function CompactWidgetCell({ widget }: { widget: MarketWidget }) {
  const positive = widget.changePercent >= 0;
  const trendPositive = widget.type === "sparkline" ? positive : true;

  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 lg:gap-3 lg:px-3">
      {/* Label column — narrow */}
      <div className="flex min-w-[60px] shrink-0 flex-col gap-0.5">
        <span className="label text-[9px]">{widget.label}</span>
        <div className="flex items-baseline gap-1">
          <p className="font-mono text-[15px] font-bold leading-none tracking-tight text-text-primary num-tabular lg:text-[17px]">
            {widget.value}
          </p>
        </div>
        {widget.type === "sparkline" ? (
          <span
            className={cn(
              "font-mono text-[9.5px] font-semibold leading-none num-tabular",
              positive ? "text-bullish" : "text-bearish",
            )}
          >
            {positive ? "▲ +" : "▼ "}
            {Math.abs(widget.changePercent).toFixed(2)}%
          </span>
        ) : widget.type === "gauge" ? (
          <span className="font-mono text-[9.5px] font-semibold leading-none text-text-muted">
            {widget.gaugeLabel}
          </span>
        ) : widget.type === "static" ? (
          <span
            className={cn(
              "font-mono text-[9.5px] font-semibold leading-none",
              widget.staticBadge === "bullish" && "text-bullish",
              widget.staticBadge === "bearish" && "text-bearish",
              widget.staticBadge === "mixed" && "text-mixed",
              !widget.staticBadge && "text-text-muted",
            )}
          >
            {widget.staticSubLabel}
          </span>
        ) : (
          <span className="font-mono text-[9.5px] font-semibold leading-none text-text-muted">
            Harian
          </span>
        )}
      </div>

      {/* Visualization column — fills the rest */}
      <div className="flex-1 min-w-0">
        {widget.type === "sparkline" && widget.sparklineData && (
          <SparklineChart
            data={widget.sparklineData}
            positive={trendPositive}
            height={24}
            showArea
            showDots
          />
        )}
        {widget.type === "gauge" && widget.gaugeValue !== undefined && (
          <GaugeChart value={widget.gaugeValue} />
        )}
        {widget.type === "bar" && widget.barValue !== undefined && (
          <ProgressBarChart
            value={widget.barValue}
            leftLabel={widget.barLeftLabel}
            rightLabel={widget.barRightLabel}
            compact
          />
        )}
        {widget.type === "static" && (
          <div className="flex h-[24px] items-center justify-end gap-1.5 pr-0.5">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded border px-1 py-px font-mono text-[8.5px] font-semibold uppercase tracking-widest opacity-80",
                widget.staticBadge === "bullish" && "border-bullish-line text-bullish",
                widget.staticBadge === "bearish" && "border-bearish-line text-bearish",
                widget.staticBadge === "mixed" && "border-mixed-line text-mixed",
                !widget.staticBadge && "border-border text-text-muted",
              )}
            >
              <span className="h-1 w-1 rounded-full bg-current" aria-hidden />
              {widget.staticSubLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

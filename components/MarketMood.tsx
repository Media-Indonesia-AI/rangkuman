"use client";

import { Activity, Minus, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { useMarketMoodData } from "@/lib/hooks/useMarketMoodData";
import type { MarketFactor, MarketWidget } from "@/lib/mock/market-mood";
import type { Sentimen } from "@/lib/mock/recaps";
import { cn } from "@/lib/utils";
import { MarketMoodCell } from "./MarketMoodCell";
import {
  mergeBiRate,
  mergeForeignFlow,
  mergeIhsg,
  mergeUsdIdr,
} from "./MarketMoodMerge";

interface MarketMoodProps {
  sentiment: Sentimen;
  sentimentLabel: string;
  summary: string;
  factors: MarketFactor[];
  widgets: MarketWidget[];
}

const sentimentConfig: Record<
  Sentimen,
  { label: string; bg: string; text: string; border: string; Icon: LucideIcon }
> = {
  positif: {
    label: "Positif",
    bg: "bg-bullish-soft",
    text: "text-bullish",
    border: "border-bullish-line",
    Icon: TrendingUp,
  },
  netral: {
    label: "Netral",
    bg: "bg-mixed-soft",
    text: "text-mixed",
    border: "border-mixed-line",
    Icon: Minus,
  },
  negatif: {
    label: "Negatif",
    bg: "bg-bearish-soft",
    text: "text-bearish",
    border: "border-bearish-line",
    Icon: TrendingDown,
  },
};

const factorSentimentColors: Record<Sentimen, string> = {
  positif: "text-bullish",
  negatif: "text-bearish",
  netral: "text-mixed",
};

/**
 * Market Mood strip — header (label + sentiment badge), 6-up widget
 * grid, and a single-line summary footer. Four of the six cells
 * (BI Rate, USD/IDR, Foreign Flow, IHSG) are driven by live data;
 * the others stay on their mock values. Live-data widgets render a
 * shimmer placeholder until their backing fetch resolves.
 *
 * The orchestrator is intentionally thin: data fetching lives in
 * `useMarketMoodData`, format helpers in `lib/util/formatNumber.ts`,
 * widget merges in `MarketMoodMerge.ts`, and cell rendering in
 * `MarketMoodCell.tsx`. This file only wires them together.
 */
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

  const { biRate, exchangeRate, foreignFlow, compositeChart, isLoading } =
    useMarketMoodData();

  // Compose the four live-data merges. Each function only mutates the
  // widget it owns and is a no-op when its data source is null, so
  // order is safe and any source can land first.
  const effectiveWidgets = mergeIhsg(
    mergeBiRate(
      mergeForeignFlow(
        mergeUsdIdr(widgets, exchangeRate, isLoading.exchangeRate),
        foreignFlow,
        isLoading.foreignFlow,
      ),
      biRate,
      isLoading.biRate,
    ),
    compositeChart,
    isLoading.compositeChart,
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
              sc.bg,
              sc.text,
              sc.border,
              "border",
            )}
          >
            <Icon className="h-2.5 w-2.5" aria-hidden />
            {sentimentLabel}
          </span>
        </div>

        {/* Widget cells */}
        <div className="grid flex-1 grid-cols-2 divide-x divide-y divide-border md:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
          {effectiveWidgets.map((w) => (
            <MarketMoodCell key={w.id} widget={w} />
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
                <span
                  className={cn(
                    "font-mono font-semibold",
                    factorSentimentColors[f.sentiment],
                  )}
                >
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
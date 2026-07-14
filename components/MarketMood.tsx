"use client";

import { Activity } from "lucide-react";
import {
  factorSentimentColors,
  labelToSentiment,
  sentimentConfig,
} from "@/lib/api";
import { useMarketMoodData } from "@/lib/hooks/useMarketMoodData";
import type { MarketFactor, MarketWidget } from "@/lib/mock/market-mood";
import type { Sentimen } from "@/lib/mock/recaps";
import {
  formatBps,
  formatCompactIdr,
  formatIdrRate,
  formatRate,
  isEmptyForeignFlow,
} from "@/lib/util/formatNumber";
import { cn } from "@/lib/utils";
import { MarketMoodCell } from "./MarketMoodCell";
import {
  mergeBiRate,
  mergeForeignFlow,
  mergeIhsg,
  mergeUsdIdr,
} from "./MarketMoodMerge";

interface MarketMoodProps {
  widgets: MarketWidget[];
}

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
  widgets,
}: MarketMoodProps) {
  const { biRate, exchangeRate, foreignFlow, compositeChart, mood, isLoading } =
    useMarketMoodData();

  // Drive the badge styling off the API's label band. While the
  // snapshot is still in flight or after a fetch error, fall back to
  // the neutral bucket so the badge renders with a stable style
  // instead of flashing empty/styled.
  const sentiment: Sentimen = mood
    ? labelToSentiment[mood.label]
    : "netral";
  const sc = sentimentConfig[sentiment];
  const Icon = sc.Icon;

  // Build the three "top factors" pills (BI Rate → USD/IDR → Foreign
  // Flow) from the live data sources. Each source contributes at
  // most one factor; sources whose data hasn't landed yet (or that
  // came back empty) are skipped — better to show fewer accurate
  // values than stale mock fallbacks. Sentiment for each follows the
  // market-color convention used elsewhere in the strip (rate hike =
  // bearish, IDR weakening = bearish, net sell = bearish).
  const topFactors: MarketFactor[] = [];

  if (biRate) {
    const biSentiment: Sentimen =
      biRate.bps > 0 ? "negatif" : biRate.bps < 0 ? "positif" : "netral";
    topFactors.push({
      label: "BI Rate",
      value: formatRate(biRate.rate),
      change: formatBps(biRate.bps),
      sentiment: biSentiment,
    });
  }

  if (exchangeRate && exchangeRate.data.length > 0) {
    const last = exchangeRate.data[exchangeRate.data.length - 1];
    const first = exchangeRate.data[0];
    const pctChange =
      first.rate !== 0 ? ((last.rate - first.rate) / first.rate) * 100 : 0;
    const fxSentiment: Sentimen =
      pctChange > 0 ? "negatif" : pctChange < 0 ? "positif" : "netral";
    const sign = pctChange >= 0 ? "+" : "";
    topFactors.push({
      label: "USD/IDR",
      value: `Rp ${formatIdrRate(first.rate)}`,
      change: `${sign}${pctChange.toFixed(2).replace(".", ",")}%`,
      sentiment: fxSentiment,
    });
  }

  if (foreignFlow && !isEmptyForeignFlow(foreignFlow)) {
    const net = foreignFlow.summary.net_value;
    const flowSentiment: Sentimen =
      net < 0 ? "negatif" : net > 0 ? "positif" : "netral";
    topFactors.push({
      label: "Foreign Flow",
      value:
        net < 0 ? "Net sell" : net > 0 ? "Net buy" : "Netral",
      change: `Rp ${formatCompactIdr(net)}`,
      sentiment: flowSentiment,
    });
  }

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
            {mood?.label ?? ''}
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
          {mood?.narrative ?? ''}{" "}
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
"use client";

import { Activity } from "lucide-react";
import {
  labelToSentiment,
  sentimentConfig,
} from "@/lib/api";
import { useMarketMoodData } from "@/lib/hooks/useMarketMoodData";
import type { Sentimen } from "@/lib/recap";
import { cn } from "@/lib/utils";
import { MarketMoodCell } from "./MarketMoodCell";
import {
  buildBiRateWidget,
  buildFearGreedWidget,
  buildForeignFlowWidget,
  buildIhsgWidget,
  buildUsdIdrWidget,
  type MarketWidget,
} from "./MarketMoodMerge";

/**
 * Market Mood strip — header (label + sentiment badge), 5-up widget
 * grid, and a single-line summary footer. Five cells (BI Rate, USD/IDR,
 * Foreign Flow, IHSG, Sentimen Investor) are all derived live from the
 * `useMarketMoodData` hook — no `widgets` prop, no mock fallback.
 * Each cell renders a shimmer placeholder while its backing fetch is
 * in flight, then formats the live data once it lands.
 *
 * The orchestrator is intentionally thin: data fetching lives in
 * `useMarketMoodData`, format helpers in `lib/util/formatNumber.ts`,
 * widget builders in `MarketMoodMerge.ts`, and cell rendering in
 * `MarketMoodCell.tsx`. This file only wires them together.
 */
export function MarketMood() {
  const {
    biRate,
    exchangeRate,
    foreignFlow,
    foreignFlowDate,
    compositeChart,
    mood,
    isLoading,
  } = useMarketMoodData();

  // Drive the badge styling off the API's label band. While the
  // snapshot is still in flight or after a fetch error, fall back to
  // the neutral bucket so the badge renders with a stable style
  // instead of flashing empty/styled.
  const sentiment: Sentimen = mood
    ? labelToSentiment[mood.label]
    : "netral";
  const sc = sentimentConfig[sentiment];
  const Icon = sc.Icon;

  // Build the five widget cells purely from live data. Each builder
  // returns a complete widget (or placeholder values + `loading: true`
  // while the fetch is in flight). Order matches the strip's
  // left-to-right layout.
  //
  // Foreign Flow carries `foreignFlowDate` — the effective date the
  // cache wrapper actually got a 200 response for. That can differ
  // from "today" when the API shifted back a day on 503 (typical
  // before market close), so the widget sub-label tracks the data,
  // not the request — `<MarketMoodCell>` renders this in place of
  // the previous hardcoded `"Harian"`. `null` while the fetch is in
  // flight or after an error; the widget builder leaves the
  // sub-label undefined in that case so the cell falls back to
  // `"Harian"` instead of showing a misleading date.
  const widgets: MarketWidget[] = [
    buildIhsgWidget(compositeChart, isLoading.compositeChart),
    buildForeignFlowWidget(
      foreignFlow,
      isLoading.foreignFlow,
      foreignFlowDate,
    ),
    buildUsdIdrWidget(exchangeRate, mood, isLoading.exchangeRate),
    buildBiRateWidget(biRate, isLoading.biRate),
    buildFearGreedWidget(mood, false),
  ];

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
        <div className="grid flex-1 grid-cols-2 divide-x divide-y divide-border md:grid-cols-3 lg:grid-cols-5 lg:divide-y-0">
          {widgets.map((w) => (
            <MarketMoodCell key={w.id} widget={w} />
          ))}
        </div>
      </div>

      {/* Single-line summary + top factors */}
      <div className="border-t border-border bg-bg-tertiary px-3 py-1.5">
        <p className="text-[11.5px] leading-[1.5] text-text-secondary">
          {mood?.narrative ?? ''}{" "}
        </p>
      </div>
    </section>
  );
}
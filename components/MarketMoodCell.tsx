"use client";

import { cn } from "@/lib/utils";
import type { MarketWidget } from "@/lib/mock/market-mood";
import { GaugeChart } from "./GaugeChart";
import { ProgressBarChart } from "./ProgressBarChart";
import { Shimmer } from "./Shimmer";
import { SparklineChart } from "./SparklineChart";

interface MarketMoodCellProps {
  widget: MarketWidget;
}

/**
 * One cell in the Market Mood strip's 6-up widget grid. Renders:
 *   - left column:  static label (always) + value (or shimmer) +
 *                  sub-label / arrow row (or shimmer)
 *   - right column: sparkline / gauge / bar / static badge (or shimmer)
 *
 * Three shimmer slots fire whenever `widget.loading === true`, each
 * sized to match the real content slot:
 *
 *   - value text           → `h-4 w-16 lg:h-5 lg:w-20`
 *   - sub-label / arrow row → `h-2 w-12`
 *   - visualization column → `h-6 w-full`
 *
 * The label itself stays visible during loading — it's static across
 * all data states and keeping it stable avoids layout shift.
 */
export function MarketMoodCell({ widget }: MarketMoodCellProps) {
  const positive = widget.changePercent >= 0;
  const trendPositive = widget.type === "sparkline" ? positive : true;

  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 lg:gap-3 lg:px-3">
      {/* Label column — narrow */}
      <div className="flex min-w-[60px] shrink-0 flex-col gap-0.5">
        <span className="label text-[9px]">{widget.label}</span>
        <div className="flex items-baseline gap-1">
          {widget.loading ? (
            <Shimmer className="h-4 w-16 lg:h-5 lg:w-20" />
          ) : (
            <p className="font-mono text-[15px] font-bold leading-none tracking-tight text-text-primary num-tabular lg:text-[17px]">
              {widget.value}
            </p>
          )}
        </div>
        {widget.loading ? (
          <Shimmer className="h-2 w-12" />
        ) : widget.type === "sparkline" ? (
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
        ) : widget.type === "bar" && widget.staticSubLabel ? (
          // `bar` widgets reuse the `staticSubLabel` slot to
          // surface per-widget context — e.g. Foreign Flow shows
          // the date the caller asked `/stocks/foreign-stocks`
          // for. Renders muted (no sentiment badge), same slot as
          // the previous hardcoded `"Harian"` so the cell layout
          // stays stable. Falls through to `"Harian"` below when
          // the builder didn't supply a label.
          <span className="font-mono text-[9.5px] font-semibold leading-none text-text-muted">
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
        {widget.loading ? (
          <Shimmer className="h-6 w-full" />
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
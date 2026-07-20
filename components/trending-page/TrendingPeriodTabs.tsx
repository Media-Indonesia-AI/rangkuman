"use client";

import { periodLabel, type TrendingPeriod } from "@/lib/mock/trending";
import { cn } from "@/lib/utils";

interface TrendingPeriodTabsProps {
  /** Currently selected period (controlled). */
  active: TrendingPeriod;
  /** Fired when a tab is clicked. */
  onChange: (period: TrendingPeriod) => void;
  /** Tab order to render. Defaults to today / week / month. */
  tabs?: TrendingPeriod[];
}

/**
 * Period filter pills — the segmented switcher that picks
 * which `TrendingPeriod` slice drives the rest of the page.
 *
 * Uncontrolled in the sense that it doesn't fetch — the parent
 * owns the period state and rerenders on `onChange`. Keeping the
 * state in the orchestrator lets the stat strip, the list, and
 * any future widgets read the same `active` value without
 * prop-drilling through this component.
 */
export function TrendingPeriodTabs({
  active,
  onChange,
  tabs = ["today", "week", "month"] as const,
}: TrendingPeriodTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter periode"
      className="mb-4 inline-flex items-center gap-1 rounded-md border border-border bg-bg-secondary p-1"
    >
      {tabs.map((p) => (
        <button
          key={p}
          type="button"
          role="tab"
          aria-selected={active === p}
          onClick={() => onChange(p)}
          className={cn(
            "rounded px-3 py-1.5 text-[12.5px] font-medium transition-colors",
            active === p
              ? "bg-bg-tertiary text-text-primary"
              : "text-text-muted hover:text-text-primary",
          )}
        >
          {periodLabel[p]}
        </button>
      ))}
    </div>
  );
}

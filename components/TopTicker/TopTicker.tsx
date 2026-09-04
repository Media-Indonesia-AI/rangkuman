"use client";

/**
 * Sticky horizontal price ticker. Renders one row per
 * `TickerRow` (stock or crypto) — the rows a visitor sees depend
 * on the `label` prop:
 *
 *   - `"saham"`           → only stocks
 *   - `"crypto"`          → only crypto
 *   - anything else       → first 10 stocks + first 10 crypto,
 *                           then Fisher–Yates shuffled together
 *                           so the marquee interleaves both
 *
 * Render branches (driven by `useTopTickerRows`):
 *   1. feed still in flight → renders `null` (no strip, no header)
 *      so the bar doesn't pop in half-empty or flash a mock list
 *      while the request is still resolving
 *   2. data is ready        → the populated marquee, wrapped in
 *      the `animate-fade-up` keyframe so the section fades +
 *      slides in over 280ms when it first mounts (defined in
 *      `tailwind.config.ts` under `animation.fade-up`). The
 *      marquee chrome lives in `<Marquee />`; the per-row cell in
 *      `<TickerRowView />`.
 *
 * Pure CSS marquee (no JS animation) with duplicated content for
 * seamless loop. The row-resolution lives in `useTopTickerRows`.
 *
 * `label` wins when both are set so the new prop drives dispatch;
 * `variant` only seeds the default when `label` is omitted
 * (existing call sites that only pass `variant` keep working).
 */
import { Marquee } from "./Marquee";
import { useTopTickerRows } from "./useTopTickerRows";
import { ariaLabelFor, resolveEffectiveLabel } from "./tickerData";
import type { TopTickerLabel, TopTickerVariant } from "./types";

interface TopTickerProps {
  variant?: TopTickerVariant;
  label?: TopTickerLabel;
}

export function TopTicker({ variant = "stocks", label }: TopTickerProps) {
  const effectiveLabel = resolveEffectiveLabel(label, variant);
  const ariaLabel = ariaLabelFor(effectiveLabel);
  const { rows, isLoading } = useTopTickerRows(effectiveLabel);

  // Render nothing while the relevant feed(s) are still in
  // flight — no shimmer, no header — so the bar appears all at
  // once with data rather than swapping a skeleton out for the
  // real content. The `animate-fade-up` wrapper on the populated
  // branch handles the "smooth appearance" once data lands.
  if (isLoading) {
    return null;
  }

  return (
    // `fade-up` keyframe: opacity 0 → 1, translateY(6px) → 0,
    // 280ms ease-out, `both` so the starting state holds before
    // the animation runs (no flash of fully-opaque content).
    <div className="animate-fade-up">
      <Marquee rows={rows} ariaLabel={ariaLabel} />
    </div>
  );
}

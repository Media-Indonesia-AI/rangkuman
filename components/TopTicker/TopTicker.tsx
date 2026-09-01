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
 * Pure CSS marquee (no JS animation) with duplicated content for
 * seamless loop. The row-resolution lives in `useTopTickerRows`;
 * the marquee chrome in `<Marquee />`; the per-row cell in
 * `<TickerRowView />`.
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
  const rows = useTopTickerRows(effectiveLabel);
  return <Marquee rows={rows} ariaLabel={ariaLabel} />;
}

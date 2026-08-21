/**
 * Numeric formatters used by the Market Mood strip and other UI surfaces
 * that show Indonesian-style monetary / rate values. All functions are
 * pure (no React, no I/O) so they can be unit-tested in isolation and
 * reused from anywhere.
 *
 * Conventions:
 *   - Decimal separator is `,` (Indonesian locale)
 *   - Thousands separator is `.` (also Indonesian locale)
 *   - Currency amounts are in IDR
 *   - Percentages are stored as decimal * 100 on the wire (e.g. 5.75
 *     for "5,75%")
 */

import type { ForeignStocksResponse } from "@/lib/api";
import type { MarketWidget } from "@/components/MarketMoodMerge";

/**
 * Format a percent rate as Indonesian-style `"5,75%"`.
 * Single decimal conversion only — does not localize thousands.
 */
export function formatRate(rate: number): string {
  return `${rate.toString().replace(".", ",")}%`;
}

/**
 * Format a signed bps value as `"+25 bps"` / `"-25 bps"` / `"0 bps"`.
 * The `+` is omitted on negative values; `0` gets no sign.
 */
export function formatBps(bps: number): string {
  if (bps === 0) return "0 bps";
  return `${bps > 0 ? "+" : ""}${bps} bps`;
}

/**
 * Map the rate-change direction to a market-color badge:
 *   - rate cut (bps < 0) → `"bullish"` (dovish, supportive of equities)
 *   - rate hike (bps > 0) → `"bearish"` (hawkish, headwind for equities)
 *   - unchanged (bps = 0) → `"mixed"`
 *
 * Used by `mergeBiRate` in `components/MarketMoodMerge.ts`.
 */
export function bpsBadge(
  bps: number,
): NonNullable<MarketWidget["staticBadge"]> {
  if (bps < 0) return "bullish";
  if (bps > 0) return "bearish";
  return "mixed";
}

/**
 * Round an exchange-rate value and format as Indonesian-locale int.
 * Matches the existing USD/IDR mock style ("16.320", "17.950").
 */
export function formatIdrRate(value: number): string {
  return Math.round(value).toLocaleString("id-ID");
}

/**
 * Compact IDR formatter with Indonesian suffix scale. Picks the
 * largest unit that keeps the leading number below 1000:
 *
 *   | 1.000                  → "1,0 rb"   (ribu / thousand)
 *   | 1.000.000              → "1,0 jt"   (juta / million)
 *   | 1.000.000.000          → "1,0 M"    (miliar / billion)
 *   | 1.000.000.000.000      → "1,0 T"    (triliun / trillion)
 *   | ≥ 10^15                → "1,0 Kd"   (kuadriliun / quadrillion)
 *
 * Decimal separator is `,` (Indonesian locale). One decimal place —
 * enough for visual precision in a 12–17px widget, not so much that
 * the digits overflow the cell. Sign prefix: `+` for positive,
 * `-` for negative, nothing for zero.
 */
export function formatCompactIdr(value: number): string {
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
 * Format a composite-chart `price` as Indonesian-locale with two
 * decimal places, matching the existing IHSG mock display style
 * ("7.245,50", "608,42", etc.).
 */
export function formatIhsgPrice(price: number): string {
  return price.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Compute the bar position (0–100, where 100 = fully buy, 0 = fully
 * sell) from the absolute buy and sell volumes. Returns `undefined`
 * when either volume is missing or both are zero (avoids division by
 * zero).
 */
export function buyRatioPercent(
  buyVolume: number,
  sellVolume: number,
): number | undefined {
  const total = buyVolume + sellVolume;
  if (total <= 0) return undefined;
  return Math.round((buyVolume / total) * 100);
}

/**
 * `true` when the foreign-flow summary has no meaningful flow to
 * display — either the snapshot hasn't loaded (`null`) or the
 * buy/sell/net values are all zero (no trading activity). In either
 * case the widget should show `'-'` instead of a formatted number
 * that would read as "+0,0 rb" or hide the fact that nothing
 * happened.
 */
export function isEmptyForeignFlow(
  flow: ForeignStocksResponse | null,
): boolean {
  if (!flow) return true;
  const s = flow.summary;
  return s.buy_value === 0 && s.sell_value === 0 && s.net_value === 0;
}
/**
 * Compact USD formatter — collapses to `$X.XB` / `$X.XT` for the
 * volume / market-cap blurbs in `<CategoryCardHeader />` and
 * `<CategoryCardBody />` so the header strip stays a single line.
 * Falls back to `$X` below a million.
 */
export function formatUsd(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toFixed(0)}`;
}

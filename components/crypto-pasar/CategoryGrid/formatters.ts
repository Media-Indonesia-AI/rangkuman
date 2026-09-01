/**
 * Compact USD formatter — collapses to `$X.XB` / `$X.XT` for the
 * volume / market-cap blurbs in `<CategoryListItem />`'s header
 * strip so both metrics fit on one row. Falls back to `$X` below
 * a million.
 */
export function formatUsd(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toFixed(0)}`;
}

/**
 * Signed percent formatter for a 24h price change. Prepends a
 * `+` for positives so up moves and flat moves read distinctly
 * (negatives carry the sign for free from `toFixed`). Matches the
 * format `<TopMoverCard />` already uses for its mover grid.
 */
export function formatPriceChange(change: number): string {
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}

/** Tailwind tone class for a signed percent — `text-bullish` on
 *  up moves, `text-bearish` on down moves, `text-text-muted` when
 *  the move is exactly zero so flat rows don't get tinted as
 *  either side of the sentiment pair. Pairs with the
 *  `text-bullish` / `text-bearish` semantic tokens
 *  `<KeyDataBlock />` and `<TopMoverCard />` use. */
export function priceChangeTone(change: number): string {
  if (change > 0) return "text-bullish";
  if (change < 0) return "text-bearish";
  return "text-text-muted";
}

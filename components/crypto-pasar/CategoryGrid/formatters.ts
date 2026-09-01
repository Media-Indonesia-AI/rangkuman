/**
 * Full USD formatter for aggregate metrics (24h volume, market
 * cap) in `<CategoryListItem />`'s header strip. Renders the
 * raw number with `en-US` thousand grouping and no decimals so
 * the magnitude reads exactly (no `T` / `B` / `M` suffix). The
 * `formatPrice` helper still handles per-coin prices, which
 * collapse to a small handful of decimals — this one stays
 * uncompressed on purpose so aggregate market metrics stay
 * accurate enough for editorial comparison.
 */
export function formatFullUsd(value: number): string {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
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

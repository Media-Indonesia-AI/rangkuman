/**
 * Format a USD coin price for display: ≥1000 → en-US grouping
 * (no decimals), ≥1 → 2 decimals, else 4 decimals.
 *
 * Local copy keeps the `$` prefix that this section's cards
 * render inline; `cryptoFormatters.formatPrice` intentionally
 * omits the prefix so callers can pick their own unit symbol.
 */
export function formatPrice(price: number): string {
  if (price >= 1000) {
    return `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
  if (price >= 1) {
    return `$${price.toFixed(2)}`;
  }
  return `$${price.toFixed(4)}`;
}

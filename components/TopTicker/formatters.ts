/**
 * Price formatters for the `TopTicker` widget.
 *
 * Stocks use the ID locale (idr-style thousands separator); crypto
 * ships USD always (`$` prefix). Crypto picks precision by bucket so
 * sub-$0.01 coins don't round to `"$0"` — important when the marquee
 * scrolls past quickly and the reader only gets one glance.
 */

/** Format an IDR stock price: thousands separator, no decimals. */
export function formatStockPrice(value: number): string {
  if (value >= 1000) {
    return value.toLocaleString("id-ID");
  }
  return String(value);
}

/** Format a USD coin price: always `$`, precision by bucket. */
export function formatCoinPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  if (price >= 1) {
    return price.toFixed(2);
  }
  if (price >= 0.01) {
    return price.toFixed(3);
  }
  return price.toFixed(4);
}

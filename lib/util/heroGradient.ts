/**
 * Hero-strip gradient picker.
 *
 * Stock cards (`components/StockCard.tsx`) and the stock detail page
 * (`app/stock/[kode]/StockDetailPage.tsx`) both paint a small gradient
 * backdrop behind the ticker name. The original implementation looked
 * the gradient up by the stock's sector hue, but with mock data being
 * phased out there's no `Saham.hue` to key off anymore.
 *
 * This helper hashes the ticker code to a stable hue index. Each ticker
 * gets a distinct color, the same ticker always renders with the same
 * gradient, and SSR matches the client (no hydration mismatch).
 */

import { HUE_GRADIENT } from "@/lib/mock/stocks";

/**
 * Pick a hue-gradient class string for the given ticker code.
 * The result is one of the entries in `HUE_GRADIENT` (e.g.
 * `"from-sky-500/20 via-cyan-500/10 to-transparent"`).
 */
export function pickHeroGradient(kode: string): string {
  const keys = Object.keys(HUE_GRADIENT) as Array<keyof typeof HUE_GRADIENT>;
  let hash = 0;
  for (let i = 0; i < kode.length; i++) {
    hash = (hash * 31 + kode.charCodeAt(i)) >>> 0;
  }
  return HUE_GRADIENT[keys[hash % keys.length]];
}
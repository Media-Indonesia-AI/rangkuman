/**
 * Shared UI helpers for the `/crypto` page widgets.
 *
 * Kept in one tiny file so the three card components (Featured,
 * Story, CoinTicker) can share:
 *   - `formatPrice` — same coin price formatter (locale-aware
 *     digit grouping, variable decimals for sub-USD prices),
 *   - `HUE_BG` — Tailwind gradient class per `Coin["hue"]`, used
 *     by the ticker pill avatar.
 */

import type { Coin } from "@/lib/mock/crypto";

/** `Coin.hue` → Tailwind gradient classes for the ticker-pill
 *  avatar. Matches the hue keys already defined in
 *  `lib/mock/crypto.ts` (`Coin.hue`). */
export const HUE_BG: Record<Coin["hue"], string> = {
  amber: "from-amber-500/30 to-amber-700/10",
  emerald: "from-emerald-500/30 to-emerald-700/10",
  rose: "from-rose-500/30 to-rose-700/10",
  sky: "from-sky-500/30 to-sky-700/10",
  violet: "from-violet-500/30 to-violet-700/10",
  slate: "from-slate-500/30 to-slate-700/10",
};

/** Format a USD coin price for display: ≥1000 → en-US grouping
 *  (no decimals), ≥1 → 2 decimals, ≥0.01 → 3 decimals, else 4
 *  decimals. Matches the convention already used by `CryptoSection`
 *  and the existing `CoinPrice` summary widget. */
export function formatPrice(price: number): string {
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

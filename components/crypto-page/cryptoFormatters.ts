/**
 * Shared UI helpers + display types for the `/crypto` page widgets.
 *
 * Kept in one tiny file so the three card components (Featured,
 * Story, CoinTicker) can share:
 *   - `formatPrice` — same coin price formatter (locale-aware
 *     digit grouping, variable decimals for sub-USD prices),
 *   - `HUE_BG` — Tailwind gradient class per `Coin["hue"]`, used
 *     by the ticker pill avatar,
 *   - `CoinHue` / `Coin` — local display shapes for the pasar-tab
 *     cards. Lifted from the old `lib/mock/crypto.ts` mock so the
 *     cards keep their prop contract after the mock was retired;
 *     live data flows in via `useCoinTicker` and is mapped to
 *     this shape at the call site.
 */

/** Six-entry palette used by the ticker pill avatar. */
export type CoinHue =
  | "amber"
  | "emerald"
  | "rose"
  | "sky"
  | "violet"
  | "slate";

/** Display shape consumed by the pasar-tab `CoinTickerCard` (and
 *  the historical `TopTicker` crypto fallback). Mirrors the
 *  fields the widgets actually read; the wire `CoinTickerItem`
 *  doesn't ship `hue` (a design token), so callers derive it
 *  from the coin code via a deterministic mapper. */
export interface Coin {
  kode: string;
  nama: string;
  price: number;
  changePercent: number;
  hue: CoinHue;
}

/** `Coin.hue` → Tailwind gradient classes for the ticker-pill
 *  avatar. */
export const HUE_BG: Record<CoinHue, string> = {
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

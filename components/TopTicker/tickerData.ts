/**
 * Pure data transforms for `TopTicker` — entry mappers, the
 * cross-list shuffle, and the crypto recap-href lookup. No
 * React, no I/O — easy to unit-test in isolation.
 *
 * Entry mappers normalize the live wire shapes (stock ticker,
 * coin ticker) into one `TickerRow` so the render loop never
 * has to special-case the source.
 */
import { COIN_KODE_TO_STORY_ID } from "@/components/crypto-page/cryptoStories";
import type { TickerRow } from "./types";

/** Per-side row count for the combined branch (label undefined or
 *  non-`"saham"`/non-`"crypto"`). Each side contributes the first
 *  N rows from its source — no ranking, no per-source shuffle.
 *  The wire API's order (or the mock array's order) is what
 *  supplies the slice; the cross-list merge then shuffles the
 *  two top-N lists together. */
export const TOP_N_PER_SIDE = 10;

/** Resolve the actual label the component renders against.
 *  `label` wins when both are set; otherwise `variant` seeds the
 *  default. `undefined` (and any non-`"saham"`/non-`"crypto"` label)
 *  falls through to the combined branch. */
export function resolveEffectiveLabel(
  label: string | undefined,
  variant: "stocks" | "crypto" | "home",
): string | undefined {
  if (label) return label;
  if (variant === "crypto") return "crypto";
  if (variant === "home") return undefined;
  return "saham";
}

/** Screen-reader string for the marquee container. Mirrors the
 *  resolved label so the announced list matches what's visible. */
export function ariaLabelFor(label: string | undefined): string {
  if (label === "crypto") return "Harga crypto real-time";
  if (label === "saham") return "Harga saham real-time";
  return "Harga saham & crypto real-time";
}

/** Fisher–Yates shuffle. Pure / non-mutating — returns a new
 *  array. Used to interleave the stock and crypto top-N picks in
 *  the combined branch so the marquee doesn't read as "stocks
 *  then crypto".
 *
 *  Called only post-mount (inside a `useEffect`) so the server
 *  render and the client's first paint stay aligned — the lazy
 *  initializer produces the deterministic slice+concat that the
 *  SSR HTML carries. */
export function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Adapter: live stock ticker → TickerRow. */
export function tickerToEntry(t: {
  ticker: string;
  company_name: string;
  price: number;
  percent_change: number;
}): TickerRow {
  return {
    kind: "stock",
    kode: t.ticker,
    nama: t.company_name,
    price: t.price,
    changePercent: t.percent_change,
  };
}

/** Adapter: live coin ticker wire shape → TickerRow.
 *  Wire shape ships lowercase tickers (`"btc"`); the rest of the
 *  app's recap-id lookup is keyed on the uppercase form. */
export function coinTickerToEntry(item: {
  ticker: string;
  ticker_name: string;
  price: number;
  price_change: number;
}): TickerRow {
  return {
    kind: "crypto",
    kode: item.ticker.toUpperCase(),
    nama: item.ticker_name,
    price: item.price,
    // The wire field is a signed percent — keep the sign, the
    // render path formats it the same as the mock feed.
    changePercent: item.price_change,
  };
}

/** Build the recap-detail URL for a crypto ticker. Returns the
 *  stock-detail page when the ticker isn't in the lookup so the
 *  link still navigates somewhere rather than landing on a
 *  dangling URL. */
export function cryptoRecapHref(kode: string): string {
  const storyId = COIN_KODE_TO_STORY_ID[kode];
  return storyId ? `/headline/detail/${storyId}` : `/stock/${kode}`;
}

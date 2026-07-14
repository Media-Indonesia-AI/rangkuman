import {
  Minus,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { Sentimen } from "@/lib/mock/recaps";

// ─── MARKET MOOD ────────────────────────────────────────────────

/** Indonesian label bands the `MarketMood.score` falls into. The
 *  server picks the label from the score — bands are stable so the
 *  UI can switch visuals off the label without re-deriving it. */
export type MarketMoodLabel =
  | "Sangat Pesimis"
  | "Pesimis"
  | "Netral"
  | "Optimis"
  | "Sangat Optimis";

/** Composite market-mood snapshot returned by `GET market-mood`.
 *  Combines IHSG change, foreign flow, USD/IDR, the latest BI Rate
 *  decision, and headline-sentiment counts into a single object
 *  with a 0–100 score, an Indonesian label band, and an AI-written
 *  narrative explaining the drivers. */
export interface MarketMood {
  /** ISO timestamp of when this snapshot was generated. */
  recorded_at: string;
  /** Composite sentiment score, 0–100. Lower = more bearish,
   *  higher = more bullish. The `label` is derived from this on
   *  the server. */
  score: number;
  /** Indonesian label for the score band. */
  label: MarketMoodLabel;
  /** IHSG day change in percent (signed). */
  ihsg_pct_change: number;
  /** Foreign net flow in IDR (signed; negative = net sell). */
  foreign_flow_idr: number;
  /** USD/IDR day change in percent (signed). */
  usd_idr_pct_change: number;
  /** Latest BI Rate decision change in basis points (signed;
   *  positive = hike, negative = cut). */
  bi_rate_bps: number;
  /** Headline counts bucketed by sentiment for the snapshot window. */
  headlines_positive: number;
  headlines_negative: number;
  headlines_neutral: number;
  /** AI-generated narrative explaining the mood drivers. */
  narrative: string;
}

/**
 * Wire format the backend returns from `GET market-mood`:
 * `{ data: MarketMood }`. The `getMarketMood` API function unwraps
 * it to `MarketMood` for consumers (same `{ data: ... }` envelope
 * pattern used by every other endpoint in this codebase — see
 * `HeadlineDetailResponse` for the parallel example).
 */
export interface MarketMoodResponse {
  data: MarketMood;
}

// ─── PRESENTATION BUCKETS ──────────────────────────────────────
// The maps below sit next to `MarketMoodLabel` and `Sentimen` so the
// API band → UI bucket mapping, the per-bucket styling, and the
// per-bucket text color all live in one file. Trade-off: this types
// module now depends on `lucide-react` (for the icon components) and
// `@/lib/mock/recaps` (for `Sentimen`). The dependency is one-way
// (moods → icon/recap) and stable, so the cost is small.

/** Per-bucket styling for the mood badge — text, background, border,
 *  and the icon that represents the band. Drives the header pill in
 *  `<MarketMood>`. */
export const sentimentConfig: Record<
  Sentimen,
  { label: string; bg: string; text: string; border: string; Icon: LucideIcon }
> = {
  positif: {
    label: "Positif",
    bg: "bg-bullish-soft",
    text: "text-bullish",
    border: "border-bullish-line",
    Icon: TrendingUp,
  },
  netral: {
    label: "Netral",
    bg: "bg-mixed-soft",
    text: "text-mixed",
    border: "border-mixed-line",
    Icon: Minus,
  },
  negatif: {
    label: "Negatif",
    bg: "bg-bearish-soft",
    text: "text-bearish",
    border: "border-bearish-line",
    Icon: TrendingDown,
  },
};

/** Map the API's `MarketMoodLabel` band (5 entries) onto the
 *  3-bucket styling taxonomy the badge uses (`sentimentConfig`).
 *  "Sangat Pesimis" / "Pesimis" both fall into the bearish bucket;
 *  "Sangat Optimis" / "Optimis" both fall into the bullish bucket.
 *  `Netral` maps to the neutral bucket. */
export const labelToSentiment: Record<MarketMoodLabel, Sentimen> = {
  "Sangat Pesimis": "negatif",
  Pesimis: "negatif",
  Netral: "netral",
  Optimis: "positif",
  "Sangat Optimis": "positif",
};

/** Per-bucket text color for the small "top factors" pills in the
 *  mood strip's footer (e.g. `Netral Sell 1.5T` styled with bearish
 *  red when its sentiment is `negatif`). */
export const factorSentimentColors: Record<Sentimen, string> = {
  positif: "text-bullish",
  negatif: "text-bearish",
  netral: "text-mixed",
};

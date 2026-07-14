
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
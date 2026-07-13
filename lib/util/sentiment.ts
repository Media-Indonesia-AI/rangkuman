/**
 * Sentiment vocabulary bridge.
 *
 * The backend speaks English sentiment (`StorySentiment` /
 * `TrendingSentiment` — both `"positive" | "negative" | "neutral"`),
 * while the UI components (`SentimentBadge`, the market-color palette,
 * `DailyRecap.sentimen`, …) speak the Indonesian `Sentimen` vocabulary
 * (`"positif" | "netral" | "negatif"`).
 *
 * This is the single place that maps between them. It replaces the
 * three previously-duplicated local mappers in `HeadlineSentimentBadge`,
 * `PalingBanyakDiberitakan`, and `LatestHeadlines`.
 */

import type { StorySentiment, TrendingSentiment } from "@/lib/api";
import type { Sentimen } from "@/lib/mock/recaps";

/** English API sentiment → Indonesian UI `Sentimen`. Both API unions
 *  (`StorySentiment`, `TrendingSentiment`) are structurally identical,
 *  so one record covers both. */
const API_SENTIMENT_TO_SENTIMEN: Record<
  StorySentiment | TrendingSentiment,
  Sentimen
> = {
  positive: "positif",
  negative: "negatif",
  neutral: "netral",
};

/**
 * Map a backend sentiment string to the UI `Sentimen`. Falls back to
 * `"netral"` for any unexpected value the backend might introduce.
 */
export function toSentimen(
  sentiment: StorySentiment | TrendingSentiment,
): Sentimen {
  return API_SENTIMENT_TO_SENTIMEN[sentiment] ?? "netral";
}

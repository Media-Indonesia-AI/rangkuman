import { SentimentBadge } from "@/components/SentimentBadge";

/**
 * Sentiment badge for the stock hero. Always renders `"netral"` —
 * the per-headline sentiment was previously sourced from a
 * headline-detail context that no longer exists on the stock page,
 * and the aggregate recap sentiment is already rendered alongside
 * the price line, so the hero slot collapses to a stable neutral
 * chip rather than re-fetching the same data.
 */
export function HeadlineSentimentBadge() {
  return <SentimentBadge sentiment="netral" size="sm" />;
}

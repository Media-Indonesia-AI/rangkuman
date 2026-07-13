"use client";

import { SentimentBadge } from "@/components/SentimentBadge";
import { useHeadlineDetail } from "./HeadlineDetailProvider";
import { toSentimen } from "@/lib/util/sentiment";
import type { Sentimen } from "@/lib/mock/recaps";

/**
 * Sentiment badge for the stock hero. Prefers the deep-linked
 * headline's sentiment over the aggregate recap's.
 *
 * It no longer fetches — the single `loadHeadlineById` call is owned by
 * `<HeadlineDetailProvider>` (mounted by the stock page). This component
 * just reads that shared result via `useHeadlineDetail()` and maps it to
 * the UI `Sentimen`. Falls back to `fallback` (the recap's aggregate
 * sentiment) when there's no `?id=`, while the fetch is in flight, or if
 * it failed — so the badge always renders something sensible, including
 * in the statically prerendered shell.
 */
export function HeadlineSentimentBadge() {
  const { detail } = useHeadlineDetail();
  const sentiment = detail ? toSentimen(detail.sentiment) : "netral";

  return <SentimentBadge sentiment={sentiment} size="sm" />;
}

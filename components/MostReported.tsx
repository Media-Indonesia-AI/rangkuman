"use client";

import { Flame } from "lucide-react";
import Link from "next/link";
import { useTrendingStories } from "@/lib/hooks/useTrendingStories";
import type { TrendingStory } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * "Paling banyak diberitakan" — the top trending story on `/saham`.
 *
 * Layout: a section header (Flame icon + label) above a single
 * featured card showing the top ticker's editorial summary, its
 * supporting article list, and its net sentiment. The rest of the
 * trending list (up to 20 by default) is fetched but not yet rendered
 * here — see the "Lihat 20 teratas" link at the bottom of the feed
 * column for the full-list view.
 *
 * Data flow: `useTrendingStories(20, "sahamrakyat")` →
 * `api.getTrendingStories()` → `GET /story/trending?…`.
 *
 * On error / empty response the section header still renders, so the
 * page layout doesn't shift — only the card area collapses.
 */
export function MostReported() {
  const { data } = useTrendingStories();
  const top = data[0];

  return (
    <section aria-label="Paling banyak diberitakan">
      <div className="mb-2 flex items-center gap-1.5">
        <Flame className="h-3.5 w-3.5 text-brand" aria-hidden />
        <span className="label text-text-secondary">
          Paling banyak diberitakan
        </span>
      </div>
      {top ? <MostReportedCard story={top} /> : null}
    </section>
  );
}

interface MostReportedCardProps {
  story: TrendingStory;
}

/**
 * Sentiment → text color. Mirrors the `MarketMood` `factorSentimentColors`
 * convention so the strip reads visually consistent.
 */
const sentimentTextColors: Record<TrendingStory["sentiment"], string> = {
  positive: "text-bullish",
  negative: "text-bearish",
  neutral: "text-mixed",
};

const sentimentBgColors: Record<TrendingStory["sentiment"], string> = {
  positive: "bg-bullish-soft",
  negative: "bg-bearish-soft",
  neutral: "bg-mixed-soft",
};

const sentimentBorderColors: Record<TrendingStory["sentiment"], string> = {
  positive: "border-bullish-line",
  negative: "border-bearish-line",
  neutral: "border-mixed-line",
};

const sentimentLabels: Record<TrendingStory["sentiment"], string> = {
  positive: "Positif",
  negative: "Negatif",
  neutral: "Netral",
};

/** Render a single trending story as a featured card. */
function MostReportedCard({ story }: MostReportedCardProps) {
  const totalArticles = story.medias.reduce(
    (sum, m) => sum + m.count,
    0,
  );
  const mediaCount = story.medias.length;
  const topArticles = story.articles.slice(0, 3);

  return (
    <Link
      href={`/stock/${story.ticker}`}
      className="group block overflow-hidden rounded-lg border border-border bg-bg-secondary transition-colors hover:border-border-strong"
    >
      {/* Header row — ticker + sentiment badge */}
      <div className="flex items-start justify-between gap-3 border-b border-border bg-bg-tertiary px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[15px] font-bold leading-tight text-text-primary group-hover:text-brand">
            {story.ticker}
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-text-faint">
            {totalArticles} artikel · {mediaCount} media
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-widest",
            sentimentBgColors[story.sentiment],
            sentimentTextColors[story.sentiment],
            sentimentBorderColors[story.sentiment],
            "border",
          )}
        >
          {sentimentLabels[story.sentiment]}
        </span>
      </div>

      {/* Brief summary */}
      <div className="px-3 py-2.5">
        <p className="text-[12.5px] leading-relaxed text-text-secondary">
          {story.brief_summary}
        </p>
      </div>

      {/* Top articles — compact list, sources muted */}
      {topArticles.length > 0 && (
        <div className="border-t border-border bg-bg-tertiary/50 px-3 py-2">
          <ul className="space-y-1">
            {topArticles.map((article, i) => (
              <li
                key={`${story.ticker}-${i}`}
                className="flex items-start gap-1.5 font-mono text-[10.5px] leading-snug"
              >
                <span className="text-text-faint">{i + 1}.</span>
                <span className="min-w-0 flex-1 truncate text-text-secondary">
                  {article.title}
                </span>
                <span className="shrink-0 text-text-faint">
                  {article.source_name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Link>
  );
}
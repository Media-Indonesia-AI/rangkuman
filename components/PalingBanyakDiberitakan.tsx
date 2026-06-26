"use client";

import { Flame } from "lucide-react";
import type { TrendingStory, TrendingSentiment } from "@/lib/api";
import type { DailyRecap, Sentimen } from "@/lib/mock/recaps";
import { Shimmer } from "./Shimmer";
import { StockCard } from "./StockCard";

/**
 * "Paling banyak diberitakan" — the top trending story list on
 * `/saham`. Renders a single `<section>` with a Flame-icon header and
 * a vertical stack of `<StockCard variant="list" />` cards driven by
 * the live trending-stories API.
 *
 * Data flow (lives in the parent page, not here):
 *   `useTrendingStories(20, "sahamrakyat")` → `api.getTrendingStories()` →
 *   `GET /story/trending?…` → `mapTrendingStoryToRecap` → `<StockCard>`.
 *
 * The parent page does the fetch + mapping and passes the resolved
 * `TrendingStory[]` + loading flag in. This component is purely
 * presentational — it knows about the section header, the loading
 * skeleton, and the empty state, nothing else.
 *
 * Three render branches:
 *   - loading → 3 stacked skeleton cards (matches feed's `space-y-2.5` rhythm)
 *   - loaded, has data → one `<StockCard>` per item, ranked `#01`–`#20`
 *   - loaded, no data → header only, card area collapses
 */

interface PalingBanyakDiberitakanProps {
  trending: TrendingStory[];
  trendingLoading: boolean;
}

const trendingSentimentToSentimen: Record<TrendingSentiment, Sentimen> = {
  positive: "positif",
  negative: "negatif",
  neutral: "netral",
};

/**
 * Map a `TrendingStory` (API wire shape) → `DailyRecap` (the shape
 * `StockCard` consumes). Only the fields `StockCard` reads are
 * filled in; everything else is left at its default.
 *
 * - `ticker`           → `sahamKode`
 * - `brief_summary`    → `ringkasan`
 * - `recap_date`       → `tanggal`
 * - `sentiment` (en)   → `sentimen` (id) via the lookup table above
 * - `medias[]`         → `sumber[]` (logo left empty — `<SourceBar>`
 *                         renders the avatar from `initialsOf(media)`)
 * - `medias[].count` summed → `jumlahBerita`
 */
function mapTrendingStoryToRecap(story: TrendingStory): DailyRecap {
  const totalArticles = story.medias.reduce(
    (sum, m) => sum + m.count,
    0,
  );
  return {
    id: `trending-${story.ticker}`,
    tanggal: story.recap_date,
    sahamKode: story.ticker,
    ringkasan: story.brief_summary,
    sentimen: trendingSentimentToSentimen[story.sentiment],
    jumlahBerita: totalArticles,
    sumber: story.medias.map((m) => ({
      media: m.name,
      logo: "",
      jumlah: m.count,
    })),
  };
}

/**
 * Skeleton placeholder that mimics the `StockCard variant="list"`
 * layout — gradient backdrop on the left, meta + summary on the
 * right — so the section doesn't shift when data lands.
 */
function PalingBanyakSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg-secondary">
      <div className="flex h-full min-h-[140px]">
        <div className="hidden w-[150px] shrink-0 bg-bg-tertiary sm:block" />
        <div className="flex flex-1 flex-col gap-2.5 p-3.5 sm:p-4">
          <div className="flex items-center gap-1.5">
            <Shimmer className="h-3 w-12" />
            <Shimmer className="h-3 w-20" />
            <Shimmer className="h-3 w-16" />
          </div>
          <div className="space-y-1.5">
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PalingBanyakDiberitakan({
  trending,
  trendingLoading,
}: PalingBanyakDiberitakanProps) {
  return (
    <section aria-label="Paling banyak diberitakan">
      <div className="mb-2 flex items-center gap-1.5">
        <Flame className="h-3.5 w-3.5 text-brand" aria-hidden />
        <span className="label text-text-secondary">
          Paling banyak diberitakan
        </span>
      </div>
      {trendingLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <PalingBanyakSkeleton key={i} />
          ))}
        </div>
      ) : trending.length > 0 ? (
        <div className="space-y-2.5">
          {trending.map((story, i) => (
            <StockCard
              key={story.ticker}
              recap={mapTrendingStoryToRecap(story)}
              variant="list"
              rank={i + 1}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
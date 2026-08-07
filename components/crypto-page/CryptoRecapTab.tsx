"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Inbox, ArrowUpRight, Flame, BookOpen } from "lucide-react";
import type { StoryFilter } from "@/lib/api";
import { useTopicsContext } from "@/components/topics-provider";
import { useHeadlines } from "@/lib/hooks/useHeadlines";
import { EmitenStories } from "@/components/saham";
import { CryptoSectionHeader } from "./CryptoSectionHeader";
import { CryptoFeaturedCard } from "./CryptoFeaturedCard";
import { CryptoStoryCard } from "./CryptoStoryCard";
import {
  CRYPTO_PAGE_STORIES,
  findCryptoTopicId,
  storyItemToCryptoStory,
} from "./cryptoStories";

/**
 * "Recap" tab content on the `/crypto` page — the editorial
 * pillar that surfaces today's lead story + the recent cluster.
 *
 * Data source: live topic-scoped `<useHeadlines(topic_id=…)>`
 * results when available, falling back to
 * `CRYPTO_PAGE_STORIES` mock until the live response resolves.
 * The same `<CryptoFeaturedCard />` / `<CryptoStoryCard />`
 * widgets render both branches via the
 * `storyItemToCryptoStory()` adapter — there is no separate
 * "headlines" list widget above the cards anymore; the cards
 * ARE the headline surface.
 *
 * Self-contained: it owns
 *   - the topic-id derivation from the layout-level
 *     `<TopicsProvider />` via `findCryptoTopicId()`
 *     (slug match → name match → first-topic fallback),
 *   - the live `useHeadlines(topic_id=…)` fetch with memoized
 *     filters (the same array-identity gotcha covered for
 *     `HeadlineStoriesProvider` / `useListStory`),
 *   - the live-when-available / mock-fallback source picking
 *     and the slice into the three layers
 *     (lead / sedang-terjadi / cerita-lain),
 *   - the empty-state row + the bottom "Lihat lebih banyak"
 *     CTA — both live here because they only matter when this
 *     tab is shown.
 *
 * The parent (`CryptoPage`) doesn't pass anything in; it just
 * decides whether to render this tab or `<CryptoPasarTab />`
 * based on the sub-nav state.
 */
export function CryptoRecapTab() {
  // ── Live topic-scoped headlines ────────────────────────────────
  // Resolve the "crypto" topic from the layout-level topic list.
  // The matcher (see `findCryptoTopicId` in `cryptoStories.ts`)
  // prefers a canonical `slug === "crypto"` match, falls back to
  // a case-insensitive `name === "crypto"`, and finally to the
  // first topic in the list so the page still renders when no
  // "crypto"-tagged topic is registered yet.
  //
  // The fetch is gated on `topicId !== null` so we never burn a
  // wasted `topic_id=""` cache slot while topics are still
  // loading or empty.
  const { topics } = useTopicsContext();
  const topicId = findCryptoTopicId(topics);
  const topicFilters = useMemo<StoryFilter[]>(
    () =>
      topicId
        ? [{ field: "topic_id", operator: "eq", value: topicId }]
        : [],
    [topicId],
  );
  const { data: liveHeadlines } = useHeadlines(
    10,
    0,
    topicFilters,
    topicId !== null,
  );

  // Single source of truth for the cards:
  //   - When the live feed has rows, adapt each `StoryItem` to
  //     the card shape via `storyItemToCryptoStory()` and use it.
  //   - Otherwise (still loading, fetch errored, or backend
  //     returned empty) fall back to the static
  //     `CRYPTO_PAGE_STORIES` mock so the user never sees an
  //     empty timeline.
  const sourceStories =
    liveHeadlines.length > 0
      ? liveHeadlines.map(storyItemToCryptoStory)
      : CRYPTO_PAGE_STORIES;

  // Slice the chosen source into the three layers the Sorotan
  // page renders. Lead is always index 0; layers 2-3 split the
  // tail with a fixed 4-card "Sedang Terjadi" cap so the layout
  // stays predictable regardless of how many stories arrive.
  const lead = sourceStories[0];
  const sedangTerjadi = sourceStories.slice(1, 5);
  const ceritaLain = sourceStories.slice(5);

  return (
    <>
      {/* 🔥 LAYER 1: SOROTAN — 1 big card (live or fallback) */}
      {lead && (
        <section aria-label="Sorotan" className="mt-4">
          <CryptoSectionHeader
            icon={<Flame className="h-3 w-3" aria-hidden />}
            title="Sorotan"
            subtitle="Cerita paling penting hari ini"
            count="1 cerita"
          />
          <CryptoFeaturedCard story={lead} />
        </section>
      )}

      {/* 📰 Story — multi-date, ticker-agnostic context
          threads. Sits between LAYER 1 (today's lead) and
          LAYER 2 (sedang terjadi) so the visitor first reads
          the lead headline, then encounters the longer-running
          story threads the headline is part of, before moving
          on to the next cluster of recent stories. Uses the
          default `feed` variant — borderless, flows with the
          tab chrome. */}
      <div className="mt-8">
        <EmitenStories storyLimit={3}/>
      </div>

      {/* 📋 LAYER 2: SEDANG TERJADI — 4 cards in 2-col */}
      {sedangTerjadi.length > 0 && (
        <section aria-label="Sedang terjadi" className="mt-8">
          <CryptoSectionHeader
            icon={<Flame className="h-3 w-3" aria-hidden />}
            title="Sedang Terjadi"
            subtitle="Cerita penting lainnya"
            count={`Top ${sedangTerjadi.length} cerita`}
          />
          <div className="grid gap-2.5 sm:grid-cols-2">
            {sedangTerjadi.map((s) => (
              <CryptoStoryCard key={s.id} story={s} />
            ))}
          </div>
        </section>
      )}

      {/* 📚 LAYER 3: CERITA LAIN — 3-col grid (compact, no summary) */}
      {ceritaLain.length > 0 && (
        <section aria-label="Cerita lain" className="mt-8">
          <CryptoSectionHeader
            icon={<BookOpen className="h-3 w-3" aria-hidden />}
            title="Cerita Lain"
            subtitle="Berita tambahan hari ini"
            count={`${ceritaLain.length} cerita`}
          />
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {ceritaLain.map((s) => (
              <CryptoStoryCard key={s.id} story={s} compact />
            ))}
          </div>
        </section>
      )}

      {sourceStories.length === 0 && (
        <div className="mt-10 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-bg-secondary/50 px-6 py-12 text-center">
          <Inbox className="h-7 w-7 text-text-faint" aria-hidden />
          <p className="mt-2 text-[13.5px] font-semibold text-text-primary">
            Belum ada cerita untuk tanggal ini
          </p>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <Link
          href="/trending"
          className="group inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-secondary px-3.5 py-2 text-[12.5px] font-semibold text-text-secondary transition-all hover:border-brand hover:text-brand"
        >
          Lihat lebih banyak
          <ArrowUpRight
            className="h-3 w-3 transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
            aria-hidden
          />
        </Link>
      </div>
    </>
  );
}

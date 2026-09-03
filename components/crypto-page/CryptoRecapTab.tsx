"use client";

import { useMemo } from "react";
import { Inbox, Flame, ClipboardList } from "lucide-react";
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
 *     and the slice into the lead + Berita Terkini cluster,
 *   - the empty-state row — it lives here because it only
 *     matters when this tab is shown.
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

  // Slice the chosen source into the lead + Berita Terkini
  // cluster the recap tab renders. Lead is always index 0;
  // the rest feed the merged Berita Terkini section.
  const lead = sourceStories[0];
  const beritaTerkini = sourceStories.slice(1);

  return (
    <>
      {/* 🔥 LAYER 1: HEADLINE — 1 big card (live or fallback) */}
      {lead && (
        <section aria-label="Headline" className="mt-4">
          <CryptoSectionHeader
            icon={<Flame className="h-3 w-3" aria-hidden />}
            title="Headline"
            subtitle="Cerita paling penting hari ini"
            count="1 cerita"
          />
          <CryptoFeaturedCard story={lead} />
        </section>
      )}

      {/* 📰 Story — multi-date, ticker-agnostic context
          threads. Sits between LAYER 1 (today's lead) and
          the Berita Terkini feed so the visitor first reads
          the lead headline, then encounters the longer-
          running story threads the headline is part of,
          before moving on to the rolling-news cluster
          below. Uses the default `feed` variant —
          borderless, flows with the tab chrome. Scoped to
          the "crypto" topic via `topicId` so the feed shows
          crypto-tagged stories instead of the cross-topic
          default. Rendered only when `topicId` has a value
          (topics still loading or the catalog returned no
          crypto-tagged entry); otherwise the slot collapses
          so we never hit the cross-topic default fallback. */}
      {topicId && (
        <div className="mt-8">
          <EmitenStories storyLimit={3} topicId={topicId} />
        </div>
      )}

      {/* 📋 BERITA TERKINI — tail of the source stories,
          2-col grid, non-compact cards. Merged from the old
          "Sedang Terjadi" (4 cards) + "Cerita Lain"
          (rest) sections into a single rolling-news feed.
          Uses Sedang Terjadi's design: `CryptoStoryCard`
          without the `compact` flag so each card shows the
          full summary line, and a 2-col grid on >= sm. */}
      {beritaTerkini.length > 0 && (
        <section aria-label="Berita terkini" className="mt-8">
          <CryptoSectionHeader
            icon={<ClipboardList className="h-3 w-3" aria-hidden />}
            title="Berita Terkini"
            count={`${beritaTerkini.length} cerita`}
          />
          <div className="grid gap-2.5 sm:grid-cols-2">
            {beritaTerkini.map((s) => (
              <CryptoStoryCard key={s.id} story={s} />
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
    </>
  );
}
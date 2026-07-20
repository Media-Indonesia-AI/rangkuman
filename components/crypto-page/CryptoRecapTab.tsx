"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Inbox, ArrowUpRight, Flame, BookOpen } from "lucide-react";
import type { StoryFilter } from "@/lib/api";
import { useTopicsContext } from "@/components/topics-provider";
import { useHeadlines } from "@/lib/hooks/useHeadlines";
import { CryptoSectionHeader } from "./CryptoSectionHeader";
import { CryptoFeaturedCard } from "./CryptoFeaturedCard";
import { CryptoStoryCard } from "./CryptoStoryCard";
import { CRYPTO_PAGE_STORIES } from "./cryptoStories";

/**
 * "Recap" tab content on the `/crypto` page — the editorial
 * pillar that surfaces today's lead story + the recent cluster,
 * plus a live, topic-scoped `<Cerita Topik Ini>` feed pulled
 * from the API.
 *
 * Self-contained: it owns
 *   - the topic-id derivation from the layout-level
 *     `<TopicsProvider />` (first resolved topic wins for now),
 *   - the live `useHeadlines(topic_id=…)` fetch with memoized
 *     filters (the same array-identity gotcha covered for
 *     `HeadlineStoriesProvider` / `useListStory`),
 *   - the mock-driven `CRYPTO_PAGE_STORIES` slice into three
 *     layers (lead / sedang-terjadi / cerita-lain),
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
  // First resolved topic wins — when the API exposes a "crypto"
  // (or similar) topic slug, swap this for a slug-match lookup.
  // The fetch is gated on `topicId !== null` so we never burn a
  // wasted `topic_id=""` cache slot while topics are still
  // loading or empty.
  const { topics } = useTopicsContext();
  const topicId = topics[0]?.id ?? null;
  const topicFilters = useMemo<StoryFilter[]>(
    () =>
      topicId
        ? [{ field: "topic_id", operator: "eq", value: topicId }]
        : [],
    [topicId],
  );
  const { data: liveHeadlines, isLoading: liveLoading } = useHeadlines(
    10,
    0,
    topicFilters,
    topicId !== null,
  );

  // Slice the mock story list into the three layers the Sorotan
  // page renders. Lead is always index 0; layers 2-3 split the
  // tail with a fixed 4-card cap so the layout stays predictable.
  const lead = CRYPTO_PAGE_STORIES[0];
  const sedangTerjadi = CRYPTO_PAGE_STORIES.slice(1, 5);
  const ceritaLain = CRYPTO_PAGE_STORIES.slice(5);

  return (
    <>
      {/* 📡 TOPIC HEADLINES — live data scoped to the first
          resolved topic from the layout-level
          `<TopicsProvider />`. Sits above the mock-driven Sorotan
          layers so it acts as the freshest source until the page
          is wired end-to-end against the API. */}
      <section aria-label="Headlines topik ini" className="mt-4">
        <CryptoSectionHeader
          icon={<BookOpen className="h-3 w-3" aria-hidden />}
          title="Cerita Topik Ini"
          subtitle={
            topicId
              ? `Topik ${topicId} · cerita terbaru`
              : "Memuat topik…"
          }
          count={
            liveLoading ? "…" : `${liveHeadlines.length} cerita`
          }
        />
        {topicId === null ? (
          <p className="rounded-lg border border-dashed border-border bg-bg-secondary/50 px-4 py-6 text-center font-mono text-[11px] text-text-muted">
            Topik belum tersedia — coba lagi sebentar.
          </p>
        ) : liveHeadlines.length === 0 && !liveLoading ? (
          <p className="rounded-lg border border-dashed border-border bg-bg-secondary/50 px-4 py-6 text-center font-mono text-[11px] text-text-muted">
            Belum ada cerita untuk topik ini.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {liveHeadlines.map((s) => (
              <li
                key={s.id}
                className="flex flex-col gap-1 rounded-md border border-border bg-bg-secondary px-3 py-2.5 transition-colors hover:border-border-strong"
              >
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  {s.primary_ticker_code && (
                    <span className="rounded border border-border bg-bg-tertiary px-1 py-px text-[9.5px] font-semibold text-text-primary">
                      {s.primary_ticker_code}
                    </span>
                  )}
                  <span>{s.sentiment}</span>
                </div>
                <p className="text-[13px] font-medium leading-snug text-text-primary">
                  {s.title}
                </p>
                {s.summary && (
                  <p className="line-clamp-2 text-[11.5px] leading-snug text-text-secondary">
                    {s.summary}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 🔥 LAYER 1: SOROTAN — 1 big card */}
      {lead && (
        <section aria-label="Sorotan" className="mt-8">
          <CryptoSectionHeader
            icon={<Flame className="h-3 w-3" aria-hidden />}
            title="Sorotan"
            subtitle="Cerita paling penting hari ini"
            count="1 cerita"
          />
          <CryptoFeaturedCard story={lead} />
        </section>
      )}

      {/* 📋 LAYER 2: SEDANG TERJADI — 4 cards in 2-col */}
      {sedangTerjadi.length > 0 && (
        <section aria-label="Sedang terjadi" className="mt-8">
          <CryptoSectionHeader
            icon={<Flame className="h-3 w-3" aria-hidden />}
            title="Sedang Terjadi"
            subtitle="Cerita penting lainnya"
            count={`Top ${sedangTerjadi.length} · 1 jam terakhir`}
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

      {CRYPTO_PAGE_STORIES.length === 0 && (
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

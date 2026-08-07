"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DatePicker } from "@/components/DatePicker";
import { LatestHeadlines } from "@/components/latest-headlines/LatestHeadlines";
import { MarketMood } from "@/components/MarketMood";
import { SektorSection } from "@/components/sektor";
import {
  EmitenStories,
  LeftSidebar,
  MobileTopMovers,
  PalingBanyakDiberitakan,
  SahamSubTabs,
  WatchlistSection,
  type SahamTab,
} from "@/components/saham";
import { useTopicsContext } from "@/components/topics-provider";
import { useGetStocksTrending } from "@/lib/hooks/useGetStocksTrending";
import type { StoryTopic } from "@/lib/api";
import { todayIsoDate } from "@/lib/api/client";
import { formatTanggalIndonesia } from "@/lib/util/formatDate";

/** localStorage key for the persisted sub-tab selection on /saham.
 *  Matches the `beritainvestor:*` namespace convention used by
 *  auth, watchlist, theme, newsletter, etc. */
const SAHAM_TAB_KEY = "beritainvestor:saham-tab";

/** Type guard for the persisted value — ignores anything other
 *  than the two known tabs (defensive against manual localStorage
 *  edits and version skew across deploys). */
function isSahamTab(value: unknown): value is SahamTab {
  return value === "recap" || value === "sektor";
}

/**
 * Resolve the `topic_id` that drives the `/saham` page's Story
 * feed. Prefers the canonical **slug** match (URL-safe identifier,
 * stable across renames), then a case-insensitive **name** match.
 * If neither lands on a topic, the first entry in the list wins
 * as a resilience fallback so the page still renders even before
 * a "saham" topic is registered. Mirror of
 * `findCryptoTopicId` (in `components/crypto-page/cryptoStories.ts`)
 * — keep the two helpers in lockstep so the page-level contracts
 * stay symmetric.
 *
 * Return shape mirrors `findCryptoTopicId`: `null` only when the
 * topics list is empty (still loading or backend returned nothing).
 * Every other path returns a string id.
 */
function findSahamTopicId(
  topics: readonly StoryTopic[],
): string | null {
  // 1. Canonical slug match — preferred since slugs are stable,
  //    URL-friendly identifiers the backend exposes as the
  //    authoritative foreign key reference.
  const slugHit = topics.find((t) => t.slug === "saham");
  if (slugHit) return slugHit.id;

  // 2. Case-insensitive name match — covers backends that ship
  //    `name: "Saham"` / `"SAHAM"` while the slug is something
  //    else (e.g. `"saham-indonesia"`).
  const nameHit = topics.find(
    (t) => t.name.trim().toLowerCase() === "saham",
  );
  if (nameHit) return nameHit.id;

  // 3. First-topic fallback — keeps the page rendering even if
  //    no "saham"-tagged topic exists in the dataset yet. The
  //    caller treats any non-null id as "fetch with this filter";
  //    we'd rather show *something* than wait forever.
  return topics[0]?.id ?? null;
}

export default function SahamPage() {
  /** Sub-tab active: "recap" (default) | "sektor". The user's
   *  last selection is persisted to localStorage so navigating
   *  away and back (or a page reload) lands on the same tab
   *  rather than always defaulting to "recap". The state starts
   *  as `null` and is hydrated on mount to avoid an SSR/CSR
   *  markup mismatch — same pattern as `<ThemeToggle />`. */
  const [subTab, setSubTab] = useState<SahamTab | null>(null);
  // Selected date — defaults to actual local-tz today via lazy
  // initialization (so the user always lands on the current day on
  // first visit, not the hardcoded mock "2026-06-07"). The user can
  // still navigate back via the DatePicker.
  const [isoDate, setIsoDate] = useState<string>(() => todayIsoDate());

  // Topics catalog — resolves the "saham" topic id so the
  // `<EmitenStories />` Story feed below is scoped to saham-scoped
  // stories instead of the cross-topic default. `findSahamTopicId`
  // returns `null` only while the topics list is still loading;
  // the helper then maps it to `undefined` for the prop, which
  // leaves the underlying request on its cross-topic slot until
  // topics land. Same null/undefined coalescing convention used
  // by `<CryptoRecapTab />` for the crypto feed.
  const { topics } = useTopicsContext();
  const sahamTopicId = findSahamTopicId(topics);

  // "Paling banyak diberitakan" — refetches whenever the selected
  // DatePicker value changes. Declared before the pre-hydration guard
  // below so the hook order is stable across renders.
  const {
    data: trending,
    isLoading: trendingLoading,
    refresh: refreshTrending,
  } = useGetStocksTrending(isoDate);

  // Hydrate the persisted sub-tab on first mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAHAM_TAB_KEY);
      if (isSahamTab(raw)) setSubTab(raw);
      else setSubTab("recap"); // fall back to default on absent / invalid
    } catch {
      // localStorage may be disabled (private mode, blocked by
      // browser policy, etc.) — silently land on the default tab.
      setSubTab("recap");
    }
  }, []);

  // Persist on every subsequent change. The first effect already
  // set the persisted value into state, so this skips re-writing
  // the same value during the initial hydration render.
  useEffect(() => {
    if (subTab === null) return; // pre-hydration; let the read effect own the first write
    try {
      window.localStorage.setItem(SAHAM_TAB_KEY, subTab);
    } catch {
      /* noop — storage may be full or disabled */
    }
  }, [subTab]);

  // Pre-hydration guard: render only the static chrome (navbar +
  // sr-only H1) until the persisted tab is known. This prevents a
  // flash of "recap" content when the user's persisted choice is
  // "sektor".
  if (subTab === null) {
    return (
      <>
        <Navbar />
        <h1 className="sr-only">
          Rangkuman &mdash; Saham: Recap Harian &amp; Sektor Pasar Modal Indonesia
        </h1>
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* FIX 4: Sr-only H1 for SEO */}
      <h1 className="sr-only">
        Rangkuman &mdash; Saham: Recap Harian &amp; Sektor Pasar Modal Indonesia
      </h1>

      {/* Sub-tab bar — Recap | Sektor */}
      <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 sm:pt-4">
        <SahamSubTabs active={subTab} onChange={setSubTab} />
      </div>

      {subTab === "recap" && (
        <>
          <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-5">
            <MarketMood />
            <div className="mt-3">
              <MobileTopMovers />
            </div>
            <div className="mt-3 xl:hidden">
              <LatestHeadlines />
            </div>
          </div>

          <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5">
            {/* Watchlist preview — only shown when user is logged in & watchlist isn't empty */}
            <WatchlistSection />

            {/* Main grid: left rail + feed + right rail */}
            <div className="grid gap-6 xl:grid-cols-[240px_1fr_320px]">
              {/* Left rail — Top Movers */}
              <div className="hidden xl:block">
                <div className="sticky top-20">
                  <LeftSidebar />
                </div>
              </div>

              {/* Feed column */}
              <div className="min-w-0 space-y-5">
                <EmitenStories storyLimit={3} topicId={sahamTopicId ?? undefined} />

                {/* Date picker + recap summary */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <DatePicker
                    value={isoDate}
                    onChange={setIsoDate}
                    todayIso={todayIsoDate()}
                    maxLookbackDays={30}
                  />
                </div>

                <PalingBanyakDiberitakan
                  trending={trending}
                  trendingLoading={trendingLoading}
                  onRefresh={refreshTrending}
                />
              </div>

              {/* Right sidebar — desktop only, contains Market Mood + Headlines + Newsletter */}
              <div className="hidden xl:block">
                <div className="sticky top-20">
                  <LatestHeadlines />
                </div>
              </div>
            </div>
          </main>
          {/* <Footer /> */}
        </>
      )}

      {subTab === "sektor" && (
        <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5">
          <SektorSection />
        </main>
      )}
      <Footer />
    </>
  );
}

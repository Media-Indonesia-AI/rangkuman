"use client";

import { useEffect, useState } from "react";
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
import { todayIsoDate } from "@/lib/api/client";
import { findSahamTopicId } from "@/lib/util/topicId";
import { STORAGE_KEYS } from "@/lib/storageKeys";

// Canonical localStorage key names live in `lib/storageKeys.ts`
// alongside every other storage concern in the app. We reference
// them directly here — both are used only a handful of times
// below, so a local alias would just be noise.

/** Type guard for the persisted value — ignores anything other
 *  than the two known tabs (defensive against manual localStorage
 *  edits and version skew across deploys). */
function isSahamTab(value: unknown): value is SahamTab {
  return value === "recap" || value === "sektor";
}

/** Type guard for the persisted date — accepts only ISO-shaped
 *  `YYYY-MM-DD` strings (anything else falls through to today).
 *  Defensive against manual localStorage edits, against a stale
 *  entry written by a build that used a different format, and
 *  against a future build that picks a different default. */
function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/**
 * Page entry — composes the `/saham` recap tab (default landing)
 * and the `/saham` sektor tab from the layout-level
 * `<TopicsProvider />` topic catalog. The saham topic id is
 * resolved via the shared `findSahamTopicId()` helper in
 * `lib/util/topicId.ts` (mirror of `findCryptoTopicId`).
 */
export default function SahamPage() {
  /** Sub-tab active: "recap" (default) | "sektor". The user's
   *  last selection is persisted to localStorage so navigating
   *  away and back (or a page reload) lands on the same tab
   *  rather than always defaulting to "recap". The state starts
   *  as `null` and is hydrated on mount to avoid an SSR/CSR
   *  markup mismatch — same pattern as `<ThemeToggle />`. */
  const [subTab, setSubTab] = useState<SahamTab | null>(null);
  // Selected date — starts as `null` so the write effect can tell
  // the pre-hydration render apart from a real "today" selection
  // (same `null`-sentinel trick used for `subTab` above). Consumers
  // fall back to `todayIsoDate()` until the persisted value lands.
  // The persisted value (if any) is hydrated from localStorage on
  // first mount, so navigating away and back to `/saham` (or a
  // page reload) restores the user's last view.
  const [isoDate, setIsoDate] = useState<string | null>(null);
  const effectiveDate = isoDate ?? todayIsoDate();
  console.log("effectiveDate", effectiveDate);

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
  } = useGetStocksTrending(effectiveDate);

  // Hydrate the persisted sub-tab on first mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.sahamTab);
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
      window.localStorage.setItem(STORAGE_KEYS.sahamTab, subTab);
    } catch {
      /* noop — storage may be full or disabled */
    }
  }, [subTab]);

  // Hydrate the persisted DatePicker selection on first mount —
  // mirrors the `subTab` pattern above. Default to today when no
  // value is persisted (or the persisted value fails the ISO
  // shape check), so the picker always opens on a valid day.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.sahamRecapDate);
      setIsoDate(isIsoDate(raw) ? raw : todayIsoDate());
    } catch {
      // localStorage may be disabled (private mode, blocked by
      // browser policy, etc.) — silently land on today.
      setIsoDate(todayIsoDate());
    }
  }, []);

  // Persist on every subsequent change. Same `null`-sentinel skip
  // as the `subTab` write effect above: the read effect owns the
  // first write, so this only fires once the user actually picks
  // a day. Writing `todayIsoDate()` on the pre-hydration render
  // would otherwise clobber whatever the user had previously
  // selected with the picker.
  useEffect(() => {
    if (isoDate === null) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.sahamRecapDate, isoDate);
    } catch {
      /* noop — storage may be full or disabled */
    }
  }, [isoDate]);

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
                    value={effectiveDate}
                    onChange={setIsoDate}
                    todayIso={todayIsoDate()}
                    maxLookbackDays={30}
                  />
                </div>

                <PalingBanyakDiberitakan
                  trending={trending}
                  trendingLoading={trendingLoading}
                  onRefresh={refreshTrending}
                  recapDate={effectiveDate}
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

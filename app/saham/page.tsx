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
import { useTrendingStories } from "@/lib/hooks/useTrendingStories";
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

  // "Paling banyak diberitakan" — live API, independent of the date
  // picker. The trending endpoint returns the current top stories, not
  // a date-keyed snapshot. Declared before the pre-hydration guard
  // below so the hook order is stable across renders.
  const { data: trending, isLoading: trendingLoading } = useTrendingStories();

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
                <EmitenStories storyLimit={3} />

                {/* Date picker + recap summary */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <DatePicker
                    value={isoDate}
                    onChange={setIsoDate}
                    todayIso={todayIsoDate()}
                    maxLookbackDays={30}
                  />
                  <span className="font-mono text-[10.5px] text-text-faint">
                    {trending.length} recap · {formatTanggalIndonesia(isoDate)}
                  </span>
                </div>

                <PalingBanyakDiberitakan
                  trending={trending}
                  trendingLoading={trendingLoading}
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

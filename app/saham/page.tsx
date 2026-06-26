"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DatePicker } from "@/components/DatePicker";
import { PalingBanyakDiberitakan } from "@/components/PalingBanyakDiberitakan";
import { Sidebar } from "@/components/Sidebar";
import { LeftSidebar } from "@/components/LeftSidebar";
import { MarketMood } from "@/components/MarketMood";
import { GeneralNewsFeed } from "@/components/GeneralNewsFeed";
import { MobileTopMovers } from "@/components/MobileTopMovers";
import { WatchlistSection } from "@/components/WatchlistSection";
import { SahamSubTabs } from "@/components/SahamSubTabs";
import { SektorSection } from "@/components/SektorSection";
import { useTrendingStories } from "@/lib/hooks/useTrendingStories";
import { getRecapsByDate, TODAY_ISO } from "@/lib/mock/recaps";
import { getMarketMoodByDate } from "@/lib/mock/market-mood";
import { formatTanggalIndonesia } from "@/lib/util/formatDate";

export default function SahamPage() {
  /** Sub-tab active: "recap" (default) | "sektor" */
  const [subTab, setSubTab] = useState<"recap" | "sektor">("recap");
  // Selected date — drives the date-picker recap count display.
  const [isoDate, setIsoDate] = useState<string>(TODAY_ISO);

  const recaps = useMemo(() => getRecapsByDate(isoDate), [isoDate]);
  const mood = useMemo(() => getMarketMoodByDate(isoDate), [isoDate]);

  // "Paling banyak diberitakan" — live API, independent of the date
  // picker. The trending endpoint returns the current top stories, not
  // a date-keyed snapshot.
  const { data: trending, isLoading: trendingLoading } = useTrendingStories();

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
            <MarketMood
              sentiment={mood.sentiment}
              sentimentLabel={mood.sentimentLabel}
              summary={mood.summary}
              factors={mood.factors}
              widgets={mood.widgets}
            />
            <div className="mt-3">
              <MobileTopMovers />
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
                {/* Date picker + recap summary */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <DatePicker
                    value={isoDate}
                    onChange={setIsoDate}
                    todayIso={TODAY_ISO}
                    maxLookbackDays={30}
                  />
                  <span className="font-mono text-[10.5px] text-text-faint">
                    {recaps.length} recap · {formatTanggalIndonesia(isoDate)}
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
                  <Sidebar />
                </div>
              </div>
            </div>

            {/* General news feed — ekonomi, pemerintah, politik (below the stock recap feed) */}
            <div className="mt-10">
              <GeneralNewsFeed isoDate={isoDate} />
            </div>
          </main>
          <Footer />
        </>
      )}

      {subTab === "sektor" && (
        <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5">
          <SektorSection />
          <p className="mt-6 text-center font-mono text-[10px] text-text-muted">
            Mau lihat semua 34 emiten? Buka{" "}
            <Link href="/trending" className="text-text-secondary hover:text-brand">
              /trending
            </Link>{" "}
            atau tambahkan ke watchlist dari halaman saham individual.
          </p>
        </main>
      )}
      <Footer />
    </>
  );
}
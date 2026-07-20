"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getTrending, type TrendingPeriod } from "@/lib/mock/trending";
import { TrendingPageHeader } from "./TrendingPageHeader";
import { TrendingPeriodTabs } from "./TrendingPeriodTabs";
import { TrendingStatStrip } from "./TrendingStatStrip";
import { TrendingList } from "./TrendingList";
import { computeTrendingStats } from "./trendingStats";

/**
 * `/trending` page — "Saham paling banyak dibicarakan" with a
 * per-period sort, aggregate stats, and a 20-row table.
 *
 * Composes the small widgets in this folder:
 *   - `<TrendingPageHeader />` — title + editorial description,
 *   - `<TrendingPeriodTabs />` — today / week / month switcher,
 *     state owned here,
 *   - `<TrendingStatStrip />` — 4-cell sentiment & volume strip,
 *   - `<TrendingList />` — the bordered table card that maps each
 *     row to a `<TrendingRow />`,
 *   - `computeTrendingStats()` — pure helper that aggregates
 *     sentiment counts + total articles from the resolved
 *     `TrendingStock[]`.
 *
 * `TrendingPage` is a client component because it owns the
 * active period state.
 */
export default function TrendingPage() {
  const [period, setPeriod] = useState<TrendingPeriod>("today");
  const rows = getTrending(period);
  const stats = computeTrendingStats(rows);

  return (
    <>
      <Navbar />

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5">
        {/* Back link */}
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-1.5 text-[12px] text-text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden />
          Kembali ke Saham
        </Link>

        <TrendingPageHeader />

        <TrendingPeriodTabs active={period} onChange={setPeriod} />

        <TrendingStatStrip
          positif={stats.positif}
          netral={stats.netral}
          negatif={stats.negatif}
          totalArticles={stats.totalArticles}
          rowCount={rows.length}
        />

        <TrendingList rows={rows} />

        {/* Footer note */}
        <p className="mt-4 text-center font-mono text-[10.5px] text-text-muted">
          Ranking diupdate tiap sesi perdagangan. Bukan rekomendasi investasi.
        </p>
      </main>
      <Footer />
    </>
  );
}

"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useGetStocksTrending } from "@/lib/hooks/useGetStocksTrending";
import { TrendingPageHeader } from "./TrendingPageHeader";
import { TrendingStatStrip } from "./TrendingStatStrip";
import { TrendingList } from "./TrendingList";
import { computeTrendingStats } from "./trendingStats";

/**
 * `/trending` page — "Saham paling banyak dibicarakan" with an
 * aggregate stats strip and a per-row table.
 *
 * Data source: live `useGetStocksTrending()` hook (no mock). The
 * hook returns `StockTrendingItem[]` — the same payload the new
 * `/stocks/stock/trending` endpoint serves. The stat strip +
 * list subscribe to the same array, so the totals stay in sync
 * with the rows.
 *
 * Composes the small widgets in this folder:
 *   - `<TrendingPageHeader />` — title + editorial description,
 *   - `<TrendingStatStrip />` — 4-cell sentiment & volume strip,
 *   - `<TrendingList />` — the bordered table card that maps each
 *     row to a `<TrendingRow />`,
 *   - `computeTrendingStats()` — pure helper that aggregates
 *     sentiment counts + total articles from the resolved
 *     `StockTrendingItem[]`.
 *
 * `TrendingPage` is a client component because the hook owns
 * its own fetch + state.
 */
export default function TrendingPage() {
  const { data: rows, isLoading } = useGetStocksTrending();
  const stats = computeTrendingStats(rows);

  return (
    <>
      <Navbar />

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5">
        {/* Back link */}
        <Link
          href="/saham"
          className="mb-3 inline-flex items-center gap-1.5 text-[12px] text-text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden />
          Kembali ke Saham
        </Link>

        <TrendingPageHeader />

        <TrendingStatStrip
          positif={stats.positif}
          netral={stats.netral}
          negatif={stats.negatif}
          totalArticles={stats.totalArticles}
          rowCount={rows.length}
        />

        <TrendingList rows={rows} isLoading={isLoading} />

        {/* Footer note */}
        <p className="mt-4 text-center font-mono text-[10.5px] text-text-muted">
          Ranking diupdate tiap sesi perdagangan. Bukan rekomendasi investasi.
        </p>
      </main>
      <Footer />
    </>
  );
}

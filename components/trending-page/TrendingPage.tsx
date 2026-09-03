"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useGetStocksTrending } from "@/lib/hooks/useGetStocksTrending";
import { EVENTS, track } from "@/lib/analytics-events";
import { TrendingPageHeader } from "./TrendingPageHeader";
import { TrendingStatStrip } from "./TrendingStatStrip";
import { TrendingList } from "./TrendingList";
import { computeTrendingStats } from "./trendingStats";

/**
 * `/trending` page — "Saham paling banyak dibicarakan" with an
 * aggregate stats strip and a per-row table.
 *
 * Data source: live `useGetStocksTrending()` hook. The hook
 * returns `StockTrendingItem[]` — the payload the new
 * `/stocks/stock/trending` endpoint serves. The stat strip and
 * the list subscribe to the same array, so the totals stay in sync
 * with the rows.
 *
 * Composes the widgets in this folder:
 *   - `<TrendingPageHeader />` — title + editorial description,
 *   - `<TrendingStatStrip />`  — 4-cell sentiment & volume strip,
 *   - `<TrendingList />`       — the bordered table card that maps
 *                                 each row to a `<TrendingRow />`,
 *   - `computeTrendingStats()` — pure helper that aggregates
 *                                 sentiment counts + total
 *                                 articles from the resolved
 *                                 `StockTrendingItem[]`.
 *
 * Client component because the hook owns its own fetch + state.
 */
export default function TrendingPage() {
  const { data: rows, isLoading, effectiveDate } = useGetStocksTrending();
  const stats = computeTrendingStats(rows);

  // One-shot page-view tracking. Distinct from the global
  // `page_view` because the page-level event carries the
  // snapshot date — GA4's report can then split
  // "visits per snapshot date" alongside the existing per-URL
  // pageview stream. Fires after mount only (not on every
  // render) so re-renders during the fetch don't double-count.
  useEffect(() => {
    track(EVENTS.trending_page_view, { recap_date: effectiveDate });
    // effectiveDate is stable per mount (the hook freezes it
    // via useState(() => hariIniIso())) — safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

        <TrendingList rows={rows} isLoading={isLoading} recapDate={effectiveDate} />

        {/* Footer note */}
        <p className="mt-4 text-center font-mono text-[10.5px] text-text-muted">
          Ranking diupdate tiap sesi perdagangan. Bukan rekomendasi investasi.
        </p>
      </main>
      <Footer />
    </>
  );
}

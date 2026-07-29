"use client";

import { ArrowUpRight, Flame, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { StockTrendingItem } from "@/lib/api";
import type { DailyRecap } from "@/lib/mock/recaps";
import { toSentimen } from "@/lib/util/sentiment";
import { Shimmer } from "../Shimmer";
import { StockCard } from "../stock-card";

/**
 * "Paling banyak diberitakan" — the top trending tickers list on
 * `/saham`. Renders a single `<section>` with a Flame-icon header and
 * a vertical stack of `<StockCard variant="list" />` cards driven by
 * the live trending-tickers API.
 *
 * Data flow (lives in the parent page, not here):
 *   `useGetStocksTrending()` → `api.getStocksTrending()` →
 *   `GET /stocks/stock/trending?date=…` → `mapStockTrendingItemToRecap`
 *   → `<StockCard>`.
 *
 * The parent page does the fetch + mapping and passes the resolved
 * `StockTrendingItem[]` + loading flag in. This component is purely
 * presentational — it knows about the section header, the loading
 * skeleton, the empty state, and the "see all" link, nothing else.
 *
 * Three render branches:
 *   - loading → 3 stacked skeleton cards (matches feed's `space-y-2.5` rhythm)
 *   - loaded, has data → top 10 `<StockCard>` items, ranked `#01`–`#10`
 *     (the underlying fetch returns 20; we cap the visible list to 10
 *     and show a "Lihat 20 teratas" link when more are available)
 *   - loaded, no data → header only, card area collapses
 */

/** How many trending cards to render inline. The full 20 are still
 *  fetched in the background; the rest live behind /trending. */
const VISIBLE_TRENDING_LIMIT = 10;

interface PalingBanyakDiberitakanProps {
  trending: StockTrendingItem[];
  trendingLoading: boolean;
  onRefresh: () => void;
}

/**
 * Map a `StockTrendingItem` (API wire shape) → `DailyRecap` (the shape
 * `StockCard` consumes). Only the fields `StockCard` reads are
 * filled in; everything else is left at its default.
 *
 * - `ticker`                    → `id` (used as the React key + the
 *                                  `StockCard` `id` prop; tickers are
 *                                  unique within a single snapshot) +
 *                                  `sahamKode`
 * - `description`               → `ringkasan` (one-paragraph AI recap)
 * - `sentiment` (en)            → `sentimen` (id) via `toSentimen`
 * - `article_count`             → `jumlahBerita`
 * - `sources[]` ({name,count})  → `sumber[]` ({media,jumlah}) so
 *                                  `<SourceBar>` renders the
 *                                  per-publisher breakdown. `logo`
 *                                  isn't in the wire shape and
 *                                  `SourceBar` doesn't read it, so
 *                                  it's left empty.
 *
 * `tanggal` isn't per-item on the trending endpoint — the snapshot
 * is keyed by the `date` query string, not by line. The parent
 * passes the date via the standard recap-date contract; we leave
 * `tanggal` empty so `StockCard` doesn't render a misleading date
 * in the header. If a future call wants the date on each card,
 * parameterize this mapper with the snapshot date.
 */
function mapStockTrendingItemToRecap(item: StockTrendingItem): DailyRecap {
  return {
    id: item.ticker,
    tanggal: "",
    sahamKode: item.ticker,
    companyName: item.company_name,
    ringkasan: item.description,
    sentimen: toSentimen(item.sentiment),
    jumlahBerita: item.article_count,
    sumber: (item.sources ?? []).map((s) => ({
      media: s.name,
      logo: "",
      jumlah: s.article_count,
    })),
  };
}

/**
 * Skeleton placeholder that mimics the `StockCard variant="list"`
 * layout — gradient backdrop on the left, meta + summary on the
 * right — so the section doesn't shift when data lands.
 */
function PalingBanyakSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg-secondary">
      <div className="flex h-full min-h-[140px]">
        <div className="hidden w-[150px] shrink-0 bg-bg-tertiary sm:block" />
        <div className="flex flex-1 flex-col gap-2.5 p-3.5 sm:p-4">
          <div className="flex items-center gap-1.5">
            <Shimmer className="h-3 w-12" />
            <Shimmer className="h-3 w-20" />
            <Shimmer className="h-3 w-16" />
          </div>
          <div className="space-y-1.5">
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PalingBanyakDiberitakan({
  trending,
  trendingLoading,
  onRefresh,
}: PalingBanyakDiberitakanProps) {
  return (
    <section aria-label="Paling banyak diberitakan">
      <div className="mb-2 flex items-center gap-1.5">
        <Flame className="h-3.5 w-3.5 text-brand" aria-hidden />
        <span className="label text-text-secondary">
          Paling banyak diberitakan
        </span>
      </div>
      {trendingLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <PalingBanyakSkeleton key={i} />
          ))}
        </div>
      ) : trending.length > 0 ? (
        <div className="space-y-2.5">
          {trending.slice(0, VISIBLE_TRENDING_LIMIT).map((item, i) => (
            <StockCard
              key={item.ticker}
              recap={mapStockTrendingItemToRecap(item)}
              variant="list"
              rank={i + 1}
              id={item.ticker}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-bg-secondary px-4 py-8 text-center">
          <p className="text-[12.5px] text-text-muted">
            Belum ada saham yang banyak diberitakan.
          </p>
          <p className="mt-1 font-mono text-[10.5px] text-text-faint">
            Coba pilih tanggal lain atau muat ulang beberapa saat lagi.
          </p>
          <button
            type="button"
            onClick={onRefresh}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-tertiary px-3.5 py-2 text-[12px] font-semibold text-text-secondary transition-colors hover:border-brand hover:text-brand"
          >
            <RefreshCw className="h-3 w-3" aria-hidden />
            Muat ulang
          </button>
        </div>
      )}

      {/* "See all" link — always visible once the section is loaded,
          regardless of how many items the API returned. The full
          list lives behind /trending; the cache holds it either way. */}
      {!trendingLoading && (
        <div className="flex justify-center pt-4">
          <Link
            href="/trending"
            className="group inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-secondary px-3.5 py-2 text-[12.5px] font-semibold text-text-secondary transition-all hover:border-brand hover:text-brand"
          >
            Lihat 20 teratas
            <ArrowUpRight
              className="h-3 w-3 transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
              aria-hidden
            />
          </Link>
        </div>
      )}
    </section>
  );
}
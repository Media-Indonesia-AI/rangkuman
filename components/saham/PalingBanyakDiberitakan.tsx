"use client";

import { ArrowUpRight, Flame, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { StockTrendingItem } from "@/lib/api";
import type { DailyRecap } from "@/lib/recap";
import { hariIniIso } from "@/lib/util/formatDate";
import { toSentimen } from "@/lib/util/sentiment";
import { Shimmer } from "../Shimmer";
import { StockCard } from "../stock-card";

/** How many trending cards to render inline. The full 20 are still
 *  fetched in the background; the rest live behind /trending. */
const VISIBLE_TRENDING_LIMIT = 10;

/** Number of skeleton cards rendered while the trending fetch is
 *  in flight. Matches the visible limit so the section doesn't
 *  shift when the real cards land. */
const SKELETON_COUNT = 3;

interface PalingBanyakDiberitakanProps {
  trending: StockTrendingItem[];
  trendingLoading: boolean;
  onRefresh: () => void;
  /** ISO date (`YYYY-MM-DD`) of the trending snapshot — the same
   *  value the parent passed to `useGetStocksTrending()`. Forwarded
   *  to each `<StockCard />` as `recapDate` so the deep-link lands
   *  on `/stock/{kode}/{recapDate}` (the snapshot the user is
   *  currently looking at), not on whatever the detail page
   *  considers "today". */
  recapDate?: string;
}

// ── Wire → domain mapper ───────────────────────────────────────────

/**
 * Map a `StockTrendingItem` (API wire shape) → `DailyRecap` (the shape
 * `StockCard` consumes). Only the fields `StockCard` reads are filled
 * in; everything else is left at its default.
 *
 * `tanggal` isn't per-item on the trending endpoint — the snapshot is
 * keyed by the `date` query string, not by line. The parent passes
 * the date via the standard recap-date contract; we leave `tanggal`
 * empty so `StockCard` doesn't render a misleading date in the header.
 * Logo is also empty because `SourceBar` doesn't read it.
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

// ── Sub-components ─────────────────────────────────────────────────

/** Flame-icon + label header used at the top of the section. */
function PalingBanyakHeader() {
  return (
    <div className="mb-2 flex items-center gap-1.5">
      <Flame className="h-3.5 w-3.5 text-brand" aria-hidden />
      <span className="label text-text-secondary">
        Paling banyak diberitakan
      </span>
    </div>
  );
}

/** Skeleton placeholder that mimics the `StockCard variant="list"`
 *  layout so the section doesn't shift when data lands. */
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

/** Stack of skeleton cards for the loading state. */
function PalingBanyakLoading() {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <PalingBanyakSkeleton key={i} />
      ))}
    </div>
  );
}

/** Top-N trending cards, ranked `#01`–`#N`. The prop is the full
 *  20-item array; the slice happens here so the `ShowMap` consumer
 *  always reads the trimmed list. */
function PalingBanyakCards({
  trending,
  recapDate,
}: {
  trending: StockTrendingItem[];
  recapDate?: string;
}) {
  return (
    <div className="space-y-2.5">
      {trending.slice(0, VISIBLE_TRENDING_LIMIT).map((item, i) => (
        <StockCard
          key={item.ticker}
          recap={mapStockTrendingItemToRecap(item)}
          variant="list"
          rank={i + 1}
          recapDate={recapDate}
        />
      ))}
    </div>
  );
}

/** Empty state with a retry button. The hint copy nudges the user
 *  toward both the date picker and a manual refresh because the
 *  empty case is ambiguous — it could be a quiet session day or a
 *  transient fetch failure. */
function PalingBanyakEmpty({ onRefresh }: { onRefresh: () => void }) {
  return (
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
  );
}

/** "Lihat 20 teratas" CTA pointing to `/trending`. Rendered only
 *  for the today snapshot — see the parent for the why. */
function SeeAllLink({ show }: { show: boolean }) {
  if (!show) return null;
  return (
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
  );
}

// ── Main component ─────────────────────────────────────────────────

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
 * presentational — it composes:
 *   - `<PalingBanyakHeader />` — section title
 *   - `<PalingBanyakLoading />` — skeleton stack while fetching
 *   - `<PalingBanyakCards />`  — top 10 `<StockCard>` items
 *   - `<PalingBanyakEmpty />`  — empty state with retry button
 *   - `<SeeAllLink />`         — "Lihat 20 teratas" → /trending
 */
export function PalingBanyakDiberitakan({
  trending,
  trendingLoading,
  onRefresh,
  recapDate,
}: PalingBanyakDiberitakanProps) {
  // See-all link hides on a non-today snapshot: the recap-date
  // picker can park the user on a past day, in which case the API
  // returns whatever was trending then, and the
  // "Lihat 20 teratas" CTA would mislead them into a
  // today's-only view.
  const isToday = recapDate === hariIniIso();
  const hasMore = trending.length > VISIBLE_TRENDING_LIMIT;
  const showSeeAll = !trendingLoading && hasMore && isToday;

  return (
    <section aria-label="Paling banyak diberitakan">
      <PalingBanyakHeader />

      {trendingLoading ? (
        <PalingBanyakLoading />
      ) : trending.length > 0 ? (
        <PalingBanyakCards trending={trending} recapDate={recapDate} />
      ) : (
        <PalingBanyakEmpty onRefresh={onRefresh} />
      )}

      <SeeAllLink show={showSeeAll} />
    </section>
  );
}

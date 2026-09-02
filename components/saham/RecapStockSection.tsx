"use client";

import { Flame } from "lucide-react";
import { EmitenStories } from "./EmitenStories/EmitenStories";
import { DatePicker } from "@/components/DatePicker";
import { LatestHeadlines } from "@/components/latest-headlines/LatestHeadlines";
import { MarketMood } from "@/components/MarketMood";
import { LeftSidebar } from "./LeftSidebar";
import { MobileTopMovers } from "./MobileTopMovers";
import { PalingBanyakDiberitakan } from "./PalingBanyakDiberitakan";
import { RecapLoginPrompt } from "./RecapLoginPrompt";
import { WatchlistSection } from "./WatchlistSection";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { hariIniIso } from "@/lib/util/formatDate";
import type { StockTrendingItem } from "@/lib/api";

interface RecapStockSectionProps {
  /** Trending snapshot for the recap date. The host page owns the
   *  `useGetStocksTrending` lifecycle (including refetch on date
   *  change) so the date picker and the list stay in lockstep. */
  trending: StockTrendingItem[];
  /** Loading state from `useGetStocksTrending`. Forwards to
   *  `<PalingBanyakDiberitakan />` so it can swap in skeletons
   *  instead of an empty list while the snapshot is in flight. */
  trendingLoading: boolean;
  /** Manual refresh handler — passed straight through to the
   *  trending widget so the empty-state retry keeps working. */
  onRefresh: () => void;
  /** ISO date (`YYYY-MM-DD`) of the recap snapshot currently on
   *  screen. Required — the host page always has a non-null
   *  `effectiveDate` from `useRecapDateSession()`. */
  recapDate: string;
  /** Date-picker change handler. The page owns the date state, so
   *  the host wires this to its `setIsoDate` (and the trending
   *  hook re-fires on the next render via the `effectiveDate` dep). */
  onDateChange: (iso: string) => void;
  /** Topic id from the topics catalog, forwarded to
   *  `<EmitenStories />` so the recap stays on the "saham" scope. */
  topicId?: string;
  className?: string;
}

/**
 * Recap-stock section for the `/saham` "Recap" sub-tab. Mirrors
 * `<SektorSection />`'s role: it owns the entire body that flips
 * between recap and sektor, so the page composition reduces to:
 *
 *   - `subTab === "recap"`  → this widget (everything below)
 *   - `subTab === "sektor"` → `<SektorSection />`
 *
 * Data flow is one-way: the host page runs
 * `useGetStocksTrending(effectiveDate)` and re-fetches on date
 * change, so the section accepts the resolved props instead of
 * opening its own hook. That keeps the date picker and the
 * trending list in lockstep with whatever snapshot the page is
 * showing.
 *
 * Render branches, in priority order:
 *   1. `user === null` → `<RecapLoginPrompt />`. The trending
 *      and stories endpoints are both auth-gated; without the
 *      gate anonymous visitors would see two parallel 401
 *      failures (empty trending list + null stories). The prompt
 *      replaces the entire tree.
 *   2. otherwise → top strip + `<main>` with the 3-column grid.
 *
 * Stories fetch is owned by `<EmitenStories />` itself (it
 * returns `null` for anonymous users and a skeleton for
 * `isLoading`), so the section doesn't need its own story-
 * loading branch.
 *
 * `className` is applied to a single wrapper `<div>` for both
 * branches so a future caller can style the section the same
 * way regardless of auth state.
 */
export function RecapStockSection({
  trending,
  trendingLoading,
  onRefresh,
  recapDate,
  onDateChange,
  topicId,
  className,
}: RecapStockSectionProps) {
  const trendingCount = trendingLoading ? null : trending.length;

  return (
    <div className={className}>
      {/* Top strip — market mood + mobile top movers + mobile
          headlines. Desktop pushes the per-widget blocks into the
          side rails below, so this strip is intentionally mobile-
          scoped (`xl:hidden` on the headlines block). */}
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-5">
        <MarketMood />
        <div className="mt-3">
          <MobileTopMovers />
        </div>
        <div className="mt-3 xl:hidden">
          <LatestHeadlines />
        </div>
      </div>

      <main
        aria-label="Recap harian saham"
        className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5"
      >
        {/* Watchlist preview — renders `null` when empty so
            logged-out visitors and new accounts skip this row
            entirely without leaving a stale empty-state shell. */}
        <WatchlistSection />

        <div className="grid gap-6 xl:grid-cols-[240px_1fr_320px]">
          {/* Left rail — desktop top movers, sticky under navbar. */}
          <div className="hidden xl:block">
            <div className="sticky top-20">
              <LeftSidebar />
            </div>
          </div>

          {/* Feed column */}
          <div className="min-w-0">
            <section className="space-y-5">
              <SectionHeader count={trendingCount} />

              {/* Featured story + list rows — owns its own loading
                  and empty branches. `storyLimit={3}` matches the
                  recap composition (one featured + two rows). */}
              <EmitenStories storyLimit={3} topicId={topicId} />

              {/* Date picker controls the trending snapshot below.
                  `onDateChange` is the host's `setIsoDate` (which
                  also triggers the trending re-fetch via the
                  `effectiveDate` dep). */}
              <DatePicker
                value={recapDate}
                onChange={onDateChange}
                todayIso={hariIniIso()}
                maxLookbackDays={30}
              />

              <PalingBanyakDiberitakan
                trending={trending}
                trendingLoading={trendingLoading}
                onRefresh={onRefresh}
                recapDate={recapDate}
              />
            </section>
          </div>

          {/* Right rail — desktop only, market mood + headlines +
              newsletter. Hidden below `xl`. */}
          <div className="hidden xl:block">
            <div className="sticky top-20">
              <LatestHeadlines />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/** Section title strip — `Flame` icon + "Recap Harian" label +
 *  count meta + H2 (the day's recap tagline). When `count` is
 *  `null` (loading), the meta row drops the count so the strip
 *  height stays consistent. */
function SectionHeader({ count }: { count: number | null }) {
  const loading = count === null;
  return (
    <header className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b border-border-strong pb-2">
      <div>
        <div className="mb-0.5 flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5 text-brand" aria-hidden />
          <span className="label text-text-secondary">Recap Harian</span>
          {!loading && (
            <span className="font-mono text-[10.5px] text-text-muted">
              · {count} emiten
            </span>
          )}
        </div>
        <h2 className="text-[15px] font-bold tracking-tight text-text-primary">
          Cerita &amp; saham yang paling banyak diberitakan
        </h2>
      </div>
    </header>
  );
}

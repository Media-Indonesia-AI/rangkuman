"use client";

import { Flame } from "lucide-react";
import { EmitenStories } from "./EmitenStories/EmitenStories";
import { DatePicker } from "@/components/DatePicker";
import { LatestHeadlines } from "@/components/latest-headlines/LatestHeadlines";
import { MarketMood } from "@/components/MarketMood";
import { LeftSidebar } from "./LeftSidebar";
import { MobileTopMovers } from "./MobileTopMovers";
import { PalingBanyakDiberitakan } from "./PalingBanyakDiberitakan";
import { WatchlistSection } from "./WatchlistSection";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { hariIniIso } from "@/lib/util/formatDate";
import { cn } from "@/lib/utils";
import type { StockTrendingItem } from "@/lib/api";

interface RecapStockSectionProps {
  /** Trending stocks for the recap date. Passed in by the host
   *  page so the section stays a pure consumer — the page owns
   *  the `useGetStocksTrending` lifecycle (including the
   *  refresh-after-date-change behavior) so the picker and the
   *  list always agree on which snapshot is on screen. */
  trending: StockTrendingItem[];
  /** Loading state from `useGetStocksTrending`. Forwards to
   *  `<PalingBanyakDiberitakan />` so it can swap in skeletons
   *  instead of an empty list while the snapshot is in flight. */
  trendingLoading: boolean;
  /** Manual refresh handler from the host's `useGetStocksTrending`.
   *  Passed straight through to the trending widget so the empty-
   *  state retry button keeps working after extraction. */
  onRefresh: () => void;
  /** ISO date (`YYYY-MM-DD`) of the recap snapshot currently on
   *  screen. Drives the trending widget's `recapDate` prop and the
   *  date picker's selected value. Required — the host page always
   *  has a non-null `effectiveDate` from `useRecapDateSession()`. */
  recapDate: string;
  /** Date-picker change handler. The page owns the date state, so
   *  the host wires this to its `setIsoDate` (and the trending
   *  hook re-fires on the next render via the `effectiveDate`
   *  dep). */
  onDateChange: (iso: string) => void;
  /** Topic id from the topics catalog, forwarded to
   *  `<EmitenStories />` so the recap stays on the "saham" scope
   *  (matches what the page passes today). */
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
 * The widget returns a fragment with three siblings, matching
 * what the page used to inline:
 *
 *   1. **Top strip** (mobile-first): market mood + mobile top
 *      movers + mobile-only latest-headlines. Each widget owns
 *      its own loading/empty states; this strip just composes
 *      them.
 *   2. **`<main>`**: watchlist (renders `null` when empty, so
 *      no header chrome for visitors without one) + the 3-column
 *      desktop grid (left rail = top movers, center = the recap
 *      feed, right rail = latest headlines).
 *   3. **Recap feed** (center column on `xl+`, full width below):
 *      section header → featured stories → date picker →
 *      trending stocks. The header is the recap section's own
 *      `<SectionHeader />` — distinct from the page-level
 *      `<SahamSubTabs />` above it.
 *
 * Data flow is one-way: the host page runs
 * `useGetStocksTrending(effectiveDate)` and re-fetches on date
 * change, so the section accepts the resolved `trending` /
 * `trendingLoading` / `onRefresh` / `recapDate` / `onDateChange`
 * / `topicId` props instead of opening its own hook. That keeps
 * the date picker and the trending list in lockstep with
 * whatever snapshot the page is showing.
 *
 * Render branches, in priority order:
 *   1. `user === null` → `<RecapLoginPrompt />`. The
 *      `useGetStocksTrending` hook is auth-gated; without the
 *      gate anonymous visitors would see the empty-state shell
 *      in the trending list and a login wall mid-feed on the
 *      stories. The prompt replaces the entire tree.
 *   2. otherwise → the populated fragment above.
 *
 * Stories fetch is owned by `<EmitenStories />` itself (it
 * returns `null` for anonymous users and a skeleton for
 * `isLoading`), so the section doesn't need its own story-
 * loading branch — it just renders the widget and lets it own
 * its own states.
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
  const user = useCurrentUser();

  if (user === null) {
    return (
      <div className={className}>
        <RecapLoginPrompt />
      </div>
    );
  }

  const trendingCount = trendingLoading ? null : trending.length;

  return (
    <>
      {/* Top strip — market mood + (mobile) top movers + (mobile)
          latest headlines. Lays out as a single column on phones,
          desktop pushes the per-widget blocks into the side rails
          below so this strip's content is intentionally mobile-
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

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5">
        {/* Watchlist preview — only renders when the user is
            logged in and the watchlist isn't empty (the widget
            returns `null` otherwise), so logged-out visitors and
            new accounts skip this row entirely without leaving
            a stale empty-state shell. */}
        <WatchlistSection />

        <div className="grid gap-6 xl:grid-cols-[240px_1fr_320px]">
          {/* Left rail — desktop top movers, sticky under the
              navbar. Hidden below `xl`. */}
          <div className="hidden xl:block">
            <div className="sticky top-20">
              <LeftSidebar />
            </div>
          </div>

          {/* Feed column */}
          <div className="min-w-0">
            <section
              aria-label="Recap harian saham"
              className={cn("space-y-5", className)}
            >
              <SectionHeader count={trendingCount} />

              {/* Featured story + list rows — owns its own loading
                  and empty branches internally. `storyLimit={3}`
                  mirrors the recap composition (one featured +
                  two rows). */}
              <EmitenStories storyLimit={3} topicId={topicId} />

              {/* Date picker controls the trending snapshot
                  below. The page owns the date state, so
                  `onDateChange` is the host's `setIsoDate` (which
                  also triggers the trending re-fetch via the
                  `effectiveDate` dep on `useGetStocksTrending`). */}
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

          {/* Right sidebar — desktop only, contains market mood +
              headlines + newsletter. Hidden below `xl`. */}
          <div className="hidden xl:block">
            <div className="sticky top-20">
              <LatestHeadlines />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

// ─── Subcomponents ────────────────────────────────────────────

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

/** Auth-gated shell shown to anonymous visitors. Replaces the
 *  entire recap tree (top strip + main) with a single panel so
 *  the 401-on-trending and 401-on-stories failures both have
 *  one consistent surface. */
function RecapLoginPrompt() {
  return (
    <section
      aria-label="Recap saham — login dulu"
      className="rounded-lg border border-border bg-bg-secondary px-4 py-10 text-center"
    >
      <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-text-muted">
        Recap saham
      </p>
      <p className="mt-2 text-[13px] font-semibold text-text-primary">
        Masuk dulu untuk lihat recap harian
      </p>
      <p className="mt-1 text-[11.5px] leading-relaxed text-text-muted">
        Cerita emiten dan saham yang paling banyak diberitakan
        hanya tersedia untuk anggota.
      </p>
    </section>
  );
}
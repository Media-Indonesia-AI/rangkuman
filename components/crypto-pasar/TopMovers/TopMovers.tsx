"use client";

import { BarChart3, TrendingDown, TrendingUp } from "lucide-react";
import { useCoinTopTickers } from "@/lib/hooks/useCoinTopTickers";
import { TopMoverGroup } from "./TopMoverGroup";
import { TopMoversError } from "./TopMoversError";
import { TopMoversLoginPrompt } from "./TopMoversLoginPrompt";
import { TopMoversSkeleton } from "./TopMoversSkeleton";

/** Section header strip — outer "Top Movers 24 jam" title. The
 *  gainer / loser split below carries its own sub-headers. */
function TopMoversHeader() {
  return (
    <header className="mb-3 flex items-end justify-between border-b border-border-strong pb-1.5">
      <div>
        <div className="mb-0.5 flex items-center gap-1.5">
          <BarChart3 className="h-3.5 w-3.5 text-brand" aria-hidden />
          <h2 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
            Top Movers
          </h2>
        </div>
      </div>
    </header>
  );
}

/**
 * Top Movers section for the Pasar tab — fetches the day's
 * `top-gainer` and `top-looser` groups via `useCoinTopTickers`
 * and renders them as two stacked sub-sections. Renders one of:
 *
 *   - `loading`           → `<TopMoversSkeleton />`
 *   - `error` + `401`     → `<TopMoversLoginPrompt />`. The
 *      endpoint is auth-gated, so a logged-out visitor or an
 *      expired session both land here; the prompt replaces
 *      the gainer/loser grid with a clear "log in" CTA.
 *   - `error` (any other) → `<TopMoversError />` with retry
 *   - `ready`             → `<TopMoverGroup />` × 2 (gainer, loser)
 */
export function TopMovers() {
  const { state, refetch } = useCoinTopTickers();

  // 401 short-circuit — same convention as
  // `<MobileTopMovers />` / `<LeftSidebar />`: surface the
  // login prompt instead of the generic error panel so the
  // user sees a clear "log in to see this" CTA.
  const isUnauthorized = state.kind === "error" && state.status === 401;
  const isOtherError = state.kind === "error" && state.status !== 401;

  return (
    <section aria-label="Top movers">
      <TopMoversHeader />

      {state.kind === "loading" && <TopMoversSkeleton />}
      {isUnauthorized && <TopMoversLoginPrompt />}
      {isOtherError && (
        <TopMoversError message={state.message} onRetry={refetch} />
      )}
      {state.kind === "ready" && (
        <div className="space-y-4">
          <TopMoverGroup
            title="Top Gainer"
            tone="bullish"
            Icon={TrendingUp}
            coins={state.gainers}
          />
          <TopMoverGroup
            title="Top Looser"
            tone="bearish"
            Icon={TrendingDown}
            coins={state.losers}
          />
        </div>
      )}
    </section>
  );
}

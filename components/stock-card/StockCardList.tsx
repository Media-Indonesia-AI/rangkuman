"use client";

import { Clock } from "lucide-react";
import { SentimentBadge } from "@/components/SentimentBadge";
import { StockCardActions } from "./StockCardActions";
import { StockCardFooter } from "./StockCardFooter";
import { StockCardHero } from "./StockCardHero";
import { StockCardOverlayLink } from "./StockCardOverlayLink";
import { cn } from "@/lib/utils";
import { formatSingkat } from "@/lib/util/formatDate";
import { pickHeroGradient } from "@/lib/util/heroGradient";
import type { DailyRecap } from "@/lib/recap";

interface StockCardListProps {
  /** Recap data — every field is rendered on the card. */
  recap: DailyRecap;
  /** Card's deep-link href, including the optional `?id=` query
   *  param when the parent knows the backend headline id. */
  href: string;
  /** Optional 1-based rank rendered in both the desktop hero
   *  and the mobile compact header. */
  rank?: number;
  /** Optional extra classes appended to the card container. */
  className?: string;
}

/**
 * List (responsive) `<StockCard />` variant — the mobile + desktop
 * responsive card used in feed lists like `<PalingBanyakDiberitakan />`.
 *
 * Two layouts share the same data:
 *
 *   - **Desktop** (`sm:` and up): hero panel on the left (rank +
 *     ticker), then a meta line (date · articles · media) +
 *     `<StockCardActions />` group on the right, summary in the
 *     middle, and the standard sources + "Lihat recap" CTA footer.
 *   - **Mobile** (`< sm`): the hero panel is hidden. The mobile
 *     header renders `#NN` + ticker + sentiment inline; the
 *     mobile footer combines the date + articles meta with the
 *     save/share actions (since the desktop meta line is hidden).
 *
 * The split exists because the hero panel only fits at ≥640px
 * and we don't want to duplicate the ticker there. The mobile
 * footer combines meta + actions to avoid stacking two rows in
 * the already-tight mobile viewport.
 */
export function StockCardList({
  recap,
  href,
  rank,
  className,
}: StockCardListProps) {
  const heroGradient = pickHeroGradient(recap.sahamKode);

  return (
    <article
      className={cn(
        "group relative flex overflow-hidden rounded-lg border border-border bg-bg-secondary transition-all duration-200",
        "hover:border-border-strong hover:shadow-card-hover",
        className,
      )}
    >
      <StockCardHero
        heroGradient={heroGradient}
        rank={rank}
        ticker={recap.sahamKode}
        variant="list"
        companyName={recap.companyName}
      />

      {/* Right side: body */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {/* Mobile-only compact header (rank + ticker + sentiment) */}
        <div className="mb-1.5 flex items-center justify-between gap-2 sm:hidden">
          <div className="group/link flex min-w-0 flex-1 items-baseline gap-2">
            {rank !== undefined && (
              <span className="font-mono text-[10px] font-semibold text-text-faint num-tabular">
                #{String(rank).padStart(2, "0")}
              </span>
            )}
            <h2 className="font-mono text-[18px] font-bold leading-none tracking-tighter text-text-primary group/link:text-brand">
              {recap.sahamKode}
            </h2>
          </div>
          <div className="relative z-10">
            <SentimentBadge sentiment={recap.sentimen} size="sm" />
          </div>
        </div>

        {/* Desktop meta line + actions */}
        <div className="mb-2 hidden items-start justify-between gap-2 sm:flex">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono text-[10.5px] text-text-muted">
            {recap.tanggal && (
              <>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" aria-hidden />
                  <span>{formatSingkat(recap.tanggal)}</span>
                </span>
                <span aria-hidden>·</span>
              </>
            )}
            <span className="num-tabular text-text-secondary">
              {recap.jumlahBerita} artikel
            </span>
            <span aria-hidden>·</span>
            <span className="num-tabular text-text-secondary">
              {recap.sumber.length} media
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <SentimentBadge sentiment={recap.sentimen} size="sm" />
            <StockCardActions
              tone="dark"
              href={href}
              variant="xs"
              title={`Rangkuman — ${recap.ringkasan}`}
            />
          </div>
        </div>

        {/* Summary */}
        <p className="line-clamp-3 text-[12.5px] leading-snug text-text-secondary sm:line-clamp-3 sm:text-[13px] sm:leading-[1.55] sm:text-text-primary">
          {recap.ringkasan}
        </p>

        {/* Mobile-only footer: date · articles + actions */}
        <div className="mt-1.5 flex items-center justify-between gap-2 sm:hidden">
          <p className="inline-flex items-center gap-1.5 font-mono text-[10.5px] text-text-muted">
            {recap.tanggal && (
              <>
                <Clock className="h-2.5 w-2.5" aria-hidden />
                <span>{formatSingkat(recap.tanggal)}</span>
                <span aria-hidden>·</span>
              </>
            )}
            <span className="num-tabular text-text-secondary">
              {recap.jumlahBerita} artikel
            </span>
          </p>
          <StockCardActions
            tone="dark"
            href={href}
            variant="xs"
            title={`Rangkuman — ${recap.ringkasan}`}
          />
        </div>

        {/* Desktop footer: sources + explicit "Lihat recap" CTA.
            Both wrappers sit at z-10 so they stay clickable above
            the stretched card link — same URL, but the explicit
            button gives a clear visual affordance. */}
        <div className="mt-auto hidden sm:block">
          <StockCardFooter
            sumber={recap.sumber}
            href={href}
            ctaLabel="Lihat recap"
          />
        </div>
      </div>

      <StockCardOverlayLink href={href} label={recap.sahamKode} />
    </article>
  );
}

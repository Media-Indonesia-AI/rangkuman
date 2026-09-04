"use client";

import { Clock } from "lucide-react";
import { SentimentBadge } from "@/components/SentimentBadge";
import { StockCardActions } from "./StockCardActions";
import { StockCardFooter } from "./StockCardFooter";
import { StockCardHero } from "./StockCardHero";
import { StockCardOverlayLink } from "./StockCardOverlayLink";
import { cn } from "@/lib/utils";
import { formatTanggalIndonesia } from "@/lib/util/formatDate";
import { pickHeroGradient } from "@/lib/util/heroGradient";
import type { DailyRecap } from "@/lib/recap";

interface StockCardFeaturedProps {
  /** Recap data — every field is rendered on the card. */
  recap: DailyRecap;
  /** Card's deep-link href, including the optional `?id=` query
   *  param when the parent knows the backend headline id. */
  href: string;
  /** Optional 1-based rank rendered as "#01" / "#02" in the
   *  hero panel. */
  rank?: number;
  /** Optional extra classes appended to the card container. */
  className?: string;
}

/**
 * Featured (large hero) `<StockCard />` variant — the wide,
 * hero-driven card used in slot-1 / hero spots. Layout:
 *
 *   ┌─────────────┬────────────────────────────────────┐
 *   │             │ 🕒 long date · 5 artikel · 4 media │
 *   │   TICKER    │                  · positif   💾 ⤴ │
 *   │  (hero)     │ Recap summary wraps to 3 lines... │
 *   │             │ ────────────────────────────────   │
 *   │             │ [media] [media] [media]  Lihat ↗   │
 *   └─────────────┴────────────────────────────────────┘
 *
 * Same stretched-overlay link + z-10 button pattern as the
 * other variants. Long-form date (`formatTanggalIndonesia`)
 * instead of the short one, since the wide card has room for
 * the full "Selasa, 7 Juni 2026" string.
 */
export function StockCardFeatured({
  recap,
  href,
  rank,
  className,
}: StockCardFeaturedProps) {
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
        variant="featured"
      />

      {/* Right side: body */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden />
              {formatTanggalIndonesia(recap.tanggal)}
            </span>
            <span aria-hidden>·</span>
            <span className="font-mono font-semibold num-tabular text-text-secondary">
              {recap.jumlahBerita} artikel
            </span>
            <span aria-hidden>·</span>
            <span className="font-mono num-tabular text-text-secondary">
              {recap.sumber.length} media
            </span>
            <span aria-hidden>·</span>
            <SentimentBadge sentiment={recap.sentimen} size="sm" />
          </div>
          <StockCardActions
            tone="dark"
            href={href}
            title={`${recap.sahamKode} — Rangkuman`}
          />
        </div>

        <p className="line-clamp-3 text-[13px] leading-[1.55] text-text-primary">
          {recap.ringkasan}
        </p>

        <StockCardFooter
          sumber={recap.sumber}
          href={href}
          ctaLabel="Lihat recap"
        />
      </div>

      <StockCardOverlayLink href={href} label={recap.sahamKode} />
    </article>
  );
}

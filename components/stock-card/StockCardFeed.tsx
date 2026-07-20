"use client";

import { Clock } from "lucide-react";
import { SentimentBadge } from "@/components/SentimentBadge";
import { StockCardActions } from "./StockCardActions";
import { StockCardFooter } from "./StockCardFooter";
import { StockCardOverlayLink } from "./StockCardOverlayLink";
import { cn } from "@/lib/utils";
import { formatTanggalSingkat } from "@/lib/util/formatDate";
import { pickHeroGradient } from "@/lib/util/heroGradient";
import type { DailyRecap } from "@/lib/mock/recaps";

interface StockCardFeedProps {
  /** Recap data — every field is rendered on the card. */
  recap: DailyRecap;
  /** Card's deep-link href, including the optional `?id=` query
   *  param when the parent knows the backend headline id. */
  href: string;
  /** Optional 1-based rank rendered as "#01" / "#02" in the
   *  header row. */
  rank?: number;
  /** Optional extra classes appended to the card container. */
  className?: string;
}

/**
 * Feed (default) `<StockCard />` variant — the dense, vertically
 * stacked card used in feeds like `<PalingBanyakDiberitakan />`
 * and `<HomeFeed />`. Mirrors a CryptoSlate-style news row:
 *
 *   ┌──────────────────────────────────────────────────┐
 *   │ ▓▓▓▓▓ accent bar (sector hue gradient) ▓▓▓▓▓▓▓▓ │
 *   │ #01  TICKER                            💾  ⤴   │
 *   │ 🕒 7 Jun · 5 artikel · positif                  │
 *   │ Recap summary text wraps to 3 lines max...      │
 *   │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
 *   │ [media] [media] [media]              Buka ↗     │
 *   └──────────────────────────────────────────────────┘
 *
 * Whole card is a single click target via the stretched
 * overlay link; per-card actions and the explicit "Buka" CTA
 * sit at `z-10` and cancel the overlay's navigation on click.
 */
export function StockCardFeed({
  recap,
  href,
  rank,
  className,
}: StockCardFeedProps) {
  const heroGradient = pickHeroGradient(recap.sahamKode);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-border bg-bg-secondary transition-all duration-200",
        "hover:border-border-strong hover:shadow-card-hover",
        className,
      )}
    >
      {/* Top accent bar — 2px, sector hue */}
      <div
        className={cn("h-0.5 w-full bg-gradient-to-r", heroGradient)}
        aria-hidden
      />

      <div className="flex flex-1 flex-col p-3.5">
        {/* Header row: ticker on left, save/share on right. The
            ticker was a <Link> — converted to a <div> with
            `group/link` hover on the ticker so the brand color
            still flips on card hover. The stretched link at the
            end of the article is the single anchor. */}
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <div className="group/link flex min-w-0 flex-1 items-baseline gap-2">
            {rank !== undefined && (
              <span className="font-mono text-[10px] font-semibold text-text-faint num-tabular">
                #{String(rank).padStart(2, "0")}
              </span>
            )}
            <h3 className="font-mono text-[22px] font-bold leading-none tracking-tighter text-text-primary group/link:text-brand">
              {recap.sahamKode}
            </h3>
          </div>
          <StockCardActions
            id={recap.sahamKode}
            publishedAt={recap.tanggal}
            tone="dark"
            href={href}
            title={`${recap.sahamKode} — Rangkuman`}
          />
        </div>

        {/* Meta line: date · articles · sentiment */}
        <p className="mb-2 inline-flex flex-wrap items-center gap-1.5 font-mono text-[10.5px] text-text-muted">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" aria-hidden />
            <span>{formatTanggalSingkat(recap.tanggal)}</span>
          </span>
          <span aria-hidden>·</span>
          <span className="num-tabular text-text-secondary">
            {recap.jumlahBerita} artikel
          </span>
          <span aria-hidden>·</span>
          <SentimentBadge sentiment={recap.sentimen} size="sm" />
        </p>

        {/* Summary */}
        <p className="line-clamp-3 text-[12.5px] leading-[1.55] text-text-secondary">
          {recap.ringkasan}
        </p>

        {/* Footer: sources + explicit "Buka" CTA. Both wrappers sit
            at z-10 so they stay clickable above the stretched card
            link — same URL, but the explicit button gives a clear
            visual affordance on the dense feed card. */}
        <StockCardFooter sumber={recap.sumber} href={href} ctaLabel="Buka" />
      </div>

      <StockCardOverlayLink href={href} label={recap.sahamKode} />
    </article>
  );
}

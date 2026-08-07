"use client";

import { SentimentBadge } from "@/components/SentimentBadge";
import { StockCardOverlayLink } from "./StockCardOverlayLink";
import { cn } from "@/lib/utils";
import type { DailyRecap } from "@/lib/mock/recaps";

interface StockCardCompactProps {
  /** Recap data — `sahamKode`, `sentimen`, `jumlahBerita`, and
   *  `tanggal` drive the row content. */
  recap: DailyRecap;
  /** Card's deep-link href, including the optional `?id=` query
   *  param when the parent knows the backend headline id. */
  href: string;
  /** Optional extra classes appended to the row container. */
  className?: string;
}

/**
 * Compact (single-row) `<StockCard />` variant — used in dense
 * list-like contexts (e.g. watchlist tickers, "Paling banyak
 * diberitakan" sidebar rows) where the full hero + summary +
 * footer layout would be too tall.
 *
 * Layout: ticker · sentiment · article count, with a stretched
 * overlay link covering the whole row for the full-hit-area
 * navigation. The link sits above the static content so a click
 * anywhere on the row navigates to the detail page.
 */
export function StockCardCompact({ recap, href, className }: StockCardCompactProps) {
  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 border-b border-border px-3 py-2 transition-colors hover:bg-bg-tertiary",
        className,
      )}
    >
      {/* Static content sits at z-auto; the stretched link at the
          end visually overlays it so a click anywhere on the row
          navigates to the detail page. */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="font-mono text-[12px] font-semibold text-text-primary group-hover:text-brand">
          {recap.sahamKode}
        </span>
        <SentimentBadge sentiment={recap.sentimen} size="sm" />
        <span className="num-tabular text-[11px] text-text-muted">
          {recap.jumlahBerita}
        </span>
      </div>
      <StockCardOverlayLink href={href} label={recap.sahamKode} />
    </div>
  );
}
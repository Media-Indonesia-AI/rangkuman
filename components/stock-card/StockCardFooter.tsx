"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SourceBar } from "@/components/SourceBar";
import type { DailyRecap } from "@/lib/recap";

interface StockCardFooterProps {
  /** Source list from the recap, forwarded to `<SourceBar />` for
   *  the per-media external-link chips. */
  sumber: DailyRecap["sumber"];
  /** Card's deep-link href. The CTA link and the parent card's
   *  stretched overlay both target this URL — explicit button is a
   *  visual affordance, not a different destination. */
  href: string;
  /** CTA label. `<StockCardFeatured />` and `<StockCardList />` use
   *  `"Lihat recap"`; `<StockCardFeed />` uses `"Buka"` to fit the
   *  denser card. */
  ctaLabel: string;
}

/**
 * Footer row used by the `feed`, `featured`, and `list`
 * `<StockCard />` variants. Renders `<SourceBar />` on the left and
 * an explicit "Lihat recap" / "Buka" CTA on the right, both wrapped
 * at `z-10` so the per-media external links and the CTA stay
 * clickable above the card's stretched overlay link.
 */
export function StockCardFooter({ sumber, href, ctaLabel }: StockCardFooterProps) {
  return (
    <div className="mt-auto flex items-end justify-between gap-2 border-t border-border pt-2.5">
      <div className="relative z-10">
        <SourceBar sumber={sumber} max={3} size="sm" />
      </div>
      <Link
        href={href}
        className="relative z-10 inline-flex shrink-0 items-center gap-1 text-[11.5px] font-semibold text-brand transition-colors hover:text-brand-hover"
      >
        {ctaLabel}
        <ArrowUpRight className="h-3 w-3" aria-hidden />
      </Link>
    </div>
  );
}

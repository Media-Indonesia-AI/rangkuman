"use client";

import Link from "next/link";
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "./cryptoFormatters";
import type { CryptoStory } from "./cryptoStories";

interface CryptoFeaturedCardProps {
  /** The lead story of the day. Drives every field on the card. */
  story: CryptoStory;
}

/**
 * "Sorotan" featured card — the largest card on the `/crypto`
 * page. Renders a single `<Link>` to `/crypto/detail/{id}` wrapping:
 *   - a gradient hero strip with the coin flag + ticker chip and
 *     a `LIVE` badge,
 *   - the story headline + summary,
 *   - a price block (current price + 24h change with up/down icon),
 *   - a meta footer (byline, time-ago, source count, read time) +
 *     "Baca cerita" CTA.
 *
 * Self-contained so the parent only has to pass the story. The
 * click hit area covers the entire card; mirrors the
 * `SektorTopStockCard` / `CommodityTile` whole-link convention.
 */
export function CryptoFeaturedCard({ story }: CryptoFeaturedCardProps) {
  const isUp = story.coinChange >= 0;
  return (
    <article className="group relative overflow-hidden rounded-lg border border-border-strong bg-bg-secondary">
      <Link href={`/crypto/detail/${story.id}`} className="block">
        {/* Gradient header */}
        <div
          className="relative h-28 w-full overflow-hidden sm:h-32 bg-gradient-to-br from-amber-500/30 via-amber-600/20 to-bg-secondary"
          aria-hidden
        >
          <div className="absolute inset-0 opacity-50 pattern-chart-line" />
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-bg-secondary to-transparent" />
          <div className="absolute left-3 top-3 flex items-center gap-1.5 sm:left-4 sm:top-4">
            <span className="inline-flex items-center gap-1 rounded border border-white/20 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
              {story.flag} {story.coinKode}
            </span>
            <span className="inline-flex items-center gap-1 rounded border border-white/20 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              LIVE
            </span>
          </div>
        </div>

        <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
          <h3 className="font-mono text-[22px] font-bold leading-[1.1] tracking-tight text-text-primary transition-colors group-hover:text-text-primary sm:text-[28px] sm:leading-[1.08] lg:text-[32px] lg:leading-[1.05]">
            {story.title}
          </h3>
          <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-text-secondary sm:text-[13.5px]">
            {story.summary}
          </p>

          {/* Price block */}
          {/* <div className="mt-3 flex flex-wrap items-baseline gap-2 border-t border-border pt-3">
            <span className="font-mono text-[20px] font-bold tabular-nums text-text-primary">
              ${formatPrice(story.coinPrice)}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 font-mono text-[12px] font-semibold tabular-nums",
                isUp ? "text-cat-saham" : "text-cat-kebijakan",
              )}
            >
              {isUp ? (
                <TrendingUp className="h-3 w-3" aria-hidden />
              ) : (
                <TrendingDown className="h-3 w-3" aria-hidden />
              )}
              {isUp ? "+" : ""}
              {story.coinChange.toFixed(2)}%
              <span className="text-[10px] text-text-faint">· 24 jam</span>
            </span>
          </div> */}

          {/* <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[10px] text-text-muted">
            <span className="text-text-secondary">By Tim Redaksi</span>
            <span className="text-text-faint">·</span>
            <span>{story.timeAgo}</span>
            <span className="text-text-faint">·</span>
            <span className="font-bold tabular-nums text-cat-amber-500">
              {story.jumlahBerita}
            </span>
            <span>sumber</span>
            <span className="text-text-faint">·</span>
            <span>{story.readTime}</span>
            <span className="ml-auto inline-flex items-center gap-1 rounded border border-current/30 bg-current/5 px-2 py-0.5 text-[10px] font-semibold text-text-primary transition-all hover:bg-current/10">
              Baca cerita
              <ArrowUpRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </div> */}
        </div>
      </Link>
    </article>
  );
}

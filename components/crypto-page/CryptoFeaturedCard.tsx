"use client";

import Link from "next/link";
import type { CryptoStory } from "./cryptoStories";

interface CryptoFeaturedCardProps {
  /** The lead story of the day. Drives every field on the card. */
  story: CryptoStory;
}

/**
 * "Sorotan" featured card — the largest card on the `/crypto`
 * page. Renders a single `<Link>` to `/sorotan/detail/{id}` wrapping:
 *   - a gradient hero strip with the coin flag + ticker chip and
 *     a `LIVE` badge,
 *   - the story headline + summary.
 *
 * Self-contained so the parent only has to pass the story. The
 * click hit area covers the entire card; mirrors the
 * `SektorTopStockCard` / `CommodityTile` whole-link convention.
 */
export function CryptoFeaturedCard({ story }: CryptoFeaturedCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-lg border border-border-strong bg-bg-secondary">
      <Link href={`/sorotan/detail/${story.id}`} className="block">
        {/* Gradient header */}
        <div
          className="relative h-28 w-full overflow-hidden sm:h-32 bg-gradient-to-br from-amber-500/30 via-amber-600/20 to-bg-secondary"
          aria-hidden
        >
          <div className="absolute inset-0 opacity-50 pattern-chart-line" />
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-bg-secondary to-transparent" />
          <div className="absolute left-3 top-3 flex items-center gap-1.5 sm:left-4 sm:top-4">
            <span className="inline-flex items-center gap-1 rounded border border-black/20 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm dark:border-white/20">
              {story.flag} {story.coinKode}
            </span>
            <span className="inline-flex items-center gap-1 rounded border border-black/20 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm dark:border-white/20">
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
        </div>
      </Link>
    </article>
  );
}

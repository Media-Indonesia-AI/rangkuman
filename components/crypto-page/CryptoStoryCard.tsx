"use client";

import Link from "next/link";
import type { CryptoStory } from "./cryptoStories";

interface CryptoStoryCardProps {
  /** The story to render. */
  story: CryptoStory;
  /** `true` drops the summary paragraph and tightens the spacing
   *  to fit the third-tier "Cerita Lain" 3-column grid. Default
   *  `false` (Sedang Terjadi layout). */
  compact?: boolean;
}

/**
 * One row in the "Sedang Terjadi" (2-column) or "Cerita Lain"
 * (3-column, `compact`) grids on the `/crypto` page. Renders a
 * single `<Link>` to `/headline/detail/{id}` wrapping:
 *   - a thin amber hairline,
 *   - the coin flag + ticker + time-ago row,
 *   - the headline,
 *   - (in the non-compact layout) a 2-line `line-clamp-2` summary.
 *
 * The card stretches to the row's tallest sibling via
 * `h-full flex flex-col` so the trailing spacer always sits at the
 * bottom regardless of the headline length — mirrors the
 * `h-full` layout used by `StockCardList`.
 */
export function CryptoStoryCard({ story, compact = false }: CryptoStoryCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-bg-secondary transition-all hover:border-border-strong">
      <Link href={`/headline/detail/${story.id}`} className="flex h-full flex-col">
        <div className="relative flex h-1.5 w-full bg-gradient-to-r from-amber-500/40 to-amber-700/10" aria-hidden />
        <div className="flex flex-1 flex-col gap-2 p-3.5 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 font-mono text-[9.5px] font-semibold uppercase tracking-widest text-cat-amber-500">
              {story.flag} {story.coinKode}
            </span>
            <span className="font-mono text-[9.5px] text-text-faint">
              {story.timeAgo}
            </span>
          </div>
          <h3 className="font-mono text-[16.5px] font-bold leading-[1.2] tracking-tight text-text-primary sm:text-[18px]">
            {story.title}
          </h3>
          {!compact && (
            <p className="line-clamp-2 text-[12px] leading-snug text-text-secondary">
              {story.summary}
            </p>
          )}
          <div className="mt-auto" />
        </div>
      </Link>
    </article>
  );
}

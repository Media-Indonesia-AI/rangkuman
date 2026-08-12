import Link from "next/link";
import type { HeadlineLast7DaysItem } from "@/lib/api";
import {
  TickerBadge,
  SentimentPill,
  NotAvailable,
  PctChangeChip,
  relativeUpdated,
} from "./shared";

interface StoryListRowProps {
  /** One story after the featured one. Renders as a compact
   *  ticker-badge + sentiment-pill + title/summary row, linking
   *  to `/story/[id]`. */
  story: HeadlineLast7DaysItem;
}

/** Compact row for the "Story Lainnya" list. Mirrors the visual
 *  shape of the listing's pre-mock state (badge + price-change
 *  stack on the left, content on the right). Price-change is
 *  `n/a` since the endpoint doesn't expose it yet. */
export function StoryListRow({ story }: StoryListRowProps) {
  return (
    <Link
      href={`/story/${story.id}`}
      className="group flex items-start gap-3 border-b border-border/60 py-3.5 last:border-b-0"
    >
      <div className="flex shrink-0 flex-col items-center gap-1 pt-0.5">
        <TickerBadge kode={story.primary_ticker_code} />
        {/* Price move since the headline was created. Older
            responses may omit the field, so fall back to `n/a`
            instead of rendering `+0.0%`. */}
        {story.pct_change_since_story !== undefined ? (
          <PctChangeChip pct={story.pct_change_since_story} />
        ) : (
          <NotAvailable />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <SentimentPill sentiment={story.sentiment} />
          <span className="font-mono text-[10px] text-text-faint">
            · {story.keywords.length} kata kunci ·{" "}
            {relativeUpdated(story.created_at)}
          </span>
        </div>
        <h4 className="text-[14px] font-semibold leading-snug text-text-primary transition-colors group-hover:text-brand sm:text-[14.5px]">
          {story.title}
        </h4>
        <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-text-secondary">
          {story.summary}
        </p>
      </div>
    </Link>
  );
}

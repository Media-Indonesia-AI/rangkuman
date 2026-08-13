import Link from "next/link";
import { cn } from "@/lib/utils";
import type { HeadlineLast7DaysItem } from "@/lib/api";
import {
  NotAvailable,
  PctChangeChip,
  SentimentPill,
  TickerBadge,
  relativeUpdated,
} from "./shared";

/** Compact list row used below the featured card in the `feed`
 *  variant. The first row omits its top border so there's no line
 *  between the featured card and the second story. */
export function StoryRow({
  story,
  first,
}: {
  story: HeadlineLast7DaysItem;
  first?: boolean;
}) {
  return (
    <Link
      href={`/story/${story.id}`}
      className={cn(
        "flex gap-3 py-3 transition-colors hover:bg-bg-secondary/60",
        !first && "border-t border-white",
      )}
    >
      <div className="flex w-[52px] shrink-0 flex-col items-start gap-1">
        <TickerBadge kode={story.primary_ticker_code} />
        {/* Price change "sejak story" — falls back to `n/a` when
            the endpoint doesn't ship `pct_change_since_story`. */}
        {story.pct_change_since_story !== undefined && (
          <PctChangeChip pct={story.pct_change_since_story} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <SentimentPill sentiment={story.sentiment} />
          <span className="font-mono text-[10px] text-text-faint">
            · {story.keywords.length} kata kunci · {relativeUpdated(story.created_at)}
          </span>
        </div>
        <h4 className="mt-1 text-[15px] font-semibold leading-tight text-text-primary">
          {story.title}
        </h4>
        <p className="mt-0.5 text-[12px] leading-snug text-text-muted line-clamp-1">
          {story.summary}
        </p>
      </div>
    </Link>
  );
}

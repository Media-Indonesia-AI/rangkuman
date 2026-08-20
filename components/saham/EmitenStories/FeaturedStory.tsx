import Link from "next/link";
import { Clock } from "lucide-react";
import type { HeadlineLast7DaysItem } from "@/lib/api";
import {
  NotAvailable,
  PctChangeChip,
  SentimentPill,
  TickerBadge,
  relativeUpdated,
} from "./shared";
import { StoryTimeline } from "./StoryTimeline";

/** Featured (top-of-feed) story card. Hosts the per-card dot
 *  timeline which reads the headline's embedded `stories` payload. */
export function FeaturedStory({ story }: { story: HeadlineLast7DaysItem }) {
  const topic = story.topics[0]?.name;
  
  const latestRecapDate =
    story.stories && story.stories.length > 0
      ? story.stories.reduce(
          (latest, s) => (s.recap_date > latest ? s.recap_date : latest),
          "",
        )
      : "";
  const updateTimestamp = latestRecapDate || story.updated_at || story.created_at;

  return (
    <Link
      href={`/story/${story.id}`}
      className="block rounded-lg border border-border bg-bg-secondary p-4 transition-colors hover:border-border-strong"
    >
      <div className="flex flex-wrap items-center gap-2">
        <TickerBadge kode={story.primary_ticker_code} />
        <SentimentPill sentiment={story.sentiment} />
        <span className="font-mono text-[10.5px] text-text-faint">
          · {story.keywords.length} kata kunci
        </span>
      </div>

      <h3 className="mt-2.5 text-lg font-bold leading-tight text-text-primary">
        {story.title}
      </h3>
      <p className="mt-1 text-[13px] leading-relaxed text-text-muted line-clamp-1">
        {story.summary}
      </p>

      {/* Timeline — sits between the summary and the footer so it
          reads as a per-card progress strip. Sourced from the
          headline's embedded `stories` payload so the dot count
          reflects the actual related-story count rather than the
          size of the parent feed. */}
      <div className="mt-3">
        <StoryTimeline stories={story.stories ?? []} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white pt-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-mono text-[10.5px] text-text-muted">
            <Clock className="h-3 w-3" aria-hidden />
            Update {relativeUpdated(updateTimestamp)}
          </span>
          {topic && (
            <span className="rounded border border-border bg-bg-tertiary px-1.5 py-0.5 font-mono text-[9.5px] text-text-secondary">
              {topic}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

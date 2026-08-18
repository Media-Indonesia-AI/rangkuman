import Link from "next/link";
import { Clock } from "lucide-react";
import type { HeadlineLast7DaysItem } from "@/lib/api";
import {
  TickerBadge,
  SentimentPill,
  NotAvailable,
  relativeUpdated,
} from "./shared";

interface FeaturedCardProps {
  /** The first (most recent) story in the listing — rendered as a
   *  large clickable card linking to its `/story/[id]` page. */
  story: HeadlineLast7DaysItem;
  /** Optional topic hint to thread through to the detail page
   *  via `?topic=<hint>` on the link. Mirrors the hint that
   *  `StoryPage` resolved from its own `?topic=` query param —
   *  forwarding it explicitly (rather than relying on the
   *  detail route's `Referer` lookup) keeps the sidebar's
   *  topic-scoped feed consistent regardless of how the
   *  visitor originally landed on the listing. The value
   *  is forwarded as-is and re-validated by the route entry
   *  (`app/story/[id]/page.tsx`), so anything outside
   *  `"saham" | "crypto"` is silently dropped at the other end. */
  topicHint?: string;
}

/** Large featured card for the listing's top story. Uses the
 *  `HeadlineLast7DaysItem` API shape; the editorial fields
 *  `STOCK_STORIES` used to expose (sector / status / price impact
 *  / timeline) aren't on it, so price-move renders as `n/a` and
 *  sector / status badges are omitted entirely. */
export function FeaturedCard({ story, topicHint }: FeaturedCardProps) {
  const topic = story.topics[0]?.name;
  const href = topicHint
    ? `/story/${story.id}?topic=${topicHint}`
    : `/story/${story.id}`;

  // The "Update" label below is the timestamp of the *latest*
  // sub-story the headline is updating about — not the
  // headline's own `created_at`. The optional `stories[]`
  // payload (newer responses) carries one `EmbeddedStory` per
  // related story, each with its own `recap_date` (the older
  // field name; `StoryItem` calls this `created_at`). The
  // array isn't sorted on the wire, so we reduce to find the
  // max. ISO 8601 strings sort lexicographically the same as
  // chronologically, so a plain `>` compare works. Falls back
  // to `story.created_at` when the payload is absent or empty
  // (older responses) so the card never blanks out.
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
      href={href}
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
      <p className="mt-1 text-[13px] leading-relaxed text-text-muted">
        {story.summary}
      </p>

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

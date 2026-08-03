import { Shimmer } from "@/components/Shimmer";
import { cn } from "@/lib/utils";
import { DATE_FORMAT_ISO, formatSingkat, getRelativeTime } from "@/lib/util/formatDate";
import type { EmbeddedStory } from "@/lib/api";
import { STATUS_ICON, sentimentMeta, SectionHeader } from "./shared";

interface StoryStoriesListProps {
  /** Stories to render — usually `stories.slice(1)` (everything
   *  except the featured one which the hero shows). */
  stories: EmbeddedStory[];
  isLoading: boolean;
  /** Total story count from the hook, for the section subtitle
   *  (`"N peristiwa penting"`). */
  totalCount: number;
}

/** "Timeline" — the related stories for the headline, rendered as
 *  a vertical timeline of events. Each story gets a sentiment-
 *  colored dot anchored on a vertical track, with the headline,
 *  date, and a single article preview card below. Renders one of
 *  three states: skeleton while fetching, the list when present,
 *  or a dashed empty-state panel when no stories remain. */
export function StoriesList({
  stories,
  isLoading,
  totalCount,
}: StoryStoriesListProps) {
  return (
    <section aria-label="Timeline story">
      <SectionHeader
        title="Timeline"
        subtitle={
          totalCount > 0
            ? `${totalCount} peristiwa penting`
            : "Belum ada peristiwa"
        }
      />
      {isLoading ? (
        <ListSkeleton />
      ) : stories.length > 0 ? (
        <TimelineList stories={stories} />
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-bg-secondary/30 p-6 text-center text-[12.5px] text-text-muted">
          Tidak ada peristiwa tambahan untuk headline ini.
        </div>
      )}
    </section>
  );
}

/** Container with the vertical track behind the dots. The track
 *  is positioned absolute so it spans from the first dot's center
 *  to the last dot's center — dots are sized at 28px (h-7 w-7) so
 *  the line inset matches their radius. */
function TimelineList({ stories }: { stories: EmbeddedStory[] }) {
  // Sort descending by `recap_date` so the most recent recap
  // sits at the top of the timeline and older events trail
  // downward — matches the way news feeds typically render
  // and lets the user scan the latest development first
  // before scrolling back through the arc. ISO 8601 strings
  // sort lexicographically as timestamps, so `localeCompare`
  // is enough — no `Date` parsing needed for the comparison.
  // Stories missing a `recap_date` sort to the end so the
  // populated entries still form a coherent sequence rather
  // than being interleaved with placeholders. The spread
  // avoids mutating the prop array — the parent may reuse it
  // across renders.
  const sortedStories = [...stories].sort((a, b) => {
    if (!a.recap_date && !b.recap_date) return 0;
    if (!a.recap_date) return 1;
    if (!b.recap_date) return -1;
    return b.recap_date.localeCompare(a.recap_date);
  });

  return (
    <div className="relative rounded-lg border border-border-strong bg-bg-secondary/30 p-4 sm:p-5">
      {/* Vertical track — sits behind the dots, inset so the line
          starts at the first dot's center and ends at the last
          dot's center. The track is short of the very top/bottom
          padding so the line "joins" the dots cleanly. */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-7 left-[27px] top-7 w-px bg-border"
      />
      <ol className="space-y-5">
        {sortedStories.map((story) => (
          <TimelineItem key={story.id} story={story} />
        ))}
      </ol>
    </div>
  );
}

/** One row on the timeline: a sentiment dot on the left, the
 *  story headline + date on the right, and (when the story has
 *  at least one article) a single article preview card underneath. */
function TimelineItem({ story }: { story: EmbeddedStory }) {
  const m = sentimentMeta[story.primary_sentiment];
  const Icon = STATUS_ICON[story.primary_sentiment];
  // Surface only the first article as the preview headline for
  // the timestamp chip — the API may eventually ship more, but
  // the row stays single-focus until then.
  const article = story.articles?.[0];

  return (
    <li className="relative flex gap-4">
      {/* Dot — sentiment-colored circle with the status icon. Sits
          above the track via z-10 so the line tucks behind it. */}
      <span
        aria-hidden
        className={cn(
          "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          m.dot,
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4",
            story.primary_sentiment === "neutral"
              ? "text-text-muted"
              : "text-white",
          )}
        />
      </span>

      {/* Content column — headline, date, and (optionally) the
          article preview card. */}
      <div className="min-w-0 flex-1 pt-0.5">
        <h4 className="text-[14px] font-bold leading-snug text-text-primary">
          {story.headline || "n/a"}
        </h4>
        <time
          dateTime={story.recap_date}
          className="mt-0.5 block font-mono text-[10.5px] text-text-faint"
        >
          {formatSingkat(story.recap_date, DATE_FORMAT_ISO)}
        </time>

        {article && (
          <ArticlePreview
            title={article.title}
            sourceName={article.source_name}
            sourceUrl={article.source_url}
            // Relative time is derived from the story's recap_date
            // since the article payload doesn't carry a timestamp.
            // Falls back to "n/a" when the recap_date is missing.
            relativeTime={story.recap_date ? getRelativeTime(story.recap_date) : "n/a"}
          />
        )}
      </div>
    </li>
  );
}

/** One article preview card — title in bold, source + relative
 *  time in muted mono. The card is the indirection between the
 *  story row and the article block in the design. */
function ArticlePreview({
  title,
  sourceName,
  sourceUrl,
  relativeTime,
}: {
  title: string;
  sourceName: string;
  sourceUrl: string;
  relativeTime: string;
}) {
  return (
    <a
      href={/^https?:\/\//i.test(sourceUrl) ? sourceUrl : `https://${sourceUrl}`}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2.5 block rounded-md border border-border bg-bg-tertiary/40 p-3 transition-colors hover:border-brand/40 hover:bg-bg-tertiary/60"
    >
      <p className="text-[12.5px] font-semibold leading-snug text-text-primary">
        {title || "n/a"}
      </p>
      <p className="mt-1 font-mono text-[10px] text-text-faint">
        <span>{sourceName || "n/a"}</span>
        <span className="px-1">·</span>
        <span>{relativeTime}</span>
      </p>
    </a>
  );
}

function ListSkeleton() {
  return (
    <div className="relative rounded-lg border border-border-strong bg-bg-secondary/30 p-4 sm:p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-7 left-[27px] top-7 w-px bg-border"
      />
      <ol className="space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="relative flex gap-4">
            <Shimmer className="h-7 w-7 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-3.5 w-2/3" />
              <Shimmer className="h-2.5 w-1/4" />
              <div className="rounded-md border border-border bg-bg-tertiary/40 p-3">
                <Shimmer className="h-3 w-5/6" />
                <Shimmer className="mt-1.5 h-2.5 w-1/3" />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

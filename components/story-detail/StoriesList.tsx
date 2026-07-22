import { Shimmer } from "@/components/Shimmer";
import { cn } from "@/lib/utils";
import type { EmbeddedStory } from "@/lib/api";
import { SectionHeader, sentimentMeta } from "./shared";

interface StoryStoriesListProps {
  /** Stories to render — usually `stories.slice(1)` (everything
   *  except the featured one which the hero shows). */
  stories: EmbeddedStory[];
  isLoading: boolean;
  /** Total story count from the hook, for the section subtitle
   *  (`"N story untuk headline ini"`). */
  totalCount: number;
}

/** "Daftar Story" — the secondary stories for the headline. Renders
 *  one of three states: skeleton while fetching, the list when
 *  present, or a dashed empty-state panel when none remain after
 *  the featured one is pulled out. */
export function StoriesList({
  stories,
  isLoading,
  totalCount,
}: StoryStoriesListProps) {
  return (
    <section aria-label="Daftar story">
      <SectionHeader
        title="Daftar Story"
        subtitle={`${totalCount} story untuk headline ini`}
      />
      {isLoading ? (
        <ListSkeleton />
      ) : stories.length > 0 ? (
        <ul className="rounded-lg border border-border-strong bg-bg-secondary/30 p-4">
          {stories.map((story, idx) => (
            <li
              key={story.id}
              className={cn(
                "py-3",
                idx < stories.length - 1 && "border-b border-border/60",
              )}
            >
              <StoryListRow story={story} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-bg-secondary/30 p-6 text-center text-[12.5px] text-text-muted">
          Tidak ada story tambahan untuk headline ini.
        </div>
      )}
    </section>
  );
}

function StoryListRow({ story }: { story: EmbeddedStory }) {
  const m = sentimentMeta[story.primary_sentiment];
  const articleCount = story.articles?.length ?? 0;
  return (
    <article>
      <div className="mb-1 flex flex-wrap items-center gap-1.5 font-mono text-[9.5px] text-text-muted">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded border px-1 py-0.5 font-semibold uppercase tracking-wider",
            m.color,
          )}
        >
          <span className={cn("h-1 w-1 rounded-full", m.dot)} aria-hidden />
          {m.label}
        </span>
        <span>·</span>
        <time dateTime={story.recap_date} className="text-text-faint">
          {story.recap_date}
        </time>
        <span>·</span>
        <span className="text-text-faint">{articleCount} artikel</span>
      </div>
      <h4 className="text-[13.5px] font-semibold leading-snug text-text-primary">
        {story.headline}
      </h4>
      <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-text-secondary">
        {story.summary}
      </p>
    </article>
  );
}

function ListSkeleton() {
  return (
    <ul className="rounded-lg border border-border-strong bg-bg-secondary/30 p-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <li
          key={i}
          className={cn(
            "space-y-1.5 py-3",
            i < 2 && "border-b border-border/60",
          )}
        >
          <div className="flex items-center gap-1.5">
            <Shimmer className="h-3 w-12" />
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-3 w-12" />
          </div>
          <Shimmer className="h-3.5 w-3/4" />
          <Shimmer className="h-3 w-full" />
        </li>
      ))}
    </ul>
  );
}

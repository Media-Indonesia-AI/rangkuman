/**
 * Dot timeline — one dot per story, colored by sentiment. The
 * track is a single horizontal line that starts and ends at the
 * centers of the first and last dots so the endpoints are
 * anchored cleanly. Each dot is a button with a native `title`
 * tooltip so hovering surfaces the story's title. Renders nothing
 * when the stories array is empty so callers can safely drop it
 * next to the loading skeleton and empty state.
 */
import { cn } from "@/lib/utils";
import { toSentimen } from "@/lib/util/sentiment";
import type { EmbeddedStory } from "@/lib/api";
import { sentimentStyle } from "./shared";

export function StoryTimeline({ stories }: { stories: EmbeddedStory[] }) {
  if (stories.length === 0) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
        Timeline
      </span>
      <div className="relative flex flex-1 items-center">
        {/* Track — starts and ends at the center of the first and last
            dots so the endpoints are anchored cleanly to the timeline. */}
        <div className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-border" />
        <div className="relative z-10 flex flex-1 items-center justify-between">
          {stories.map((story, index) => {
            const title = story.headline || "n/a";
            const { dot } = sentimentStyle[toSentimen(story.primary_sentiment)];
            return (
              <button
                key={`${story.id}-${index}`}
                type="button"
                title={title}
                aria-label={title}
                className={cn(
                  "block h-2 w-2 shrink-0 rounded-full transition-transform hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary",
                  dot,
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

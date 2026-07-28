import type { StoryEvent } from "@/lib/mock/highlights";
import { StoryTimeline } from "@/components/StoryTimeline";

interface CryptoDetailTimelineProps {
  /** Pre-computed events for this headline. The orchestrator
   *  (`CryptoDetailPage`) fetches them via `useListStory(headline_id)`
   *  and projects each `EmbeddedStory` into a `StoryEvent` — this
   *  widget just renders the list as-is. */
  events: StoryEvent[];
  /** Total number of unique sources covering this story. Optional
   *  because the orchestrator derives it from the live stories'
   *  `articles[].source_name` set when present, and falls back to
   *  `events.length === 0` when no stories have arrived yet. */
  sourceCount?: number;
}

/**
 * Chronological timeline section: header strip with the "Kronologis"
 * meta label + the `<StoryTimeline />` widget itself. Renders only
 * when there's at least one event to show.
 */
export function CryptoDetailTimeline({
  events,
  sourceCount = 0,
}: CryptoDetailTimelineProps) {
  if (events.length === 0) return null;

  return (
    <section aria-label="Timeline" className="mt-7">
      <div className="mb-3 flex items-end justify-between border-b border-border-strong pb-2">
        <div>
          <h2 className="label text-text-secondary">Timeline</h2>
          <h3 className="text-[15px] font-bold tracking-tight text-text-primary sm:text-[16px]">
            {events.length} peristiwa dari {sourceCount} media
          </h3>
        </div>
        <span className="font-mono text-[10.5px] text-text-faint">
          Kronologis
        </span>
      </div>

      <StoryTimeline events={events} />
    </section>
  );
}
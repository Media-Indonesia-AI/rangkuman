import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Shimmer } from "@/components/Shimmer";
import type { HeadlineLast7DaysItem } from "@/lib/api";

interface StorySidebarProps {
  /** Stories to show in the "Story Lainnya" card — fed by
   *  `useMultiStories(ticker, 3)` on the page. Reuses the same
   *  feed the `/story/` listing renders, so the rail previews
   *  the latest headlines instead of the current headline's
   *  siblings. Empty array renders the empty state. */
  otherStories: HeadlineLast7DaysItem[];
  isLoading: boolean;
  /** The headline id this page is scoped to — surfaced in the
   *  "Tentang Story" card so the live data is visible at a glance. */
  headlineId: string;
  /** Total fetched count from the multi-stories feed, surfaced
   *  alongside `headlineId`. */
  totalCount: number;
}

/** Right-rail sidebar — "Story Lainnya" (other stories from the
 *  multi-date stories feed) on top, "Tentang Story" (static blurb
 *  + live data summary) below. Both cards stay mounted across
 *  states; the contents swap between skeleton / list / empty. */
export function StorySidebar({
  otherStories,
  isLoading,
}: StorySidebarProps) {
  return (
    <aside className="space-y-4">
      {/* Story Lainnya */}
      <div className="rounded-lg border border-border-strong bg-bg-secondary/40 p-4">
        <h3 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
          Story Lainnya
        </h3>
        {isLoading ? (
          <OtherStoriesSkeleton />
        ) : otherStories.length > 0 ? (
          <ul className="space-y-2.5">
            {otherStories.map((story) => (
              <OtherStoryRow key={story.id} story={story} />
            ))}
          </ul>
        ) : (
          <p className="text-[11.5px] text-text-muted">
            Belum ada story lain.
          </p>
        )}
      </div>

      {/* Tentang Story */}
      <div className="rounded-lg border border-border bg-bg-tertiary/50 p-4 text-[11.5px] leading-relaxed text-text-muted">
        <p className="font-semibold text-text-secondary">Tentang Story</p>
        <p className="mt-1.5">
          Story adalah narasi perkembangan emiten dalam jangka panjang
          (mingguan/bulanan).
        </p>
      </div>
    </aside>
  );
}

/** One row in the "Story Lainnya" list. The leading badge is the
 *  stock ticker (matching the hero's `MDKA`-style chip) rather
 *  than the sentiment — the rail is a browse surface, so showing
 *  the ticker first helps the eye scan for a known emiten. The
 *  metadata line below the title still carries the date and pct
 *  change, with `n/a` fallbacks when the API omits a value. */
function OtherStoryRow({ story }: { story: HeadlineLast7DaysItem }) {
  const pct = story.pct_change_since_story;
  const pctColor =
    pct === undefined
      ? "text-text-faint"
      : pct >= 0
        ? "text-bullish"
        : "text-bearish";
  const pctLabel =
    pct === undefined
      ? "n/a"
      : `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;

  return (
    <li>
      <Link href={`/story/${story.id}`} className="group block">
        <div className="flex items-start gap-2">
          <span className="shrink-0 rounded border border-brand/30 bg-brand/10 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-tight text-brand">
            {story.primary_ticker_code || "n/a"}
          </span>
          <div className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-medium leading-snug text-text-primary transition-colors group-hover:text-brand">
              {story.title || "n/a"}
            </span>
            <div className="mt-1 flex flex-wrap items-center gap-x-1.5 font-mono text-[9.5px] text-text-faint">
              <time dateTime={story.created_at}>
                {story.created_at || "n/a"}
              </time>
              <span>·</span>
              <span className={pctColor}>{pctLabel}</span>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}

function OtherStoriesSkeleton() {
  return (
    <ul className="space-y-2.5">
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="flex items-start gap-2">
          <Shimmer className="h-4 w-10 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Shimmer className="h-3 w-3/4" />
            <Shimmer className="h-2.5 w-1/2" />
          </div>
        </li>
      ))}
    </ul>
  );
}

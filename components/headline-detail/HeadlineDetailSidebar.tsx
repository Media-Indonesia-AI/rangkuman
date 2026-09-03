import type { HeadlineDetail } from "@/lib/api";
import { MarketSnapshotCompact } from "@/components/MarketSnapshotCompact";
import { RelatedStoriesList } from "@/components/RelatedStoriesList";

interface HeadlineDetailSidebarProps {
  /** Story id to exclude from related list (passed through). */
  storyId: string;
  /** Full live headline detail — forwarded to `<RelatedStoriesList />`
   *  so it can pick the right topic id (crypto vs saham) for the
   *  related-stories fetch instead of being hardcoded to crypto.
   *  Optional for back-compat; when omitted, the rail keeps its
   *  pre-existing crypto-only behavior. */
  currentHeadline?: HeadlineDetail | null;
}

/**
 * Right-rail sidebar block: macro market snapshot on top + a small
 * "Cerita terkait" list below. Sticky on `lg+`.
 *
 * No top-level early return: each block inside gates itself
 * independently. `<MarketSnapshotCompact />` renders its own
 * DEFAULT_ITEMS when the caller doesn't supply a list, and
 * `<RelatedStoriesList />` returns `null` from inside when it has
 * nothing to show. The sidebar therefore stays visible whenever
 * the page renders, so the grid stays symmetric regardless of
 * which card is hydrated.
 */
export function HeadlineDetailSidebar({
  storyId,
  currentHeadline,
}: HeadlineDetailSidebarProps) {
  return (
    <aside className="min-w-0 space-y-4 lg:col-span-4">
      <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-1">
        <MarketSnapshotCompact
          label="Pasar Hari Ini"
          meta="real-time"
        />
        {/* Always render — `<RelatedStoriesList />` returns `null`
            from inside when there's nothing to show (still loading
            with no fallback rows, or its own fetch returned empty). */}
        <div className="mt-4">
          <RelatedStoriesList
            currentHeadlineId={storyId}
            currentHeadline={currentHeadline}
            variant="featured"
          />
        </div>
      </div>
    </aside>
  );
}

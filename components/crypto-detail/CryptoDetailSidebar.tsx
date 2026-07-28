import {
  MarketSnapshotCompact,
  type MarketSnapshotItem,
} from "@/components/MarketSnapshotCompact";
import { RelatedStoriesList } from "@/components/RelatedStoriesList";
import type { Highlight } from "@/lib/mock/highlights";

interface CryptoDetailSidebarProps {
  /** Macro indicators to show in the compact snapshot card. */
  markets: MarketSnapshotItem[];
  /** Story id to exclude from related list (passed through). */
  storyId: string;
}

/**
 * Right-rail sidebar block: macro market snapshot on top + a small
 * "Cerita terkait" list below. Sticky on `lg+`.
 *
 * No top-level early return: each block inside gates itself
 * independently. The markets card hides itself when empty, and
 * `<RelatedStoriesList />` returns `null` from inside when it has
 * nothing to show. Dropping the parent-level guard means the
 * related-stories rail still mounts when the markets feed is
 * empty (which it currently is — there's no dedicated
 * `/markets/snapshot` endpoint yet) so the sticky rail stays
 * symmetric in the grid whether the macro card is present or not.
 */
export function CryptoDetailSidebar({
  markets,
  storyId,
}: CryptoDetailSidebarProps) {
  return (
    <aside className="min-w-0 space-y-4 lg:col-span-4">
      <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-1">
        {markets.length > 0 && (
          <MarketSnapshotCompact
            items={markets}
            label="Pasar Hari Ini"
            meta="real-time"
          />
        )}
        {/* Always render — `<RelatedStoriesList />` returns `null`
            from inside when there's nothing to show (still loading
            with no fallback rows, or its own fetch returned empty).
            The `related` prop is kept in the API for future callers
            that want to override the live feed (e.g. a curated
            "related" list surfaced by a dedicated endpoint). */}
        <div className="mt-4">
          <RelatedStoriesList
            excludeId={storyId}
            currentHeadlineId={storyId}
            variant="featured"
          />
        </div>
      </div>
    </aside>
  );
}
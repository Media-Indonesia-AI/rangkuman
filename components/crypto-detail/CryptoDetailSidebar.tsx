import {
  MarketSnapshotCompact,
  type MarketSnapshotItem,
} from "@/components/MarketSnapshotCompact";
import { RelatedStoriesList } from "@/components/RelatedStoriesList";
import type { Highlight } from "@/lib/mock/highlights";

interface CryptoDetailSidebarProps {
  /** Macro indicators to show in the compact snapshot card. */
  markets: MarketSnapshotItem[];
  /** Related stories (already filtered to exclude this one). */
  related: Highlight[];
  /** Story id to exclude from related list (passed through). */
  storyId: string;
}

/**
 * Right-rail sidebar block: macro market snapshot on top + a small
 * "Cerita terkait" list below. Sticky on `lg+`. Renders nothing
 * when both inputs are empty so the surrounding `lg:sticky` wrapper
 * collapses cleanly.
 */
export function CryptoDetailSidebar({
  markets,
  related,
  storyId,
}: CryptoDetailSidebarProps) {
  if (markets.length === 0 && related.length === 0) return null;

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
        {related.length > 0 && (
          <div className="mt-4">
            <RelatedStoriesList
              stories={related}
              excludeId={storyId}
              variant="featured"
            />
          </div>
        )}
      </div>
    </aside>
  );
}
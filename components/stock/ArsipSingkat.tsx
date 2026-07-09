"use client";

import { Clock } from "lucide-react";
import Link from "next/link";
import { getRecapsForStock } from "@/lib/mock/recaps";
import { formatTanggalSingkat } from "@/lib/util/formatDate";
import { toSentimen } from "@/lib/util/sentiment";
import type { EmbeddedStory } from "@/lib/api";
import { SentimentBadge } from "@/components/SentimentBadge";
import { Shimmer } from "@/components/Shimmer";
import { useTickerStories } from "./TickerStoriesProvider";

/** How many archived entries to show in the right rail. The live
 *  fetch asks the backend for `limit` and we slice down to this
 *  count, matching the prior `allRecaps.slice(1)` behavior. */
const VISIBLE_COUNT = 3;

interface ArsipSingkatProps {
  /** Stock ticker; used to filter the live headlines list to stories
   *  about this stock. */
  kode: string;
}

/**
 * "Arsip singkat" — right-rail widget listing the latest archived
 * headlines for one stock.
 *
 * Data path: shared via `<TickerStoriesProvider>` (mounted by the
 * page). Reads `useTickerStories()` to consume the ticker-scoped
 * `EmbeddedStory[]` that the provider fetches once per page load —
 * the same fetch that drives `<SentimentSparkline>`. Field names
 * follow the older `EmbeddedStory` wire shape (`headline`,
 * `primary_sentiment`, `recap_date`), which differs from the newer
 * `StoryItem` used by `useLatestStories`.
 *
 * Each live row links to `/stock/{kode}?id={story.id}` so the stock
 * page's `<HeadlineDetailProvider>` can resolve the deep link via
 * `api.getHeadlineById(id)` (same pattern as `<StockCard>`).
 *
 * Three render branches, in order:
 *   - loading → pulsing shimmer rows so the rail doesn't shift.
 *   - loaded with data → live `EmbeddedStory` rows with headline +
 *     date + sentiment badge.
 *   - loaded empty / errored → mock `recaps[]` filtered to this
 *     ticker and sliced to skip today's recap, rendered as the
 *     previous read-only rows. This mirrors `LatestHeadlines`'s
 *     fallback policy so users always see content.
 */
export function ArsipSingkat({ kode }: ArsipSingkatProps) {
  // Shared ticker-scoped fetch owned by <TickerStoriesProvider>.
  // Slice down to the visible count — the provider fetches a wider
  // window so <SentimentSparkline> can bucket by date.
  const { stories, isLoading } = useTickerStories();

  // Prefer live data; fall back to mock recaps (oldest first,
  // excluding today) when the fetch errored or returned empty.
  const liveItems = stories.length > 0 ? stories.slice(0, VISIBLE_COUNT) : null;
  const fallbackItems =
    !isLoading && liveItems === null
      ? getRecapsForStock(kode).slice(1, 1 + VISIBLE_COUNT)
      : null;

  return (
    <section
      className="overflow-hidden rounded-lg border border-border bg-bg-secondary"
      aria-label="Arsip singkat"
    >
      <header className="flex items-center justify-between border-b border-border bg-bg-tertiary px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-brand" aria-hidden />
          <h3 className="label">Arsip singkat</h3>
        </div>
        <span className="font-mono text-[9.5px] text-text-muted num-tabular">
          {isLoading ? (
            <Shimmer className="h-2 w-4" />
          ) : (
            liveItems?.length ?? fallbackItems?.length ?? 0
          )}
        </span>
      </header>

      <ul className="divide-y divide-border">
        {isLoading && liveItems === null && (
          <ArsipSkeleton count={VISIBLE_COUNT} />
        )}

        {liveItems?.map((story) => (
          <ArsipRow key={story.id} story={story} kode={kode} />
        ))}

        {fallbackItems?.map((r) => (
          <li key={r.id} className="px-3 py-2.5">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-widest text-text-muted num-tabular">
                {formatTanggalSingkat(r.tanggal)}
              </span>
              <SentimentBadge sentiment={r.sentimen} size="sm" />
            </div>
            <p className="line-clamp-2 text-[12px] leading-snug text-text-secondary">
              {r.ringkasan}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Live headline row — short date + sentiment badge + clickable title.
 *  The whole row is a `<Link>` to `/stock/{kode}?id={story.id}` so the
 *  detail page's headline provider can resolve the deep link. The
 *  fallback recap rows stay non-clickable because their `id` is a
 *  recap id, not a headline id, so the deep-link fetcher would 404. */
function ArsipRow({ story, kode }: { story: EmbeddedStory; kode: string }) {
  const sentiment = toSentimen(story.primary_sentiment);
  // `recap_date` is an ISO timestamp; the date part is what we want
  // for the right-rail's compact date label.
  const tanggal = story.recap_date.split("T")[0];
  return (
    <li>
      <Link
        href={`/stock/${kode}?id=${story.id}`}
        className="group block px-3 py-2.5 transition-colors hover:bg-bg-tertiary"
      >
        <div className="mb-1.5 flex items-center gap-2">
          <span className="font-mono text-[10.5px] font-semibold uppercase tracking-widest text-text-muted num-tabular">
            {formatTanggalSingkat(tanggal)}
          </span>
          <SentimentBadge sentiment={sentiment} size="sm" />
        </div>
        <p className="line-clamp-2 text-[12px] font-medium leading-snug text-text-secondary group-hover:text-text-primary">
          {story.headline}
        </p>
      </Link>
    </li>
  );
}

/** Skeleton shown while the live fetch is in flight. Sized to roughly
 *  match a real row so the right rail doesn't shift when data lands. */
function ArsipSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <li key={`skel-${i}`} className="px-3 py-2.5">
          <div className="mb-1.5 flex items-center gap-2">
            <Shimmer className="h-2.5 w-10" />
            <Shimmer className="h-3 w-8" />
          </div>
          <Shimmer className="h-3 w-full" />
          <Shimmer className="mt-1.5 h-3 w-2/3" />
        </li>
      ))}
    </>
  );
}
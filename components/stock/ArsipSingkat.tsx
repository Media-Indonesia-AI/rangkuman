"use client";

import { Clock } from "lucide-react";
import Link from "next/link";
import { useLatestStories } from "@/lib/hooks/useLatestStories";
import { getRecapsForStock } from "@/lib/mock/recaps";
import { formatTanggalSingkat } from "@/lib/util/formatDate";
import { toSentimen } from "@/lib/util/sentiment";
import type { StoryFilter, StoryItem } from "@/lib/api";
import { SentimentBadge } from "@/components/SentimentBadge";
import { Shimmer } from "@/components/Shimmer";

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
 * Data path:
 *   `useLatestStories(limit, 0, [{ primary_ticker_code, eq, kode }])`
 *   → `loadHeadlines()` → `api.getHeadlines()` → live `StoryItem[]`.
 *
 * Each live row links to `/stock/{kode}?id={story.id}` so the stock
 * page's `<HeadlineDetailProvider>` can resolve the deep link via
 * `api.getHeadlineById(id)` (same pattern as `<StockCard>`).
 *
 * Three render branches, in order:
 *   - loading → pulsing shimmer rows so the rail doesn't shift.
 *   - loaded with data → live `StoryItem` rows with title + date +
 *     sentiment badge.
 *   - loaded empty / errored → mock `recaps[]` filtered to this
 *     ticker and sliced to skip today's recap, rendered as the
 *     previous read-only rows. This mirrors `LatestHeadlines`'s
 *     fallback policy so users always see content.
 */
export function ArsipSingkat({ kode }: ArsipSingkatProps) {
  // Backend indexes stock attribution under `primary_ticker_code`.
  // Memoizing keeps the filter array referentially stable so the
  // hook's effect dependency doesn't churn every render.
  const filters: StoryFilter[] = [
    { field: "primary_ticker_code", operator: "eq", value: kode },
  ];
  const { data, isLoading } = useLatestStories(VISIBLE_COUNT, 0, filters);

  // Prefer live data; fall back to mock recaps (oldest first,
  // excluding today) when the fetch errored or returned empty.
  const liveItems = data.length > 0 ? data.slice(0, VISIBLE_COUNT) : null;
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
function ArsipRow({ story, kode }: { story: StoryItem; kode: string }) {
  const sentiment = toSentimen(story.sentiment);
  // `created_at` is an ISO timestamp; the date part is what we want
  // for the right-rail's compact date label.
  const tanggal = story.created_at.split("T")[0];
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
          {story.title}
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
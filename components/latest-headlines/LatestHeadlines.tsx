"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type UIEvent,
} from "react";
import type { StoryFilter, StoryItem } from "@/lib/api";
import { loadHeadlines } from "@/lib/api/cache";
import { useHeadlines } from "@/lib/hooks/useHeadlines";
import { useTopics } from "@/lib/hooks/useTopics";
import { findCryptoTopicId } from "../crypto-page/cryptoStories";
import { LatestHeadlinesHeader } from "./LatestHeadlinesHeader";
import { LatestHeadlinesRow } from "./LatestHeadlinesRow";
import { LatestHeadlinesSkeleton } from "./LatestHeadlinesSkeleton";
import {
  LatestHeadlinesLoadingTail,
  LatestHeadlinesEndTail,
} from "./LatestHeadlinesTail";

/** Per-page request `limit`. Kept at 10 — the same default the
 *  backend uses, and the same shape the other headline-scoped
 *  fetches (`HeadlineStoriesProvider`, etc.) already use, so each
 *  page lands on a cache slot shape we already understand. */
const PAGE_LIMIT = 10;

/** Pixel distance from the bottom of the scroll container that
 *  counts as "reached the end" for the infinite-scroll trigger.
 *  ~80px covers one row plus a margin for momentum scroll on
 *  touchpads. */
const END_REACHED_THRESHOLD_PX = 80;

/**
 * `<LatestHeadlines />` — vertically scrollable timeline of
 * stories with a relative-time rail, ticker badge, sentiment pill,
 * STORY tag, headline, and source name.
 *
 * Composes the small widgets in this folder:
 *   - `<LatestHeadlinesHeader />` — clock + title,
 *   - `<LatestHeadlinesRow />` — one live story row,
 *   - `<LatestHeadlinesSkeleton />` — initial-load shimmer,
 *   - `<LatestHeadlinesLoadingTail />` / `<LatestHeadlinesEndTail />`
 *     — footer feedback while paginating / once the dataset ends.
 *
 * The widget asks the backend for `PAGE_LIMIT` rows per request.
 * The first page is fetched via the existing `useHeadlines` hook
 * (so the shimmer skeleton stays reactive to `isLoading`); once
 * the user scrolls within `END_REACHED_THRESHOLD_PX` of the bottom
 * of the scroll container, the next page is fetched via
 * `loadHeadlines(PAGE_LIMIT, skip+1, [])` — i.e. `skip` advances
 * by **+1 per scroll trigger**, not by `PAGE_LIMIT`. That means the
 * request asks for 10 rows but 9 of them overlap with rows already
 * on screen, so the response is deduped by `id` before appending
 * and the **visible** increment per scroll is exactly +1 row.
 *
 * No "visible count" cap is applied — once the widget is
 * scrollable, the timeline shows every loaded row the user has
 * uncovered, instead of slicing to a fixed N like the previous
 * `VISIBLE_COUNT = 6` non-scrollable implementation did.
 *
 * Data path: `useHeadlines` + `loadHeadlines` → `api.getHeadlines`.
 *   - During the in-flight window the timeline rail shows a
 *     pulsing shimmer skeleton instead of the live list.
 *   - On success, live `StoryItem`s drive the render.
 *   - On failure (network, empty backend) the timeline shows an
 *     inline empty-state row — there is no mock-data fallback, so
 *     the user always sees what the API actually returned.
 *
 * Used directly by `app/saham/page.tsx` (mobile collapsed slot +
 * desktop right rail). This widget already renders a `<section
 * aria-label="Latest headlines">` so the surrounding layout divs
 * on the page provide all the sidebar context the consumers need.
 */
export function LatestHeadlines() {
  // const { data: topics, isLoading: topicsLoading } = useTopics();
  // const cryptoTopicId = findCryptoTopicId(topics);
  const LATEST_FILTERS: StoryFilter[] = [
        {
          field: "topic_id",
          operator: "ne",
          value: "6a3a496df8d49a8eb8617ff4",
        },
      ];

  // Pagination state. `useHeadlines` seeds the first page (so we
  // get a reactive `isLoading` flag for the skeleton); subsequent
  // pages are appended manually so the array grows monotonically
  // rather than resetting on each `skip` change. The `enabled` flag
  // holds the fetch off until topics resolve — see the long-form
  // comment above.
  const { data: firstPage, isLoading: isFirstPageLoading } = useHeadlines(
    PAGE_LIMIT,
    0,
    LATEST_FILTERS,
  );
  const [items, setItems] = useState<StoryItem[]>([]);
  // Initial-load success flag — once the first page resolves we
  // stop showing the shimmer even if the result is empty (an empty
  // backend response is a valid "no headlines" state, not an error).
  const [firstPageSettled, setFirstPageSettled] = useState(false);
  // Cumulative skip across pages (mirrors the backend's offset).
  const [skip, setSkip] = useState(0);
  // Latched false the moment a page comes back short of PAGE_LIMIT,
  // so the scroll handler doesn't keep firing requests against an
  // empty tail end of the dataset.
  const [hasMore, setHasMore] = useState(true);
  // True only while a `loadMore` request is in flight — guards
  // against the scroll handler firing twice in the same tick (and
  // also lets the trailing "Memuat…" footer render correctly).
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const listRef = useRef<HTMLOListElement | null>(null);

  // Seed items from the first-page hook once it resolves. Lives in
  // its own effect so a 200 with `data: []` still settles the
  // loading flag (and so a `[]` initial value doesn't trigger a
  // re-render storm).
  useEffect(() => {
    if (firstPageSettled) return;
    if (isFirstPageLoading) return;
    setFirstPageSettled(true);
    if (firstPage.length === 0) {
      setHasMore(false);
      return;
    }
    setItems(firstPage);
    setSkip(0);
    if (firstPage.length < PAGE_LIMIT) setHasMore(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFirstPageLoading, firstPage, firstPageSettled]);

  // Render the live list straight from `items` + `isFirstPageLoading`.
  // There is no mock fallback — when the API returns no rows the
  // widget shows an inline empty-state row (handled in the JSX
  // below) instead of silently substituting fake content.

  // Infinite-scroll trigger. Bound to the `<ol>`'s `onScroll` so we
  // don't need an IntersectionObserver; the cost is one event per
  // scroll frame on the timeline, which is negligible at the
  // lengths this widget reaches.
  const handleScroll = useCallback(
    (e: UIEvent<HTMLOListElement>) => {
      if (isLoadingMore || !hasMore) return;
      const el = e.currentTarget;
      const distanceToBottom =
        el.scrollHeight - (el.scrollTop + el.clientHeight);
      if (distanceToBottom > END_REACHED_THRESHOLD_PX) return;

      // Fire-and-track the next page. Mark the in-flight flag
      // *before* the promise so a second scroll event in the same
      // frame (rare, but possible on touch devices) sees the guard
      // and bails.
      //
      // `skip` advances by **+1**, not by `PAGE_LIMIT`, so each
      // request asks the backend for 10 rows but 9 of them overlap
      // with rows already on screen. The dedup-by-id merge below
      // ensures the *visible* increment per scroll is exactly +1
      // row; the request shape stays at `limit=10`. Each (limit,
      // skip) tuple lands on its own cache slot, so scrolling the
      // same distance twice is a free dedup hit (no network).
      setIsLoadingMore(true);
      const nextSkip = skip + PAGE_LIMIT;
      void loadHeadlines(PAGE_LIMIT, nextSkip, LATEST_FILTERS)
        .then((res) => {
          setItems((prev) => {
            const seen = new Set(prev.map((s) => s.id));
            const merged = [...prev];
            for (const story of res.data) {
              if (!seen.has(story.id)) merged.push(story);
            }
            return merged;
          });
          setSkip(nextSkip);
          if (res.data.length < PAGE_LIMIT) setHasMore(false);
        })
        .catch(() => {
          // Pagination failure is non-fatal — stop the scroll
          // handler from firing again, but keep whatever we've
          // already rendered.
          setHasMore(false);
        })
        .finally(() => setIsLoadingMore(false));
    },
    [hasMore, isLoadingMore, skip],
  );

  return (
    <section
      className="overflow-hidden rounded-lg border border-border bg-bg-secondary"
      aria-label="Latest headlines"
    >
      <LatestHeadlinesHeader />

      {/*
        Scroll container. Height is responsive so the timeline
        doesn't dominate the mobile viewport (where a 600px block
        would push the page content out of reach) but still renders
        ~10-12 rows on desktop:

        - mobile (`< sm`):  `max-h-[400px]` — keeps the page flow
          tight on phones, where viewport heights are already
          short and users scroll the page rather than the widget,
        - desktop (`sm:`+): `max-h-[600px]` — taller, so the
          sidebar exposes more rows above the fold before the user
          has to engage the scroll.

        The widget remains scrollable in either case. `overflow-y-auto`
        + `overscroll-behavior: contain` prevent scroll chaining
        into the page body.
      */}
      <ol
        ref={listRef}
        onScroll={handleScroll}
        className="relative max-h-[400px] overflow-y-auto overscroll-contain sm:max-h-[600px]"
      >
        {isFirstPageLoading && (
          <LatestHeadlinesSkeleton count={PAGE_LIMIT} />
        )}

        {items.map((story, idx) => (
          <LatestHeadlinesRow
            key={story.id}
            story={story}
            isLast={idx === items.length - 1}
          />
        ))}

        {/* Empty state: first page resolved with zero rows. Shown
            only after the request settled so it doesn't flash during
            the initial loading window (the skeleton covers that). */}
        {items.length === 0 && firstPageSettled && !isFirstPageLoading && (
          <li className="flex flex-col items-center gap-1 px-4 py-8 text-center">
            <p className="text-[12.5px] font-medium text-text-muted">
              Belum ada headline hari ini.
            </p>
            <p className="font-mono text-[10.5px] text-text-faint">
              Coba refresh beberapa menit lagi.
            </p>
          </li>
        )}

        {isLoadingMore && <LatestHeadlinesLoadingTail />}
        {!hasMore && firstPageSettled && items.length > 0 && (
          <LatestHeadlinesEndTail />
        )}
      </ol>
    </section>
  );
}

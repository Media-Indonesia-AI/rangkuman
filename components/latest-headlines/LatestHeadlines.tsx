"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type UIEvent,
} from "react";
import type { StoryFilter, StoryItem } from "@/lib/api";
import { loadHeadlines, loadTopic } from "@/lib/api/cache";
import { findCryptoTopicId } from "@/lib/util/topicId";
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

/** Topic fetch filter — empty list asks for the full topic
 *  catalogue. Hoisted to module scope so the reference is stable
 *  across renders; passing `[]` inline would change the cache key
 *  on every call and defeat the request-level dedup inside
 *  `loadTopic()`. */
const EMPTY_TOPIC_FILTERS: StoryFilter[] = [];

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
 * The fetch happens in two steps, mirroring
 * `<HeadlineDetailProvider />`:
 *
 *   1. `loadTopic()` first — pulls the topic catalogue so we can
 *      derive the crypto `topic_id` via `findCryptoTopicId()`
 *      (slug match → name match → first-topic fallback). The
 *      widget excludes crypto-tagged stories (those live on
 *      `/crypto` with their own recap feed), so we need that id
 *      before we can build the headline filter.
 *   2. Once the topic id resolves, fire
 *      `loadHeadlines(PAGE_LIMIT, 0, …)` with the
 *      `{ topic_id ne cryptoTopicId }` filter. The pagination
 *      handler below reuses the same filter for each subsequent
 *      page.
 *
 * Both calls go through the request-level cache in
 * `lib/api/cache`, so a warm cache short-circuits the round-trip.
 * The layout-level `<TopicsProvider />` typically warms the topic
 * slot in parallel — by the time `loadTopic()` resolves here it's
 * usually a cache hit, and the headline fetch is what actually
 * hits the wire.
 *
 * Loading state:
 *   - `<LatestHeadlinesSkeleton />` renders while the topic fetch
 *     OR the headline fetch is in flight, so the widget shows one
 *     continuous shimmer from mount to first paint (no flicker at
 *     the handoff between the two requests).
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
  // ── Two-step fetch state ───────────────────────────────────────
  // The sequential fetch (loadTopic → loadHeadlines) isn't
  // expressible through a single hook, so we manage the in-flight
  // / settled flags here the same way `<HeadlineDetailProvider />`
  // does for its headline-by-id resolution (loadHeadlines →
  // loadHeadlineById). `loading` stays true until *both* steps
  // have settled (success or failure), so the skeleton below
  // covers the entire window — including the brief handoff
  // between the two requests — with no flicker.
  const [loading, setLoading] = useState(true);
  // Initial-load success flag — once the headline fetch settles we
  // stop showing the shimmer even if the result is empty (an empty
  // backend response is a valid "no headlines" state, not an error).
  const [firstPageSettled, setFirstPageSettled] = useState(false);
  const [items, setItems] = useState<StoryItem[]>([]);
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
  // Filters resolved once topics arrive, reused for every paginated
  // request below. Held in a ref so the scroll handler closure
  // always reads the latest value without needing it in its dep
  // array (the filter never changes after the initial resolve).
  const filtersRef = useRef<StoryFilter[]>([]);
  const listRef = useRef<HTMLOListElement | null>(null);

  // Sequential fetch: load topics to resolve the crypto topic_id,
  // then load headlines with the derived exclusion filter. Same
  // shape as `<HeadlineDetailProvider />`'s
  // `loadHeadlines(…) → loadHeadlineById(…)` chain.
  useEffect(() => {
    let cancelled = false;

    // Step 1: load topics to find the crypto `topic_id`. The
    // request-level cache inside `loadTopic()` means the
    // layout-level `<TopicsProvider />` may already have warmed
    // this slot; in that case this resolves synchronously off the
    // cache and we move straight to the headline fetch.
    void loadTopic(10, 0, EMPTY_TOPIC_FILTERS)
      .then((res) => {
        if (cancelled) return;
        const cryptoTopicId = findCryptoTopicId(res.data);

        if (!cryptoTopicId) {
          // No crypto topic registered — nothing to filter against.
          // Settle the widget with zero items so the empty state
          // can render below.
          setFirstPageSettled(true);
          setLoading(false);
          setHasMore(false);
          return;
        }

        const filters: StoryFilter[] = [
          { field: "topic_id", operator: "ne", value: cryptoTopicId },
        ];
        filtersRef.current = filters;

        // Step 2: load headlines with the crypto topic excluded.
        // Same chain shape as `<HeadlineDetailProvider />`: the
        // first response is consumed inside this `.then` to
        // extract an id, and the second fetch is fired with that
        // id in hand.
        return loadHeadlines(PAGE_LIMIT, 0, filters)
          .then((res) => {
            if (cancelled) return;
            setItems(res.data);
            setSkip(0);
            if (res.data.length < PAGE_LIMIT) setHasMore(false);
          })
          .catch(() => {
            // First-page fetch failed — leave items empty; the
            // empty state below renders once we've settled.
          })
          .finally(() => {
            if (!cancelled) {
              setFirstPageSettled(true);
              setLoading(false);
            }
          });
      })
      .catch(() => {
        // Topics fetch failed — settle the widget with no items.
        if (!cancelled) {
          setFirstPageSettled(true);
          setLoading(false);
          setHasMore(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Render the live list straight from `items`. There is no mock
  // fallback — when the API returns no rows the widget shows an
  // inline empty-state row (handled in the JSX below) instead of
  // silently substituting fake content.

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
      // `skip` advances by **+PAGE_LIMIT** so each request asks
      // the backend for a fresh page that doesn't overlap with
      // what's already on screen. The dedup-by-id merge below
      // is a safety net for the cache-warm path; in the cold
      // path it's a no-op. Each (limit, skip, filters) tuple
      // lands on its own cache slot, so scrolling the same
      // distance twice is a free dedup hit (no network).
      setIsLoadingMore(true);
      const nextSkip = skip + PAGE_LIMIT;
      void loadHeadlines(PAGE_LIMIT, nextSkip, filtersRef.current)
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
        {/* One continuous shimmer from mount to first paint.
            `loading` stays true across both the topic-resolution
            window AND the headline fetch — including the handoff
            between the two — so the skeleton never flashes off
            only to come back a tick later. */}
        {loading && <LatestHeadlinesSkeleton count={PAGE_LIMIT} />}

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
        {items.length === 0 && firstPageSettled && !loading && (
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

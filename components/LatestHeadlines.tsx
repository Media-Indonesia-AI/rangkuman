"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type UIEvent,
} from "react";
import { BookOpen, Clock, Loader2 } from "lucide-react";
import type { StoryItem } from "@/lib/api";
import { headlines as mockHeadlines } from "@/lib/mock/headlines";
import type { Sentimen } from "@/lib/mock/recaps";
import { loadHeadlines } from "@/lib/api/cache";
import { toSentimen } from "@/lib/util/sentiment";
import { cn, getRelativeTime } from "@/lib/utils";
import { useHeadlines } from "@/lib/hooks/useHeadlines";
import { SentimentBadge } from "./SentimentBadge";
import { Shimmer } from "./Shimmer";

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

/** Tailwind dot/rail color for a story's sentiment. Mirrors the
 *  existing `storyColor` derivation in the previous in-place
 *  `CompactHeadlines` implementation. */
function storyColor(sentiment: Sentimen | undefined): string {
  if (!sentiment) return "bg-text-muted";
  if (sentiment === "positif") return "bg-bullish";
  if (sentiment === "negatif") return "bg-bearish";
  return "bg-mixed";
}

/**
 * "Latest Headlines" widget — vertically scrollable timeline of
 * stories with a relative-time rail, ticker badge, sentiment pill,
 * STORY tag, headline, and source name.
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
 *   - On failure (auth, network, etc.) the widget silently falls
 *     back to the mock headlines so users still see content.
 *
 * `Sidebar` is a server component; this file is the small client
 * island that owns the fetch.
 */
export function LatestHeadlines() {
  // Pagination state. `useHeadlines` seeds the first page (so we
  // get a reactive `isLoading` flag for the skeleton); subsequent
  // pages are appended manually so the array grows monotonically
  // rather than resetting on each `skip` change.
  const { data: firstPage, isLoading: isFirstPageLoading } = useHeadlines(
    PAGE_LIMIT,
    0,
    [],
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

  // Single source-of-truth for the rendered list. Once the first
  // page has settled:
  //   - empty `firstPage` (auth/network failure or empty backend)
  //     → fall back to mock headlines (matches prior behavior),
  //   - non-empty `firstPage` → render the live list (whether the
  //     user has scrolled past page 1 or not).
  // While the first page is still loading we render an empty live
  // list (so the skeleton branch in the JSX fires).
  const renderSource:
    | { kind: "live"; items: StoryItem[] }
    | { kind: "fallback" } =
    items.length > 0 || !firstPageSettled
      ? { kind: "live", items }
      : { kind: "fallback" };

  // Fallback path — show all mock headlines when the API can't.
  // Mock has no notion of "pages" so it always uses the whole
  // array (no `slice`).
  const fallbackItems =
    renderSource.kind === "fallback" ? mockHeadlines : null;

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
      void loadHeadlines(PAGE_LIMIT, nextSkip, [])
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
      <header className="flex items-center border-b border-border bg-bg-tertiary px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-brand" aria-hidden />
          <h3 className="label">Latest Headlines</h3>
        </div>
      </header>

      {/*
        Scroll container. `max-h-[360px]` mirrors the height used
        by the watchlist search-results list so the two scrollable
        widgets visually agree on how much content they expose at
        once. `overflow-y-auto` + `overscroll-behavior: contain`
        prevent scroll chaining into the page body.
      */}
      <ol
        ref={listRef}
        onScroll={handleScroll}
        className="relative max-h-[360px] overflow-y-auto overscroll-contain"
      >
        {renderSource.kind === "live" && isFirstPageLoading && (
          <HeadlinesSkeleton count={PAGE_LIMIT} />
        )}

        {renderSource.kind === "live" &&
          renderSource.items.map((story, idx) => {
            const sentiment = toSentimen(story.sentiment);
            const dotColor = storyColor(sentiment);
            const isLast = idx === renderSource.items.length - 1;
            return (
              <li
                key={story.id}
                className={cn(
                  "group relative pl-8 pr-3 py-2.5 transition-colors hover:bg-bg-tertiary",
                  !isLast && "border-b border-border",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-3 top-0 bottom-0 w-0.5 -translate-x-1/2",
                    dotColor,
                  )}
                />
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-3 top-3.5 h-2 w-2 -translate-x-1/2 rounded-full ring-4 ring-bg-secondary",
                    dotColor,
                  )}
                />

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-muted num-tabular">
                      {getRelativeTime(story.created_at)}
                    </span>
                    {story.primary_ticker_code && (
                      <span className="inline-flex items-center gap-0.5 rounded border border-border bg-bg-tertiary px-1 py-px font-mono text-[9.5px] font-semibold text-text-primary">
                        {story.primary_ticker_code}
                      </span>
                    )}
                    <SentimentBadge sentiment={sentiment} size="sm" />
                    <span className="inline-flex items-center gap-0.5 rounded border border-brand-line bg-brand-soft px-1 py-px font-mono text-[9px] font-semibold uppercase tracking-widest text-brand">
                      <BookOpen className="h-2 w-2" aria-hidden />
                      Story
                    </span>
                  </div>
                  <p className="text-[11.5px] font-medium leading-snug text-text-primary group-hover:text-brand">
                    {story.title}
                  </p>
                </div>
              </li>
            );
          })}

        {fallbackItems?.map((h) => (
          <FallbackRow key={h.id} headline={h} isLast={false} />
        ))}

        {/* Tail states — "loading the next page…" while the scroll
            trigger is in flight, and "no more rows" once `hasMore`
            flips off. Both give the user feedback so the scroll
            container doesn't feel stuck. */}
        {renderSource.kind === "live" && isLoadingMore && (
          <li
            aria-live="polite"
            className="flex items-center justify-center gap-1.5 py-3 font-mono text-[9.5px] uppercase tracking-widest text-text-muted"
          >
            <Loader2 className="h-2.5 w-2.5 animate-spin" aria-hidden />
            Memuat cerita berikutnya…
          </li>
        )}
        {renderSource.kind === "live" &&
          !hasMore &&
          firstPageSettled &&
          items.length > 0 && (
            <li className="py-3 text-center font-mono text-[9.5px] uppercase tracking-widest text-text-faint">
              Sudah sampai akhir
            </li>
          )}
      </ol>
    </section>
  );
}

/** Skeleton shown while the story fetch is in flight — pulsing
 *  rectangles sized to roughly match a single headline row, minus
 *  the real text so the layout doesn't shift when the data arrives. */
function HeadlinesSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={`skel-${i}`}
          className={cn(
            "relative pl-8 pr-3 py-2.5",
            i < count - 1 && "border-b border-border",
          )}
        >
          <span
            aria-hidden
            className="absolute left-3 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-border"
          />
          <span
            aria-hidden
            className="absolute left-3 top-3.5 h-2 w-2 -translate-x-1/2 rounded-full bg-border ring-4 ring-bg-secondary"
          />
          <div className="space-y-1.5">
            <Shimmer className="h-2.5 w-24" />
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-2 w-16" />
          </div>
        </li>
      ))}
    </>
  );
}

/** Renders a mock `MarketHeadline` row using the same visual rules
 *  as the live path so the fallback is visually identical. */
function FallbackRow({
  headline: h,
  isLast,
}: {
  headline: (typeof mockHeadlines)[number];
  isLast: boolean;
}) {
  return (
    <li
      className={cn(
        "group relative pl-8 pr-3 py-2.5 transition-colors hover:bg-bg-tertiary",
        !isLast && "border-b border-border",
      )}
    >
      <span
        aria-hidden
        className="absolute left-3 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-border"
      />
      <span
        aria-hidden
        className="absolute left-3 top-3.5 h-2 w-2 -translate-x-1/2 rounded-full bg-text-muted ring-4 ring-bg-secondary"
      />
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-1">
          <span className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-muted num-tabular">
            {h.relativeTime}
          </span>
          {h.ticker && (
            <span className="inline-flex items-center gap-0.5 rounded border border-border bg-bg-tertiary px-1 py-px font-mono text-[9.5px] font-semibold text-text-primary">
              {h.ticker}
            </span>
          )}
          {h.sentiment && <SentimentBadge sentiment={h.sentiment} size="sm" />}
        </div>
        <p className="text-[11.5px] font-medium leading-snug text-text-primary group-hover:text-brand">
          {h.title}
        </p>
        {h.source && (
          <p className="font-mono text-[9.5px] text-text-muted">{h.source}</p>
        )}
      </div>
    </li>
  );
}

"use client";

/**
 * "Story" widget — multi-date stories for a ticker
 * ("Konteks emiten yang lagi berkembang"). Renders one large featured
 * card (the latest story); the `feed` variant follows it with a stack
 * of compact list rows, the `highlight` variant wraps everything in a
 * card and shows only the featured story.
 *
 * Data comes from `GET headlines/multi-date-stories` via
 * `useMultiStories(ticker)`. The endpoint provides ticker, title,
 * summary, sentiment, created_at, keywords, and topics — fields it
 * doesn't provide yet (a lifecycle status, a price move "sejak story",
 * a milestone timeline) render as `N/A` / are omitted.
 *
 * Variants:
 *   - `feed` (default): borderless section for the `/saham` feed —
 *     featured card + list rows, "Lihat semua (N)" in the header.
 *   - `highlight`: bordered card for the stock detail page — a
 *     `HIGHLIGHT` badge, featured story only, "Lihat semua story" at
 *     the bottom.
 *
 * `ticker` is optional; it defaults to `DEFAULT_TICKER` so the widget
 * works on the non-ticker-scoped `/saham` page.
 */
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMultiStories } from "@/lib/hooks/useMultiStories";
import { useTopicsContext } from "@/components/topics-provider";
import { EmptyStory } from "./EmptyStory";
import { FeaturedStory } from "./FeaturedStory";
import { FeaturedSkeleton, StoriesSkeleton } from "./Skeletons";
import { StoryRow } from "./StoryRow";
import { useCurrentUser } from "@/lib/hooks/useAuth";

/** Fallback ticker when the host page doesn't pass one. */
const DEFAULT_TICKER = "";

/** Fallback topic id when the host page doesn't pass one — `""`
 *  routes the underlying request through the cross-topic feed. */
const DEFAULT_TOPIC_ID = "";

/** How many stories to request (featured + list rows). */
const STORY_LIMIT = 5;

type EmitenStoriesVariant = "feed" | "highlight";

interface EmitenStoriesProps {
  /** Ticker to fetch stories for. Defaults to `DEFAULT_TICKER`. */
  ticker?: string;
  /** Optional topic id (e.g. resolved `"saham"` or `"crypto"`
   *  id from the topics catalog). Forwarded as `topic_id=` to the
   *  multi-date-stories endpoint so each host page shows topic-
   *  scoped stories instead of the cross-topic default. Empty /
   *  `undefined` → cross-topic feed. */
  topicId?: string;
  /** Layout variant (default `"feed"`). */
  variant?: EmitenStoriesVariant;
  className?: string;
  storyLimit?: number;
}

export function EmitenStories({
  ticker = DEFAULT_TICKER,
  topicId = DEFAULT_TOPIC_ID,
  variant = "feed",
  className,
  storyLimit = STORY_LIMIT,
}: EmitenStoriesProps) {
  const { data: stories, total, isLoading } = useMultiStories(
    ticker,
    storyLimit,
    1,
    true,
    topicId,
  );
  const [featured, ...rest] = stories;

  // Resolve the `topicId` back to a slug so the "Lihat semua" link
  // carries the same topic scope the listing already uses
  // (`/story?topic=<slug>` — see `app/story/StoryPage.tsx`). The
  // topics catalog is fetched on the client; if it hasn't landed
  // yet (or the id doesn't match any registered topic), the link
  // falls back to the unparameterized `/story` so the listing
  // shows the cross-topic default. The data fetch above is
  // unaffected — it uses the resolved `topicId` directly, so
  // the feed stays topic-scoped even when the link briefly
  // points at the cross-topic default.
  const { topics } = useTopicsContext();
  const topicSlug = topicId
    ? topics.find((t) => t.id === topicId)?.slug
    : undefined;
  const seeAllHref = topicSlug ? `/story?topic=${topicSlug}` : "/story";

  const user = useCurrentUser();
  if (!user) {
    return null;
  }
  
  const seeAll = (
    <Link
      href={seeAllHref}
      className="group inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold uppercase tracking-widest text-brand transition-colors hover:text-brand-hover"
    >
      {variant === "highlight"
        ? "Lihat semua story"
        : `Lihat semua (${total})`}
      <ArrowRight
        className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );

  // ─── HIGHLIGHT variant — bordered card, featured story only ───
  if (variant === "highlight") {
    return (
      <section
        aria-label="Story emiten"
        className={cn(
          "rounded-lg border border-white bg-bg-secondary p-4",
          className,
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-2 border-b border-white pb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <Newspaper className="h-3.5 w-3.5 text-brand" aria-hidden />
              <span className="label text-text-secondary">Story</span>
              <span className="rounded border border-brand/40 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-widest text-brand">
                Highlight
              </span>
            </div>
            <p className="mt-0.5 text-[12px] text-text-muted">
              Cerita panjang untuk emiten ini
            </p>
          </div>
        </div>

        {isLoading ? (
          <FeaturedSkeleton />
        ) : stories.length === 0 ? (
          <EmptyStory ticker={ticker} />
        ) : (
          <>
            <FeaturedStory story={featured} />
            <div className="mt-3 flex justify-end">{seeAll}</div>
          </>
        )}
      </section>
    );
  }

  // ─── FEED variant (default) — borderless, featured + list rows ───
  return (
    <section aria-label="Story emiten" className={className}>
      <div className="mb-3 flex items-end justify-between gap-2 border-b border-white pb-2">
        <div>
          <div className="flex items-center gap-1.5">
            <Newspaper className="h-3.5 w-3.5 text-brand" aria-hidden />
            <span className="label text-text-secondary">Story</span>
          </div>
        </div>
        {seeAll}
      </div>

      {isLoading ? (
        <StoriesSkeleton />
      ) : stories.length === 0 ? (
        <EmptyStory ticker={ticker} />
      ) : (
        <>
          <FeaturedStory story={featured} />
          <ul className="mt-1">
            {rest.map((story, i) => (
              <li key={story.id}>
                <StoryRow story={story} first={i === 0} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

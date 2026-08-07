"use client";

import { useEffect, useMemo } from "react";
import { useHeadlineId } from "@/lib/hooks/useHeadlineId";
import { useListStory } from "@/lib/hooks/useListStory";
import type {
  EmbeddedStory,
  HeadlineDetail,
  HeadlineKeyword,
  StoryFilter,
} from "@/lib/api";
import { getRelativeTime } from "@/lib/util/formatDate";
import type { Category, Highlight, StoryEvent } from "@/lib/mock/highlights";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SorotanDetailBreadcrumb } from "./SorotanDetailBreadcrumb";
import { SorotanDetailHeader } from "./SorotanDetailHeader";
import { SorotanDetailSummary } from "./SorotanDetailSummary";
import { SorotanDetailTags } from "./SorotanDetailTags";
import { SorotanDetailKeyData } from "./SorotanDetailKeyData";
import { SorotanDetailTimeline } from "./SorotanDetailTimeline";
import { SorotanDetailSources } from "./SorotanDetailSources";
import { SorotanDetailSidebar } from "./SorotanDetailSidebar";

interface CategoryConfig {
  label: string;
  colorClass: string;
}

/** Static palette mapping category slugs to their display label +
 *  color class. Colors live in the design system (Tailwind), not in
 *  the API, so the orchestrator keeps this lookup locally instead
 *  of plumbing a `CategoryConfig[]` map through the route entry. */
const CATEGORY_PALETTE: Record<string, CategoryConfig> = {
  crypto: { label: "Crypto", colorClass: "text-cat-crypto" },
};
const DEFAULT_CATEGORY: CategoryConfig = {
  label: "Crypto",
  colorClass: "text-cat-crypto",
};

export interface SorotanDetailPageProps {
  /** Headline ID — same as the route's `[id]` segment. Drives both
   *  the `useHeadlineId` (parent headline) and `useListStory`
   *  (related stories) fetches. */
  storyId: string;
}

/** Format an ISO timestamp as `HH:MM` (id-ID locale, 24h). Used
 *  when mapping live API stories into the `StoryEvent` shape for
 *  the timeline section. */
function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

/** Empty-state placeholder returned while `useHeadlineId` is still
 *  loading. Widgets naturally render nothing for fields they don't
 *  have (`SorotanDetailKeyData` returns `null` for empty arrays, etc.)
 *  so the loading window is brief and unflashy. */
function emptyDisplayStory(storyId: string): Highlight {
  return {
    id: storyId,
    title: "",
    summary: "",
    category: "crypto",
    affectedCategories: ["crypto"],
    sources: [],
    sourceCount: 0,
    readTime: "",
    timeAgo: "",
    tags: [],
    tickers: [],
    rank: 1,
    flag: undefined,
    events: [],
    keyData: undefined,
  };
}

/**
 * Compose the live API data (parent headline + related stories)
 * into the `Highlight` shape the page widgets expect.
 *
 * Live API fields used: `id`, `title`, `summary`, `primary_ticker_code`,
 * `keywords`, `created_at`, plus each story's `articles[].source_name`
 * (used to populate `sources`).
 *
 * Fields the API doesn't expose yet (`keyData`, `rank`, `flag`,
 * `readTime`) get sensible defaults so the corresponding widgets
 * either render with what they have or naturally fall back to
 * empty (e.g. `SorotanDetailKeyData` already renders `null` when
 * `points.length === 0`).
 *
 * `events[]` is built from the `stories` array (each story →
 * `StoryEvent`) so the timeline section renders live content from
 * the API without a second per-widget fetch.
 */
function buildDisplayStory(
  storyId: string,
  liveDetail: HeadlineDetail | null,
  stories: EmbeddedStory[],
): Highlight {
  // Extract unique source names + events from related stories.
  const sourcesSet = new Set<string>();
  const events: StoryEvent[] = [];
  for (const story of stories) {
    for (const article of story.articles ?? []) {
      sourcesSet.add(article.source_name);
    }
    events.push({
      title: story.headline,
      detail: story.summary,
      time: formatTime(story.recap_date),
      source: story.articles?.[0]?.source_name,
    });
  }

  if (!liveDetail) return emptyDisplayStory(storyId);

  return {
    id: liveDetail.id,
    title: liveDetail.title,
    summary: liveDetail.summary,
    // Gated to "crypto" by convention; if a future category reuses
    // this route we can derive `category` from `liveDetail.topics[0].slug`.
    category: "crypto",
    // Derive from `liveDetail.topics` so multi-category headlines
    // surface their secondary categories in the badge row. The
    // `|| ["crypto"]` fallback can't sit on the right of `.map()`
    // — `Array.prototype.map` always returns an array (even when
    // the source is empty), so `[] || [...]` still yields `[]`. Use
    // an explicit length check, falling back to a single-element
    // `["crypto"]` so the affected row never renders empty. Cast
    // to `Category[]` because the live API doesn't narrow
    // `StoryTopic.slug` to the closed union.
    affectedCategories: (
      liveDetail.topics.length > 0
        ? liveDetail.topics.map((t) => t.slug)
        : ["crypto"]
    ) as Category[],
    sources: Array.from(sourcesSet),
    sourceCount: sourcesSet.size,
    // Placeholders for fields the API doesn't expose yet.
    readTime: "2 mnt",
    timeAgo: getRelativeTime(liveDetail.created_at),
    // `liveDetail.keywords` may arrive as either `string[]` (per the
    // `StoryItem.keywords: string[]` contract) or the richer
    // `HeadlineKeyword[]` object form used by the `last-7-days`
    // endpoint (`{id, label, value, description, sentiment}`).
    // `SorotanDetailTags` (and the rest of the consumer chain) treats
    // this field as a flat `string[]`, so we normalize here at the
    // orchestrator boundary — picking `.label` when an entry is an
    // object, falling back to the raw string otherwise. Without
    // this, an object entry renders as a React child and throws
    // "Objects are not valid as a React child (found: object with
    // keys {id, label, value, description, sentiment})".
    // Cast to the runtime union — `StoryItem.keywords: string[]`
    // is the static type, but at runtime the wire sometimes ships
    // the richer `HeadlineKeyword[]` shape (same as the
    // `last-7-days` endpoint). Without the cast, TS narrows `k`
    // to `never` in the else branch and rejects `k.label`.
    tags: ((liveDetail.keywords ?? []) as (string | HeadlineKeyword)[]).map(
      (k) => (typeof k === "string" ? k : k.label),
    ),
    tickers: liveDetail.primary_ticker_code
      ? [liveDetail.primary_ticker_code]
      : [],
    // `rank` is a Sorotan-home-feed concept; `1` keeps the breadcrumb consistent.
    rank: 1,
    flag: undefined,
    events,
    keyData: undefined,
  };
}

/**
 * `/sorotan/detail/[id]` detail page — thin client-side orchestrator
 * that owns ALL data fetching for the route.
 *
 * Two fetches fire on mount:
 *   1. `useHeadlineId()` — parent headline (title, summary, tags,
 *      primary ticker, created_at). Reads the id from
 *      `useParams<{ id: string }>()`.
 *   2. `useListStory(storyId)` — related stories for the timeline
 *      section + per-article source names for the sources section.
 *      Memoized filter array keeps the request-level cache stable
 *      across renders (same array-identity gotcha as `useTopics`).
 *
 * Both hook results are composed into a single `displayStory`
 * (`Highlight` shape) so the child widgets keep their existing
 * `story`-driven API — none of them need to know whether a field
 * is live or not.
 *
 * The route entry (`app/sorotan/detail/[id]/page.tsx`) is a thin
 * wrapper that just passes `params.id` here + handles
 * `generateMetadata` (a server-only API call).
 *
 * Layout: sticky right rail (`lg:col-span-4`) + main column
 * (`lg:col-span-8`). On smaller breakpoints the sidebar stacks below.
 */
export function SorotanDetailPage({ storyId }: SorotanDetailPageProps) {
  const { detail: liveDetail } = useHeadlineId();

  // Server-side `generateMetadata` runs against the same API host
  // but in a different network context — when the SSR fetch fails
  // (e.g. the server is behind a firewall that blocks outbound
  // traffic to the API), the tab title lands on the neutral
  // "Detail Cerita — Rangkuman" fallback. The client-side
  // `useHeadlineId` hook above resolves the same data on the
  // browser side, so once the live detail lands we overwrite
  // `document.title` with the real story title. SSR sets the
  // baseline, the client upgrades it; both branches land on
  // the correct title without a visible flash because the
  // server baseline is intentionally generic. The effect
  // cleans up to the baseline on unmount so navigating away
  // doesn't leave a stale story title lingering in the tab.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (liveDetail?.title) {
      document.title = `Rangkuman — ${liveDetail.title}`;
    }
    return () => {
      if (typeof document === "undefined") return;
      document.title = "Rangkuman";
    };
  }, [liveDetail?.title]);

  const filters = useMemo<StoryFilter[]>(
    () => [{ field: "headline_id", operator: "eq", value: storyId }],
    [storyId],
  );
  const { data: stories, isLoading: isLoadingStories } = useListStory(
    20,
    0,
    filters,
    storyId !== "",
  );

  const displayStory = buildDisplayStory(storyId, liveDetail, stories);

  // Category configs (label + color) for the badge row. The crypto
  // detail route is gated to the `crypto` category, so both `primary`
  // and `affected` use the same lookup. Once the API exposes a richer
  // category list, this can iterate `displayStory.affectedCategories`.
  const primary =
    CATEGORY_PALETTE[displayStory.category] ?? DEFAULT_CATEGORY;
  const affected = displayStory.affectedCategories
    .map((c) => CATEGORY_PALETTE[c] ?? DEFAULT_CATEGORY)
    .filter(
      (cfg, i, self) => self.findIndex((x) => x.label === cfg.label) === i,
    );

  return (
    <>
      <Navbar />

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-3 sm:px-6 sm:pt-5 lg:max-w-6xl lg:px-8">
        {/* sr-only H1 — story title is the page context, brand is the H1 */}
        <h1 className="sr-only">
          Rangkuman &mdash; Cerita: {displayStory.title}
        </h1>

        <SorotanDetailBreadcrumb rank={displayStory.rank} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* MAIN COLUMN */}
          <article className="min-w-0 lg:col-span-8">
            <SorotanDetailHeader
              story={displayStory}
              primary={primary}
              affected={affected}
            />

            <SorotanDetailSummary summary={displayStory.summary} />
            <SorotanDetailKeyData keywords={liveDetail?.keywords ?? []} />
            <SorotanDetailTags tags={displayStory.tags} />

            <SorotanDetailTimeline events={displayStory.events} sourceCount={displayStory.sourceCount} />

            <SorotanDetailSources
              stories={stories}
              isLoading={isLoadingStories}
            />
          </article>

          {/* SIDEBAR (sticky on lg+) — fetches its own data */}
          <SorotanDetailSidebar storyId={displayStory.id} />
        </div>
      </main>
      <Footer />
    </>
  );
}
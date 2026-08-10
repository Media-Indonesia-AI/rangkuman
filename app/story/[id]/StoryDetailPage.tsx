"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useHeadlineId } from "@/lib/hooks/useHeadlineId";
import { useMultiStories } from "@/lib/hooks/useMultiStories";
import { useTopicsContext } from "@/components/topics-provider";
import {
  findCryptoTopicId,
  findSahamTopicId,
} from "@/lib/util/topicId";
import type { StoryTopicHint } from "./page";
import {
  Hero as StoryHero,
  StoriesList as StoryStoriesList,
  StorySidebar,
} from "@/components/story-detail";

interface StoryDetailPageProps {
  /** Back-link copy — derived by the route entry (`./page.tsx`) from
   *  the inbound `Referer` header so it follows where the visitor
   *  came from (e.g. "Kembali ke Story" when the previous page was
   *  the listing, "Kembali ke BBCA" from a stock page). Defaults to
   *  the pre-referer hardcoded copy for any other caller. */
  backLabel?: string;
  /** Href paired with `backLabel` — kept as a real `<Link>` target
   *  (rather than `router.back()`) so the affordance stays a
   *  crawlable, middle-clickable anchor. */
  backHref?: string;
  /** Optional topic hint — also derived from the inbound `Referer`
   *  by the route entry. When set, the sidebar's "Story Lainnya"
   *  rail is scoped to the matching topic (e.g. "saham"-tagged
   *  stories when the visitor came from `/saham`) so the feed
   *  continues what the visitor was reading on the previous page.
   *  Undefined keeps the sidebar on the cross-topic default — this
   *  is what Beranda gets, since the homepage feed doesn't carry
   *  a topic scope. Resolved into a real id on the client via
   *  `useTopicsContext()` + the `find*TopicId` helpers, because
   *  the topics catalog is auth-gated and not available server-
   *  side. */
  topicHint?: StoryTopicHint;
}

/**
 * Page for `/story/[id]` — composes the four
 * `@/components/story-detail` widgets from the headline detail
 * fetched by `useHeadlineId()` and the multi-stories feed fetched
 * by `useMultiStories()`.
 *
 * The hooks own the route-param lookup + network round-trip + the
 * loading state, so this page is just data wiring: destructure
 * each hook's payload and pass it down to the matching widget.
 *
 * Data sources:
 *   - `useHeadlineId()` → `HeadlineDetail` (drives the hero and
 *     the related-stories list). `stories[]` is the older
 *     `EmbeddedStory` shape used by `StoriesList`.
 *   - `useMultiStories("", 3, 1, true, topicId)` →
 *     `HeadlineLast7DaysItem[]` capped at 3, fed to the sidebar's
 *     "Story Lainnya" rail. Empty ticker pulls the cross-ticker
 *     feed so the sidebar previews the latest headlines
 *     regardless of the current story's ticker; the `topicId`
 *     argument (resolved from `topicHint` via `useTopicsContext`)
 *     scopes the feed to the topic the visitor was reading on
 *     the previous page (e.g. `"saham"` from `/saham`,
 *     `"crypto"` from `/crypto`). When `topicHint` is undefined
 *     the call passes `""` and stays on the cross-topic default
 *     — the behavior for Beranda-originated visits.
 */
export default function StoryDetailPage({
  backLabel = "Kembali ke Saham",
  backHref = "/saham",
  topicHint,
}: StoryDetailPageProps) {
  const { headlineId, detail, isLoading } = useHeadlineId();

  // Resolve `topicHint` to a real topic id on the client. The
  // topics catalog is fetched by the layout-level
  // `<TopicsProvider />` and gated on auth, so this only runs
  // after that fetch settles. `null` (still loading or empty
  // list) flows through to the hook as `""`, which routes the
  // request through the cross-topic slot — same convention used
  // by `<EmitenStories />` on `/saham` and `/crypto`.
  const { topics } = useTopicsContext();
  const resolvedTopicId =
    topicHint === "saham"
      ? findSahamTopicId(topics)
      : topicHint === "crypto"
        ? findCryptoTopicId(topics)
        : null;

  // Sidebar feed — cross-ticker, 3 items, optionally topic-scoped.
  // Empty ticker routes through the cross-ticker endpoint (no
  // suppression); empty/undefined topic id routes through the
  // cross-topic slot.
  const {
    data: otherStories,
    total: otherTotal,
    isLoading: isLoadingOther,
  } = useMultiStories("", 3, 1, true, resolvedTopicId ?? "");

  // Reverse on a fresh copy — `detail.stories` is owned by the
  // hook payload, so mutating it in place would corrupt the
  // upstream cache and toggle between reversed / forward on
  // every Strict Mode double-render. Spreading first makes the
  // order stable across renders.
  const stories = [...(detail?.stories ?? [])].reverse();

  return (
    <>
      <Navbar />

      <main className="relative z-10 mx-auto max-w-4xl px-4 pb-16 pt-3 sm:px-6 sm:pt-5 lg:max-w-6xl lg:px-8">
        {/* Sr-only H1 for SEO */}
        <h1 className="sr-only">Stock Story — Cerita Panjang Emiten</h1>

        {/* Back link */}
        <div className="mb-3">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 font-mono text-[10.5px] tracking-widest text-text-muted transition-colors hover:text-text-primary"
          >
            <ChevronLeft className="h-3 w-3" aria-hidden />
            {backLabel}
          </Link>
        </div>

        <StoryHero detail={detail} isLoading={isLoading} />

        {/* 2-COL: Stories list + sidebar */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* MAIN */}
          <div className="lg:col-span-2 space-y-6">
            <StoryStoriesList
              stories={stories}
              isLoading={isLoading}
              totalCount={stories.length}
            />
            {/* {featured?.articles && featured.articles.length > 0 && (
              <StoryArticles articles={featured.articles} />
            )} */}
          </div>

          {/* SIDEBAR */}
          <StorySidebar
            otherStories={otherStories}
            isLoading={isLoadingOther}
            headlineId={headlineId}
            totalCount={otherTotal}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
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
  backLabel?: string;
  backHref?: string;
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

  // Absolute URL of this detail page, threaded down to the hero's
  // share button. `window.location.origin` is read inside a
  // `useEffect` (not at render time) because this is a client
  // component that Next.js still renders once on the server for
  // SSR — touching `window` during that pass would throw.
  // `trailingSlash: true` in next.config.js means the canonical
  // URL is served with a trailing slash, matching what
  // `generateMetadata` emits in `app/story/[id]/page.tsx`.
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!headlineId) return;
    setShareUrl(`${window.location.origin}/story/${headlineId}/`);
  }, [headlineId]);

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

      <main className="relative z-10 mx-auto max-w-4xl px-4 pb-16 pt-3 sm:px-6 sm:pt-5 lg:max-w-7xl lg:px-8">
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

        <StoryHero detail={detail} isLoading={isLoading} shareUrl={shareUrl ?? undefined} />

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

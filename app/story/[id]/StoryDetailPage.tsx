"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useHeadlineId } from "@/lib/hooks/useHeadlineId";
import { useMultiStories } from "@/lib/hooks/useMultiStories";
import {
  Hero as StoryHero,
  StoriesList as StoryStoriesList,
  StorySidebar,
} from "@/components/story-detail";

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
 *   - `useMultiStories("", 3)` → `HeadlineLast7DaysItem[]` capped
 *     at 3, fed to the sidebar's "Story Lainnya" rail. Empty
 *     ticker pulls the cross-ticker feed so the sidebar previews
 *     the latest headlines regardless of the current story's
 *     ticker.
 */
export default function StoryDetailPage() {
  const { headlineId, detail, isLoading } = useHeadlineId();
  // Sidebar feed — cross-ticker, 3 items. Empty ticker routes
  // through the cross-ticker endpoint (no suppression).
  const {
    data: otherStories,
    total: otherTotal,
    isLoading: isLoadingOther,
  } = useMultiStories("", 3);

  const stories = detail?.stories ?? [];

  return (
    <>
      <Navbar />

      <main className="relative z-10 mx-auto max-w-4xl px-4 pb-16 pt-3 sm:px-6 sm:pt-5 lg:max-w-6xl lg:px-8">
        {/* Sr-only H1 for SEO */}
        <h1 className="sr-only">Stock Story — Cerita Panjang Emiten</h1>

        {/* Back link */}
        <div className="mb-3">
          <Link
            href="/saham"
            className="inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-widest text-text-muted transition-colors hover:text-text-primary"
          >
            <ChevronLeft className="h-3 w-3" aria-hidden />
            Kembali ke /saham/
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

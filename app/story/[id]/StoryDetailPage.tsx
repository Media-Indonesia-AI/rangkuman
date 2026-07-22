"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useHeadlineId } from "@/lib/hooks/useHeadlineId";
import {
  Hero as StoryHero,
  StoriesList as StoryStoriesList,
  Articles as StoryArticles,
  Sidebar as StorySidebar,
} from "@/components/story-detail";

/**
 * Page for `/story/[id]` — composes the four
 * `@/components/story-detail` widgets from the headline detail
 * fetched by `useHeadlineId()`.
 *
 * The hook owns the route-param lookup + the `loadHeadlineById`
 * fetch + the loading state, so this page is just data wiring:
 * destructure `headlineId` / `detail` / `isLoading` from the hook,
 * split `detail.stories` into featured + rest + sidebar slots, and
 * pass everything down to the widgets.
 *
 * `HeadlineDetail` exposes:
 *   - StoryItem fields (`title`, `summary`, `primary_ticker_code`,
 *     `sentiment`, `keywords`, `topics`, `created_at`,
 *     `updated_at`) — these drive the hero.
 *   - `stories: EmbeddedStory[]` — the related stories, used by
 *     the `StoriesList`, the `Articles` widget (liputan from the
 *     first story), and the `Sidebar`.
 */
export default function StoryDetailPage() {
  const { headlineId, detail, isLoading } = useHeadlineId();

  const stories = detail?.stories ?? [];
  const featured = stories[0];
  const rest = stories.slice(1);
  const otherStories = rest.slice(0, 5);

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
              stories={rest}
              isLoading={isLoading}
              totalCount={stories.length}
            />
            {featured?.articles && featured.articles.length > 0 && (
              <StoryArticles articles={featured.articles} />
            )}
          </div>

          {/* SIDEBAR */}
          <StorySidebar
            otherStories={otherStories}
            isLoading={isLoading}
            headlineId={headlineId}
            totalCount={stories.length}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}

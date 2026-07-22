"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TopTicker } from "@/components/TopTicker";
import { useListStory } from "@/lib/hooks/useListStory";
import type { StoryFilter } from "@/lib/api";
import {
  Hero as StoryHero,
  StoriesList as StoryStoriesList,
  Articles as StoryArticles,
  Sidebar as StorySidebar,
} from "@/components/story-detail";

/** Page-size for the headline-scoped `/stories` fetch. Mirrors
 *  `HeadlineStoriesProvider.FETCH_LIMIT` — 10 covers the common
 *  case (most deep-linked headlines return a handful of stories). */
const FETCH_LIMIT = 10;

/**
 * Page for `/story/[id]`. Data flows through
 * `useListStory(limit, 0, [{headline_id, eq, id}])`, and each visual
 * block (hero / stories list / articles / sidebar) is its own widget
 * under `@/components/story-detail`.
 *
 * `useListStory` lists `filters` in its `useEffect` dep array, so
 * the reference is `useMemo`-pinned to `headlineId` to avoid the
 * "Maximum update depth exceeded" loop an inline array would cause.
 */
export default function StoryPage({ params }: { params: { id: string } }) {
  const headlineId = params.id;
  const filters = useMemo<StoryFilter[]>(
    () => [{ field: "headline_id", operator: "eq", value: headlineId }],
    [headlineId],
  );
  const { data: stories, isLoading } = useListStory(FETCH_LIMIT, 0, filters);

  const featured = stories[0];
  const rest = stories.slice(1);
  const otherStories = rest.slice(0, 5);

  return (
    <>
      <TopTicker />
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

        <StoryHero featured={featured} isLoading={isLoading} />

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

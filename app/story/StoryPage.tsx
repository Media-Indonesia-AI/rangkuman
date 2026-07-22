"use client";

import Link from "next/link";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TopTicker } from "@/components/TopTicker";
import { useMultiStories } from "@/lib/hooks/useMultiStories";
import {
  STORY_LIMIT,
  FeaturedCard,
  StoryListRow,
  EmptyState,
  ListingSkeleton,
} from "@/components/story";

/**
 * Page for `/story` — the cross-ticker Story listing.
 *
 * Data comes from `useMultiStories(ticker, limit)` (the
 * `headlines/multi-date-stories` endpoint). With `ticker=""` the
 * hook short-circuits — its `enabled` gate
 * (`ticker.trim().length > 0`) is false, so no request fires and
 * it returns `{ data: [], isLoading: false }`. The hook is wired
 * here so that when the listing endpoint grows a "no-ticker" mode
 * (or a dedicated "all stories" endpoint), only the cache layer
 * needs to change.
 *
 * Each visual block (featured card / list row / skeleton / empty
 * state) is its own widget under `@/components/story` — this file
 * only handles data wiring and page chrome composition.
 */
export default function StoryPage() {
  // Empty ticker — `useMultiStories` skips the request and returns
  // `{ data: [], isLoading: false }`. See JSDoc above.
  const { data: stories, isLoading } = useMultiStories("", STORY_LIMIT);

  const featured = stories[0];
  const rest = stories.slice(1);

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

        {/* Page header */}
        <section className="mb-6">
          <div className="mb-2 flex items-end justify-between border-b-2 border-text-primary pb-1.5">
            <div>
              <h2 className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
                <span aria-hidden>📈</span>
                <span>Stock Story</span>
                <span className="ml-1 inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/15 px-1.5 py-0.5 font-mono text-[9px] tracking-widest text-brand">
                  {isLoading ? "memuat…" : `${stories.length} CERITA`}
                </span>
              </h2>
              <p className="mt-1 text-[14px] leading-snug text-text-secondary sm:text-[15px]">
                Narasi perkembangan emiten dalam jangka panjang — bukan
                berita harian, tapi konteks yang bikin saham bergerak.
              </p>
            </div>
            <span className="hidden font-mono text-[10px] text-text-faint sm:inline">
              Update tiap minggu
            </span>
          </div>
        </section>

        {/* Feed body */}
        {isLoading ? (
          <ListingSkeleton />
        ) : stories.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {featured && <FeaturedCard story={featured} />}
            {rest.length > 0 && (
              <section aria-label="Story lainnya" className="mt-6">
                <div className="mb-2 flex items-end justify-between border-b border-border-strong pb-1">
                  <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
                    Story Lainnya
                  </h3>
                  <span className="font-mono text-[10px] text-text-faint">
                    {rest.length} cerita
                  </span>
                </div>
                <ul className="rounded-b-lg border-x border-b border-border-strong bg-bg-secondary/20 px-3">
                  {rest.map((story) => (
                    <li key={story.id}>
                      <StoryListRow story={story} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}

        {/* Back to /saham/ */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/saham"
            className="group inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-secondary px-3.5 py-2 text-[12.5px] font-semibold text-text-secondary transition-all hover:border-brand hover:text-brand"
          >
            Kembali ke Recap /saham/
            <ArrowRight
              className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ArrowRight, ChevronDown, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useMultiStories } from "@/lib/hooks/useMultiStories";
import { useTopicsContext } from "@/components/topics-provider";
import type { HeadlineLast7DaysItem } from "@/lib/api";
import {
  findCryptoTopicId,
  findSahamTopicId,
} from "@/lib/util/topicId";
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
 * Data comes from `useMultiStories(ticker, limit, page, enabled,
 * topicId)` (the `headlines/multi-date-stories` endpoint). With
 * `ticker=""` the hook drops the `ticker=` query param so the
 * request still fires on the cross-ticker slot instead of being
 * suppressed. Each visual block (featured card / list row /
 * skeleton / empty state) is its own widget under
 * `@/components/story` — this file only handles data wiring and
 * page chrome composition.
 *
 * Topic scoping — the listing reads the inbound `?topic=<hint>`
 * query param so a navigation from `/saham` lands on
 * `/story?topic=saham` and shows saham-scoped stories, while
 * `/crypto` lands on `/story?topic=crypto`. The hint is resolved
 * into a real `topic_id` on the client via `useTopicsContext()` +
 * the `find*TopicId` helpers in `lib/util/topicId.ts` (the topics
 * catalog is auth-gated and not available server-side). When the
 * param is absent (direct visit, share URL, Beranda entry) the
 * feed falls back to the cross-topic default — `topicId=""`,
 * which the cache layer drops from the request.
 */
export default function StoryPage() {
  // `useSearchParams` is a Next.js client hook that opts the
  // subtree it lives in into dynamic rendering. Wrapping the
  // content in `<Suspense>` lets the rest of the page (Navbar /
  // Footer / page chrome) prerender statically while the data
  // wiring streams in client-side. Mirrors the pattern in
  // `app/login/LoginPage.tsx:278-289` and
  // `app/daftar/DaftarPage.tsx:325-340`.
  return (
    <Suspense fallback={null}>
      <StoryPageContent />
    </Suspense>
  );
}

function StoryPageContent() {
  // Inbound `?topic=<hint>` — `"saham"` | `"crypto"`. Any other
  // value (or the param being absent) keeps the feed on the
  // cross-topic default, matching the Beranda / direct-visit
  // behavior. The same value is forwarded to the link widgets
  // below (`<FeaturedCard />`, `<StoryListRow />`) so the
  // detail page receives it via its own `?topic=` query param
  // — the route entry at `app/story/[id]/page.tsx` reads that
  // param and hands it to `<StoryDetailPage>` as `topicHint`,
  // scoping the sidebar's feed. This is more reliable than
  // relying on the detail route's `Referer` lookup, which can
  // drop the hint on hard navigations to the same origin.
  const searchParams = useSearchParams();
  const topicHint = searchParams.get("topic");

  // Resolve the hint into a real backend topic id. The topics
  // catalog is fetched on the client, so the helpers may return
  // `null` while topics are still in flight — the `?? ""` then
  // leaves the underlying request on its cross-topic slot until
  // topics land. Same null/undefined coalescing convention used
  // by `<EmitenStories />` and `app/story/[id]/StoryDetailPage.tsx`.
  const { topics } = useTopicsContext();
  const resolvedTopicId =
    topicHint === "saham"
      ? findSahamTopicId(topics)
      : topicHint === "crypto"
        ? findCryptoTopicId(topics)
        : null;

  // Cross-ticker feed, topic-scoped when the inbound hint names
  // a known topic. The 5th positional arg is the topic id — an
  // empty string routes through to the cross-topic default.
  //
  // Pagination — `page` is local component state so the
  // "Muat lebih banyak" button at the bottom of the list can
  // step it forward. The hook only ever returns the current
  // page's data, so we keep an accumulated `stories` array in
  // component state and merge each fetched page into it via
  // the effect below. `total` is the cross-page story count
  // from the API — used to decide whether the load-more button
  // should still render (when `stories.length < total`).
  const [page, setPage] = useState(1);
  const [stories, setStories] = useState<HeadlineLast7DaysItem[]>([]);
  const { data: pageStories, total, isLoading } = useMultiStories(
    "",
    STORY_LIMIT,
    page,
    true,
    resolvedTopicId ?? "",
  );

  // Merge each fetched page into the accumulated list. On
  // page 1 we replace (covers the initial load + topic
  // changes); on subsequent pages we dedup-by-id and append
  // so the existing cards stay put while the new ones arrive
  // below them. The hook already replaces its `data` ref on
  // each page transition, so this effect fires once per fetch
  // resolution. The empty-array fallback in `loadMultiDateStories`
  // error path (where `pageStories` comes back empty after an
  // error) leaves the accumulated list untouched, which is
  // the safer of the two — losing cards on a transient error
  // would feel worse than keeping the previous page visible.
  useEffect(() => {
    setStories((prev) => {
      if (page === 1) return pageStories;
      const seen = new Set(prev.map((s) => s.id));
      const fresh = pageStories.filter((s) => !seen.has(s.id));
      return fresh.length > 0 ? [...prev, ...fresh] : prev;
    });
  }, [pageStories, page]);

  // Reset to page 1 when the topic hint changes so the
  // listing doesn't carry stale cards from the previous
  // topic into the new scoped feed. The merge effect above
  // will then replace the accumulated list with page 1's
  // topic-scoped payload on the next fetch resolution.
  useEffect(() => {
    setPage(1);
  }, [resolvedTopicId]);

  const hasMore = stories.length < total;
  const loadingMore = page > 1 && isLoading;

  // Page chrome — back link + H2 + subtitle + sr-only H1 follow
  // the inbound `?topic=` hint so the listing's identity stays
  // consistent with the page the visitor came from. The back
  // link specifically routes per-source: a `crypto` hint sends
  // the visitor back to /crypto, a `saham` hint back to
  // /saham, and a missing/unknown hint (direct visit, share
  // URL, Beranda entry) back to "/" so the link reads
  // "Kembali ke Beranda" instead of misleadingly pointing at
  // /saham. Header copy below keeps the pre-topic defaults for
  // the cross-topic case.
  const isSaham = topicHint === "saham";
  const isCrypto = topicHint === "crypto";
  const backHref = isCrypto
    ? "/crypto"
    : isSaham
      ? "/saham"
      : "/";
  const backLabel = isCrypto
    ? "Kembali ke Crypto"
    : isSaham
      ? "Kembali ke Saham"
      : "Kembali ke Beranda";
  const headerTopic = isSaham
    ? "Saham"
    : isCrypto
      ? "Crypto"
      : null;
  const headerSubtitle = isSaham
    ? "Narasi perkembangan saham dalam jangka panjang"
    : isCrypto
      ? "Narasi perkembangan crypto dalam jangka panjang"
      : "Narasi perkembangan emiten dalam jangka panjang";
  const h1Text = headerTopic
    ? `${headerTopic} Story — Cerita Panjang ${headerTopic}`
    : "Stock Story — Cerita Panjang Emiten";

  const featured = stories[0];
  const rest = stories.slice(1);

  return (
    <>
      <Navbar />

      <main className="relative z-10 mx-auto max-w-4xl px-4 pb-16 pt-3 sm:px-6 sm:pt-5 lg:max-w-6xl lg:px-8">
        {/* Sr-only H1 for SEO */}
        <h1 className="sr-only">{h1Text}</h1>

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

        {/* Page header */}
        <section className="mb-6">
          <div className="mb-2 flex items-end justify-between border-b-2 border-text-primary pb-1.5">
            <div>
              <h2 className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
                <span aria-hidden>📈</span>
                <span>{headerTopic} Story{headerTopic ? ` · ${headerTopic}` : ""}</span>
                <span className="ml-1 inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/15 px-1.5 py-0.5 font-mono text-[9px] tracking-widest text-brand">
                  {isLoading ? "memuat…" : `Top ${stories.length} CERITA`}
                </span>
              </h2>
              <p className="mt-1 text-[14px] leading-snug text-text-secondary sm:text-[15px]">
                {headerSubtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Feed body */}
        {isLoading && page === 1 ? (
          <ListingSkeleton />
        ) : stories.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {featured && (
              <FeaturedCard story={featured} topicHint={topicHint ?? undefined} />
            )}
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
                      <StoryListRow
                        story={story}
                        topicHint={topicHint ?? undefined}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 📥 LOAD MORE — appends the next page onto the
                accumulated list. Shown only when the API's
                cross-page `total` says more rows exist beyond
                what we've loaded. While a load-more is in
                flight the button stays in place (so the user
                sees the same affordance they just clicked)
                but renders a spinner + "Memuat…" and is
                disabled, preventing rapid double-clicks from
                queuing multiple page-2 fetches. The skeleton
                gate above (`isLoading && page === 1`) means
                this branch never tears down the existing
                cards during a load-more — only the button
                flips state. */}
            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loadingMore}
                  aria-busy={loadingMore}
                  className="group inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-secondary px-3.5 py-2 text-[12.5px] font-semibold text-text-secondary transition-all hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                      Memuat…
                    </>
                  ) : (
                    <>
                      Muat lebih banyak
                      <ChevronDown
                        className="h-3 w-3 transition-transform group-hover:translate-y-px"
                        aria-hidden
                      />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </>
  );
}

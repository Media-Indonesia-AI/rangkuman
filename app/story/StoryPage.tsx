"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useMultiStories } from "@/lib/hooks/useMultiStories";
import { useTopicsContext } from "@/components/topics-provider";
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
  // behavior.
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
  const { data: stories, isLoading } = useMultiStories(
    "",
    STORY_LIMIT,
    1,
    true,
    resolvedTopicId ?? "",
  );

  // Page chrome — back link + H2 + subtitle + sr-only H1 follow
  // the inbound `?topic=` hint so the listing's identity stays
  // consistent with the page the visitor came from. Cross-topic
  // (no hint / unknown hint) keeps the pre-topic default copy.
  const isSaham = topicHint === "saham";
  const isCrypto = topicHint === "crypto";
  const backHref = isCrypto ? "/crypto" : "/saham";
  const backLabel = isCrypto ? "Kembali ke Crypto" : "Kembali ke Saham";
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
                  {isLoading ? "memuat…" : `${stories.length} CERITA`}
                </span>
              </h2>
              <p className="mt-1 text-[14px] leading-snug text-text-secondary sm:text-[15px]">
                {headerSubtitle}
              </p>
            </div>
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
      </main>

      <Footer />
    </>
  );
}

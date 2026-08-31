"use client";

/**
 * `/saham` — Recap Harian & Sektor Pasar Modal Indonesia.
 *
 * Composes the recap tab (default landing) and the sektor tab
 * from the layout-level `<TopicsProvider />` topic catalog.
 * Cross-cutting concerns (sub-tab persistence, recap-date
 * session, tab-view analytics) are delegated to hooks; this
 * file owns only the data wiring + JSX composition.
 */

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SektorSection } from "@/components/sektor";
import { RecapStockSection, SahamSubTabs } from "@/components/saham";
import { useTopicsContext } from "@/components/topics-provider";
import { useGetStocksTrending } from "@/lib/hooks/useGetStocksTrending";
import { useRecapDateSession } from "@/lib/hooks/useRecapDateSession";
import { useSahamTabSession } from "@/lib/hooks/useSahamTabSession";
import { findSahamTopicId } from "@/lib/util/topicId";

/** Page title (visually hidden) — describes the route for assistive
 *  tech. Reused by both the pre-hydration shell and the populated
 *  render so the `<h1>` is always present in the DOM. */
const PAGE_TITLE =
  "Rangkuman — Saham: Recap Harian & Sektor Pasar Modal Indonesia";

export default function SahamPage() {
  // Sub-tab state lives in `useSahamTabSession` — bundles
  // localStorage persistence + GA4 tab-view tracking. Null until
  // the persisted tab resolves, so the pre-hydration render can
  // skip the tab UI entirely (no flash of "recap" when the user's
  // persisted choice is "sektor").
  const [subTab, setSubTab] = useSahamTabSession();

  // Recap-date state is owned by `useRecapDateSession` — bundles
  // URL-hint hydration + inactivity auto-expiry. Returns a non-null
  // string so consumers don't need their own null-coalesce.
  const [effectiveDate, setIsoDate] = useRecapDateSession();

  const { topics } = useTopicsContext();
  // `null` only while topics are still loading; the recap widget
  // maps it to `undefined` so the underlying request stays on its
  // cross-topic slot until topics land.
  const sahamTopicId = findSahamTopicId(topics);

  const {
    data: trending,
    isLoading: trendingLoading,
    refresh: refreshTrending,
  } = useGetStocksTrending(effectiveDate);

  // Pre-hydration shell — render only the static chrome until the
  // persisted sub-tab resolves.
  if (subTab === null) {
    return (
      <>
        <Navbar />
        <h1 className="sr-only">{PAGE_TITLE}</h1>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <h1 className="sr-only">{PAGE_TITLE}</h1>

      <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 sm:pt-4">
        <SahamSubTabs active={subTab} onChange={setSubTab} />
      </div>

      {subTab === "recap" && (
        <RecapStockSection
          trending={trending}
          trendingLoading={trendingLoading}
          onRefresh={refreshTrending}
          recapDate={effectiveDate}
          onDateChange={setIsoDate}
          topicId={sahamTopicId ?? undefined}
        />
      )}

      {subTab === "sektor" && (
        <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5">
          <SektorSection />
        </main>
      )}
      <Footer />
    </>
  );
}

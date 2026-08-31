"use client";

/**
 * `/saham` — Recap Harian & Sektor Pasar Modal Indonesia.
 *
 * Composes the recap tab (default landing) and the sektor tab
 * from the layout-level `<TopicsProvider />` topic catalog.
 * Cross-cutting concerns (sub-tab persistence, recap-date
 * session) are delegated to hooks; this file owns only the
 * data wiring + JSX composition.
 */

import { useEffect, useRef, useState } from "react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SektorSection } from "@/components/sektor";
import {
  RecapStockSection,
  SahamSubTabs,
  type SahamTab,
} from "@/components/saham";
import { useTopicsContext } from "@/components/topics-provider";
import { track, EVENTS } from "@/lib/analytics-events";
import { useGetStocksTrending } from "@/lib/hooks/useGetStocksTrending";
import { useRecapDateSession } from "@/lib/hooks/useRecapDateSession";
import { findSahamTopicId } from "@/lib/util/topicId";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { safeGetItem, safeSetItem } from "@/lib/util/safeLocalStorage";

/** Type guard for the persisted sub-tab — ignores anything other
 *  than the two known tabs (defensive against manual localStorage
 *  edits and version skew across deploys). */
function isSahamTab(value: unknown): value is SahamTab {
  return value === "recap" || value === "sektor";
}

export default function SahamPage() {
  // Sub-tab — persisted to localStorage so navigating away and
  // back (or a page reload) lands on the same tab. The `null`
  // sentinel lets the write effect tell the pre-hydration
  // render apart from a real selection (same pattern as
  // `<ThemeToggle />`).
  const [subTab, setSubTab] = useState<SahamTab | null>(null);

  // Recap date — handled by a dedicated hook that bundles the
  // URL-hint hydration, localStorage persistence, and inactivity
  // auto-expiry concerns. Returns a non-null string so consumers
  // don't need their own null-coalesce.
  const [effectiveDate, setIsoDate] = useRecapDateSession();

  // Topics catalog — resolves the "saham" topic id so
  // `<EmitenStories />` is scoped to saham-scoped stories. The
  // helper returns `null` only while topics are still loading;
  // mapped to `undefined` for the prop, leaving the underlying
  // request on its cross-topic slot until topics land.
  const { topics } = useTopicsContext();
  const sahamTopicId = findSahamTopicId(topics);

  // "Paling banyak diberitakan" — refetches whenever the
  // selected DatePicker value changes. Declared before the
  // pre-hydration guard below so the hook order is stable
  // across renders.
  const {
    data: trending,
    isLoading: trendingLoading,
    refresh: refreshTrending,
  } = useGetStocksTrending(effectiveDate);

  // Sub-tab persistence — read on mount, write on change.
  // Two effects so the read owns the first write (writing on
  // the pre-hydration render would clobber whatever the user
  // had previously selected).
  useEffect(() => {
    const raw = safeGetItem(STORAGE_KEYS.sahamTab);
    setSubTab(isSahamTab(raw) ? raw : "recap");
  }, []);
  useEffect(() => {
    if (subTab === null) return;
    safeSetItem(STORAGE_KEYS.sahamTab, subTab);
  }, [subTab]);

  // Distinguish the first tab render (after localStorage
  // hydration) from subsequent in-session tab switches. Both
  // get tracked with their own GA4 event — `saham_tab_recap_view`
  // / `saham_tab_sektor_view` — but the `source` param lets
  // the report split "which tab did the visitor land on"
  // from "which tab did they switch to". The generic
  // `page_view` from GoogleAnalytics already covers the bare
  // /saham landing, so it doesn't tell you which tab was
  // active — these tab-specific events fill that gap.
  const isFirstTabRender = useRef(true);
  useEffect(() => {
    if (subTab === null) return;
    track(
      subTab === "recap"
        ? EVENTS.saham_tab_recap_view
        : EVENTS.saham_tab_sektor_view,
      {
        source: isFirstTabRender.current ? "initial" : "switch",
      },
    );
    isFirstTabRender.current = false;
  }, [subTab]);

  // Pre-hydration guard — render only the static chrome until
  // the persisted sub-tab is known. Prevents a flash of "recap"
  // content when the user's persisted choice is "sektor".
  if (subTab === null) {
    return (
      <>
        <Navbar />
        <h1 className="sr-only">
          Rangkuman &mdash; Saham: Recap Harian &amp; Sektor Pasar Modal Indonesia
        </h1>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <h1 className="sr-only">
        Rangkuman &mdash; Saham: Recap Harian &amp; Sektor Pasar Modal Indonesia
      </h1>

      {/* Sub-tab bar — Recap | Sektor */}
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
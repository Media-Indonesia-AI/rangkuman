"use client";

import { Flame, ClipboardList } from "lucide-react";
import type { StoryItem } from "@/lib/api";
import { useHeadlines } from "@/lib/hooks/useHeadlines";
import {
  type Highlight,
  type Category,
} from "@/lib/mock/highlights";
import { StoryHero } from "@/components/StoryHero";
import { StoryEditorial } from "@/components/StoryEditorial";
import { EmitenStories } from "@/components/saham";
import { Shimmer } from "@/components/Shimmer";
import { getRelativeTime } from "@/lib/util/formatDate";

/** Total stories to fetch for the homepage rail. Matches the sum
 *  of the two visible layers below — 1 (Sorotan) + 14 (Berita
 *  Terkini) — so the entire above-the-fold rail lands in a single
 *  network round-trip. */
const HEADLINES_LIMIT = 15;

/** Size of the lead "Sorotan" slot at the top of the homepage. */
const LAYER_1_SIZE = 1;

/** Set of category slugs we recognise on `StoryItem.topics`. Used
 *  by the adapter below to derive the `Category` value the existing
 *  `<StoryHero />` / `<StoryEditorial />` widgets expect — anything
 *  we don't recognise falls back to `"saham"` so the
 *  `CATEGORY_CONFIG[category]` lookup inside those widgets never
 *  returns `undefined`. Mirrors the seven `Category` union members
 *  declared in `lib/mock/highlights.ts`. */
const KNOWN_CATEGORY_SLUGS: Category[] = [
  "saham",
  "bisnis",
  "ekonomi",
  "kebijakan",
  "global",
  "komoditas",
  "crypto",
];

/**
 * Best-effort topic → `Category` mapper. The live `/headlines`
 * endpoint ships `topics[]` with `{ id, slug, name }` and no
 * category field directly, but the homepage widgets still expect
 * the closed `Category` union from the mock catalog. We match by
 * slug first (URL-safe, stable across renames) and fall back to a
 * case-insensitive `name` match — same fallback ladder as
 * `findCryptoTopicId` in `components/crypto-page/cryptoStories.ts`.
 * Unknown topics default to `"saham"` so the icons and colours
 * below never read `undefined`.
 */
function topicToCategory(
  topic: StoryItem["topics"][number] | undefined,
): Category {
  if (!topic) return "saham";
  const slug = topic.slug.trim().toLowerCase();
  if ((KNOWN_CATEGORY_SLUGS as string[]).includes(slug)) {
    return slug as Category;
  }
  const name = topic.name.trim().toLowerCase();
  const nameHit = KNOWN_CATEGORY_SLUGS.find((c) => name.includes(c));
  return nameHit ?? "saham";
}

/**
 * `StoryItem` (live wire) → `Highlight` (mock shape) adapter for the
 * homepage rail. Mirrors the spirit of the local
 * `storyItemToHighlight` inside `<RelatedStoriesList />` and the
 * crypto adapter in `components/crypto-page/cryptoStories.ts`: fill
 * the fields the widgets actually render (`id`, `title`, `summary`,
 * `category`, `affectedCategories`, `timeAgo`, `sourceCount`,
 * `readTime`, `rank`) and leave the rest at safe defaults so the
 * `Highlight` contract stays satisfied.
 *
 * The live wire doesn't ship the editorial fields the homepage
 * cards were originally designed around (a per-source breakdown, an
 * event timeline, key data points), so:
 *   - `sources: []`, `sourceCount: 1` (matches the crypto adapter's
 *     "one story ≈ one article count baseline" — the recap-detail
 *     fetch ships the per-source breakdown later if a card needs
 *     it),
 *   - `readTime: "2 mnt"` placeholder (same default the crypto
 *     adapter uses; we don't have a real estimate yet),
 *   - `events: []`, `flag: undefined`, `tickers: undefined`,
 *     `keyData: undefined` (the homepage rail doesn't render any
 *     of these),
 *   - `keywords` and `tags` are forwarded as-is so the badges the
 *     widgets already use (when `affectedCategories` > 1, the
 *     "Pengaruh ke" chip strip) keep working once we pass real
 *     topics through.
 *
 * `rank` is the 1-based fetch index so the homepage widgets
 * preserve the backend's ordering — the lead item is always the
 * freshest, regardless of topic.
 */
function storyItemToHighlight(
  item: StoryItem,
  index: number,
): Highlight {
  const affected: Category[] = item.topics
    .map((t) => topicToCategory(t))
    .filter((c, i, arr) => arr.indexOf(c) === i);
  const primary = affected[0] ?? "saham";
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    category: primary,
    affectedCategories: affected.length > 0 ? affected : [primary],
    sources: [],
    sourceCount: 1,
    readTime: "2 mnt",
    timeAgo: getRelativeTime(item.created_at),
    tags: item.keywords.map((k) => k.label),
    keywords: item.keywords,
    rank: index + 1,
    events: [],
  };
}

/**
 * Shimmer skeleton matching the two-layer rail above. One pulse-
 * per-slot pattern (gradient bar + headline + summary + meta) sized
 * to the real cards' dimensions so the transition from skeleton →
 * populated data doesn't reflow the page. Rendered while
 * `useHeadlines` is still in flight; replaced with the real rail
 * once `data` lands. `aria-busy` on each section so screen readers
 * know the content is still loading.
 */
function HomeHeadlinesSkeleton() {
  return (
    <>
      {/* 🔥 LAYER 1: SOROTAN — 1 large card */}
      <section aria-label="Sorotan" aria-busy className="mt-4">
        <div className="mb-3 flex items-end justify-between border-b-2 border-text-primary pb-1.5">
          <div>
            <h2 className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
              <Flame className="h-3 w-3" aria-hidden />
              Sorotan
            </h2>
            <p className="mt-0.5 text-[11px] text-text-muted">
              Cerita paling penting hari ini
            </p>
          </div>
          <Shimmer className="h-3 w-12" />
        </div>
        <div className="overflow-hidden rounded-xl border border-border-strong bg-bg-secondary">
          <Shimmer className="h-28 w-full sm:h-32" />
          <div className="space-y-3 px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <Shimmer className="h-3 w-12" />
              <Shimmer className="h-3 w-10" />
              <Shimmer className="h-3 w-10" />
            </div>
            <Shimmer className="h-6 w-5/6 sm:h-7 lg:h-8" />
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-4/5" />
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2.5">
              <Shimmer className="h-3 w-24" />
              <Shimmer className="h-6 w-20" />
            </div>
          </div>
        </div>
      </section>

      {/* 📋 BERITA TERKINI — 14 cards in 2-col grid (merged Sedang Terjadi + Cerita Lain) */}
      <section aria-label="Berita terkini" aria-busy className="mt-8">
        <div className="mb-3 flex items-end justify-between border-b border-border-strong pb-1.5">
          <div>
            <h2 className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
              <ClipboardList className="h-3 w-3" aria-hidden />
              Berita Terkini
            </h2>
            <p className="mt-0.5 text-[11px] text-text-muted">
              Cerita terbaru sepanjang hari
            </p>
          </div>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg border border-border bg-bg-secondary"
            >
              <Shimmer className="h-1.5 w-full" />
              <div className="space-y-2.5 p-3.5 sm:p-4">
                <div className="flex items-center justify-between">
                  <Shimmer className="h-3 w-16" />
                  <Shimmer className="h-3 w-10" />
                </div>
                <Shimmer className="h-5 w-5/6" />
                <Shimmer className="h-3 w-full" />
                <Shimmer className="h-3 w-3/4" />
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <Shimmer className="h-3 w-20" />
                  <Shimmer className="h-3 w-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/**
 * The live homepage rail — Sorotan (1) + Berita Terkini (14)
 * sourced from `useHeadlines(15)`. Lives in a client component
 * because the hook owns `useEffect` / `useState` state; the
 * surrounding server component (`app/HomePage.tsx`) stays untouched
 * and renders the rest of the page chrome.
 *
 * Loading state: while `useHeadlines` is in flight, render the
 * `<HomeHeadlinesSkeleton />` (same two-layer shape, sized to the
 * real cards) so the visitor sees a stable layout rather than a
 * blank wall. The skeleton is replaced wholesale — not section-
 * by-section — so the page never mixes half-populated layers with
 * half-skeleton layers during a slow load.
 *
 * Empty state: when the fetch settles with zero rows, return
 * `null` (no mock fallback) so a backend outage renders the rest
 * of the page chrome (Navbar, BrandSlogan, Footer) without a
 * misleading empty rail.
 */
export function HomeHeadlines() {
  const { data, isLoading } = useHeadlines(HEADLINES_LIMIT);

  if (isLoading) return <HomeHeadlinesSkeleton />;
  if (data.length === 0) return null;

  const stories = data.map(storyItemToHighlight);
  const leadStory = stories[0];
  const beritaTerkini = stories.slice(LAYER_1_SIZE);

  return (
    <>
      {/* 🔥 LAYER 1: SOROTAN — 1 berita paling penting, card besar full-width */}
      {leadStory && (
        <section aria-label="Sorotan" className="mt-4">
          <div className="mb-3 flex items-end justify-between border-b-2 border-text-primary pb-1.5">
            <div>
              <h2 className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
                <Flame className="h-3 w-3" aria-hidden />
                Sorotan
              </h2>
              <p className="mt-0.5 text-[11px] text-text-muted">
                Cerita paling penting hari ini
              </p>
            </div>
            <span className="font-mono text-[10px] text-text-faint">
              1 cerita
            </span>
          </div>
          <StoryHero highlight={leadStory} />
        </section>
      )}

      {/* 📰 Story — multi-date, ticker-agnostic context threads.
          Sits between LAYER 1 (today's lead) and the Berita
          Terkini feed so the visitor first reads the lead
          headline, then encounters the longer-running story
          threads the headline is part of, before moving on to
          the rolling-news cluster below. Uses the default
          `feed` variant — borderless, flows with the home-page
          chrome (no card wrapper needed because this widget
          already owns its own section + header styling). */}
      <div className="mt-8">
        <EmitenStories storyLimit={3}/>
      </div>

      {/* 📋 BERITA TERKINI — 14 berita, 2-col grid (desktop) /
          1-col (mobile), with summary. Merged from the previous
          "Sedang Terjadi" (4 cards) + "Cerita Lain" (10 cards)
          sections into a single rolling-news feed below the
          story-thread widget above. Uses the design language
          of the old "Sedang Terjadi" section: 2-col grid on
          >= sm, `StoryEditorial` with `showSummary` so each
          card shows a 1–2 line desk summary alongside the
          headline and category chip. */}
      {beritaTerkini.length > 0 && (
        <section aria-label="Berita terkini" className="mt-8">
          <div className="mb-3 flex items-end justify-between border-b border-border-strong pb-1.5">
            <div>
              <h2 className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
                <ClipboardList className="h-3 w-3" aria-hidden />
                Berita Terkini
              </h2>
            </div>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {beritaTerkini.map((h) => (
              <StoryEditorial key={h.id} highlight={h} showSummary />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
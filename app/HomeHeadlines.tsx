"use client";

import { Flame, ClipboardList, BookOpen } from "lucide-react";
import type { StoryItem } from "@/lib/api";
import { useHeadlines } from "@/lib/hooks/useHeadlines";
import {
  type Highlight,
  type Category,
} from "@/lib/mock/highlights";
import { StoryHero } from "@/components/StoryHero";
import { StoryEditorial } from "@/components/StoryEditorial";
import { GradientDivider } from "@/components/GradientDivider";
import { getRelativeTime } from "@/lib/util/formatDate";

/** Total stories to fetch for the homepage rail. Matches the sum
 *  of the three visible layers below — 1 + 4 + 10 — so the entire
 *  above-the-fold rail lands in a single network round-trip. */
const HEADLINES_LIMIT = 15;

/** Size of the lead "Sorotan" slot at the top of the homepage. */
const LAYER_1_SIZE = 1;

/** Size of the "Sedang Terjadi" 2-col grid directly below the hero. */
const LAYER_2_SIZE = 4;

/** Size of the "Cerita Lain" 3-col grid at the bottom of the rail. */
const LAYER_3_SIZE = 10;

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
 * The live homepage rail — Sorotan (1) + Sedang Terjadi (4) +
 * Cerita Lain (10) sourced from `useHeadlines(15)`. Lives in a
 * client component because the hook owns `useEffect` / `useState`
 * state; the surrounding server component (`app/HomePage.tsx`)
 * stays untouched and renders the rest of the page chrome.
 *
 * Each layer only renders when it has at least one item to show,
 * so a partially-loaded dataset (e.g. backend returning 6 rows
 * today) gracefully degrades — the hero still appears, the second
 * layer drops, and the third layer shows however many rows landed
 * in slot 5..15.
 */
export function HomeHeadlines() {
  const { data } = useHeadlines(HEADLINES_LIMIT);

  if (data.length === 0) return null;

  const stories = data.map(storyItemToHighlight);
  const leadStory = stories[0];
  const sedangTerjadi = stories.slice(
    LAYER_1_SIZE,
    LAYER_1_SIZE + LAYER_2_SIZE,
  );
  const ceritaLain = stories.slice(LAYER_1_SIZE + LAYER_2_SIZE);

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

      {/* 📋 LAYER 2: SEDANG TERJADI — 4 berita, 2-col grid (desktop) / 1-col (mobile), with summary */}
      {sedangTerjadi.length > 0 && (
        <section aria-label="Sedang terjadi" className="mt-8">
          <div className="mb-3 flex items-end justify-between border-b border-border-strong pb-1.5">
            <div>
              <h2 className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
                <ClipboardList className="h-3 w-3" aria-hidden />
                Sedang Terjadi
              </h2>
              <p className="mt-0.5 text-[11px] text-text-muted">
                Cerita penting lainnya
              </p>
            </div>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {sedangTerjadi.map((h) => (
              <StoryEditorial key={h.id} highlight={h} showSummary />
            ))}
          </div>
        </section>
      )}

      <GradientDivider spacing="my-8" />

      {/* 📚 LAYER 3: CERITA LAIN — sisanya, 3-col grid (desktop), compact (no summary) */}
      {ceritaLain.length > 0 && (
        <section aria-label="Cerita lain" className="mt-2">
          <div className="mb-3 flex items-end justify-between border-b border-border-strong pb-1.5">
            <div>
              <h2 className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
                <BookOpen className="h-3 w-3" aria-hidden />
                Cerita Lain
              </h2>
              <p className="mt-0.5 text-[11px] text-text-muted">
                Berita tambahan hari ini
              </p>
            </div>
            <span className="font-mono text-[10px] text-text-faint">
              {ceritaLain.length} cerita
            </span>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {ceritaLain.map((h) => (
              <StoryEditorial
                key={h.id}
                highlight={h}
                showSummary={false}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

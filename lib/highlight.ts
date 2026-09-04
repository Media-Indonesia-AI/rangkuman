/**
 * Shared types + display config for the homepage / detail widgets
 * (StoryHero, StoryEditorial, StoryTimeline, RelatedStoriesList, the
 * headline-detail orchestrator, etc.).
 *
 * These are adapter-output shapes — every widget consumes them
 * after a wire-shape (`StoryItem`, `HeadlineDetail`) gets translated
 * by an adapter at the orchestrator boundary:
 *
 *   - `storyItemToHighlight` in `app/HomeHeadlines.tsx`
 *   - `buildDisplayStory`     in `components/headline-detail/HeadlineDetailPage.tsx`
 *   - `storyItemToHighlight`  in `components/RelatedStoriesList.tsx`
 *
 * `CATEGORY_CONFIG` is the design-system label + icon + color token
 * table keyed by `Category` so every widget reads the same palette.
 *
 * `KeywordItem` is re-exported from the wire type module so
 * `Highlight.keywords?: KeywordItem[]` resolves to the canonical
 * shape without forcing every importer to add a separate
 * `@/lib/api/types/story` import.
 *
 * History: this module used to live at `lib/mock/highlights.ts`
 * and carry a 1,200+ line mock story catalog. The catalog was
 * removed when every homepage / detail widget moved to live
 * `/api/v1/headlines/` and `/api/v1/headlines/<id>/` — what
 * stayed behind was the shared types + the per-category palette,
 * hence the move out of `lib/mock/` into the top-level `lib/`.
 */

import type { KeywordItem } from "./api/types/story";

export type { KeywordItem };

export type Category = "saham" | "bisnis" | "ekonomi" | "kebijakan" | "global" | "komoditas" | "crypto";

/** Single event in a story's timeline. */
export interface StoryEvent {
  /** Short title of the event, e.g. "BI umumkan rate turun 25 bps" */
  title: string;
  /** Detail/description, optional. */
  detail?: string;
  /** Time of the event, e.g. "14:30" */
  time: string;
  /** Source for this specific event, e.g. "Bloomberg" */
  source?: string;
  /** Optional icon hint for this event (used to color the timeline dot) */
  category?: Category;
}

/** A single key data point shown in the "Data Kunci" callout on the story page. */
export interface KeyDataPoint {
  /** Big number/value, e.g. "6,25%" or "US$ 1,2 M" or "51%". */
  value: string;
  /** Short label, e.g. "Rate baru" or "Valuasi". */
  label: string;
  /** Optional sublabel for context, e.g. "Level terendah Apr 2022". */
  sublabel?: string;
  /** Visual trend indicator. */
  trend?: "up" | "down" | "neutral";
}

export interface Highlight {
  id: string;
  /** Short, factual headline. No clickbait. */
  title: string;
  /** 1-2 sentence summary (the "intinya"). */
  summary: string;
  /** Primary category — used for color/positioning. */
  category: Category;
  /**
   * All categories affected by this event. Includes the primary `category`.
   * E.g. BI Rate story affects [ekonomi, saham, bisnis, kebijakan].
   */
  affectedCategories: Category[];
  /** Source media names, e.g. ["Bloomberg", "CNBC Indonesia"] */
  sources: string[];
  /** Total unique sources covering this story. */
  sourceCount: number;
  /** Estimated read time, e.g. "2 mnt". */
  readTime: string;
  /** Relative time, e.g. "1 jam lalu". */
  timeAgo: string;
  /** Short tags, e.g. ["Fed", "Suku Bunga"]. */
  tags: string[];
  /** Optional country flag emoji (for /global/ stories) — e.g. "🇺🇸". */
  flag?: string;
  /** Optional: which stock tickers are most affected (for cross-linking). */
  tickers?: string[];
  /** Primary ticker code the live wire shipped with this story
   *  (e.g. `"BBCA"`, `"BTC"`). Drives the `<RelatedStoriesList />`
   *  chip text so readers see the concrete asset rather than the
   *  generic topic label ("Crypto" → "BTC"). Optional — the live
   *  `StoryItem.primary_ticker_code` is the canonical source. */
  primary_ticker_code?: string;
  /** Importance rank 1-5 (1 = most important). Used to sort Headline. */
  rank: number;
  /** Chronological timeline of events in this story. */
  events: StoryEvent[];
  /** 2-4 key data points shown as a callout block on the story page. */
  keyData?: KeyDataPoint[];
  keywords?: KeywordItem[];
}

/** Category metadata with display config. */
export const CATEGORY_CONFIG: Record<
  Category,
  {
    label: string;
    /** Emoji or lucide icon name */
    icon: string;
    /** Color token name (without "text-" prefix) */
    colorClass: string;
    /** Soft background for cards */
    softClass: string;
    /** Description for category landing page header. */
    description: string;
    /** Sub-routes for the category landing page. */
    slug: string;
  }
> = {
  saham: {
    label: "Saham",
    icon: "trending-up",
    colorClass: "text-cat-saham",
    softClass: "bg-cat-saham-soft border-cat-saham-line",
    description:
      "Recap emiten LQ45 & IDX30, dividen, earnings, sentimen & pergerakan harga harian.",
    slug: "/saham/",
  },
  bisnis: {
    label: "Bisnis",
    icon: "building-2",
    colorClass: "text-cat-bisnis",
    softClass: "bg-cat-bisnis-soft border-cat-bisnis-line",
    description:
      "Akuisisi, startup, UMKM, korporasi, PHK, ekspansi, funding — dunia bisnis Indonesia.",
    slug: "/bisnis/",
  },
  ekonomi: {
    label: "Ekonomi",
    icon: "landmark",
    colorClass: "text-cat-ekonomi-2",
    softClass: "bg-cat-ekonomi-2-soft border-cat-ekonomi-2-line",
    description:
      "Inflasi, suku bunga, APBN, pertumbuhan, perdagangan, fiskal — indikator & kebijakan moneter.",
    slug: "/ekonomi/",
  },
  kebijakan: {
    label: "Kebijakan",
    icon: "scale",
    colorClass: "text-cat-kebijakan",
    softClass: "bg-cat-kebijakan-soft border-cat-kebijakan-line",
    description:
      "Regulasi, UU, PP, Permendag, POJK, pajak, kebijakan pemerintah yang affect bisnis.",
    slug: "/kebijakan/",
  },
  global: {
    label: "Global",
    icon: "globe",
    colorClass: "text-cat-global",
    softClass: "bg-cat-global-soft border-cat-global-line",
    description:
      "Berita dunia yang relevan buat Indonesia: Fed, geopolitik, commodity, trade war.",
    slug: "/global/",
  },
  komoditas: {
    label: "Komoditas",
    icon: "gem",
    colorClass: "text-cat-komoditas",
    softClass: "bg-cat-komoditas-soft border-cat-komoditas-line",
    description:
      "Harga batu bara, nikel, CPO, minyak — apa yang lo perlu tahu tiap pagi.",
    slug: "/komoditas/",
  },
  crypto: {
    label: "Crypto",
    icon: "bitcoin",
    colorClass: "text-cat-amber-500",
    softClass: "bg-cat-amber-500-soft border-cat-amber-500-line",
    description:
      "Recap Bitcoin, Ethereum, Solana, dan koin top lainnya. Harga, sentimen, dan cerita yang gerak-gerakin pasar.",
    slug: "/crypto/",
  },
};

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import * as Icons from "lucide-react";
import type { HeadlineDetail, StoryFilter, StoryItem } from "@/lib/api";
import { useHeadlines } from "@/lib/hooks/useHeadlines";
import {
  CATEGORY_CONFIG,
  type Category,
  type Highlight,
} from "@/lib/mock/highlights";
import { cn } from "@/lib/utils";
import { getRelativeTime } from "@/lib/util/formatDate";
import { useTopicsContext } from "./topics-provider";
import {
  findCryptoTopicId,
  findSahamTopicId,
} from "@/lib/util/topicId";

/** Crypto ticker codes we explicitly support on the `/crypto` page
 *  and that show up in `lib/mock/crypto.ts`. Membership in this set
 *  is how we decide whether the current headline belongs to the
 *  "crypto" topic (and therefore which `topic_id` to scope the rail
 *  to). Everything else falls through to the "saham" topic — the
 *  Indonesian-emiten convention is uppercase 4-letter codes (BBCA,
 *  TLKM, ASII, …) which never collide with the crypto set, so the
 *  two partitions don't overlap in practice. */
const CRYPTO_TICKER_CODES = new Set<string>([
  "BTC",
  "ETH",
  "SOL",
  "DOGE",
  "LINK",
  "FET",
]);

/** Decide which topic the current headline belongs to. Crypto wins
 *  if EITHER signal says "crypto":
 *
 *   1. `primary_ticker_code` is one of the crypto codes we render on
 *      `/crypto` (BTC / ETH / SOL / DOGE / LINK / FET) — matches
 *      `CoinTickerCard` / `COIN_KODE_TO_STORY_ID`.
 *   2. Any entry in `topics[]` has `slug === "crypto"` — the API's
 *      authoritative topic tag, which catches headlines whose
 *      primary ticker isn't crypto but the article itself is (e.g.
 *      a regulation piece that doesn't name a coin).
 *
 *  Otherwise — Indonesian emiten headline, no crypto topic — return
 *  `"saham"`. Never returns `undefined`: the caller always wants a
 *  concrete topic to scope the rail to. */
function topicHintForHeadline(
  detail: HeadlineDetail | null | undefined,
): "crypto" | "saham" {
  const ticker = detail?.primary_ticker_code?.trim().toUpperCase();
  if (ticker && CRYPTO_TICKER_CODES.has(ticker)) return "crypto";
  const topics = detail?.topics ?? [];
  for (const t of topics) {
    if (t.slug === "crypto") return "crypto";
  }
  return "saham";
}

interface RelatedStoriesListProps {
  className?: string;
  /** Header label. */
  label?: string;
  /** Right-side meta text under label. */
  meta?: string;
  /**
   * Visual variant:
   *  - "compact" (default): text-only, dense list. Good for 4+ items.
   *  - "featured": bigger headlines + summary visible. Good for 2-3 items.
   */
  variant?: "compact" | "featured";
  /**
   * The headline id of the story currently being viewed. The rail
   * filters this id out of BOTH the live-fetched rows and the prop
   * fallback so the current story can never appear in its own
   * "Cerita Terkait" sidebar. Required — leaving it empty would
   * defeat the purpose, so the parent must always pass it.
   */
  currentHeadlineId: string;
  /**
   * The full `HeadlineDetail` for the story currently being viewed.
   * Drives the topic-id pick (`crypto` vs `saham`) via
   * {@link topicHintForHeadline} so the live rail fetches the
   * right topic's stories instead of being hardcoded to "crypto"
   * (the pre-existing behavior, kept for callers that don't pass
   * the prop). Optional — when omitted, the rail stays on its
   * historical crypto-only path.
   */
  currentHeadline?: HeadlineDetail | null;
}

const HERO_GRADIENT: Record<string, string> = {
  saham: "bg-hero-saham",
  bisnis: "bg-hero-bisnis",
  ekonomi: "bg-hero-ekonomi",
  kebijakan: "bg-hero-kebijakan",
  global: "bg-hero-global",
  komoditas: "bg-hero-komoditas",
};

/**
 * Best-effort `StoryItem` (live wire) → `Highlight` (mock shape)
 * adapter for the `RelatedStoriesList` rail. Mirrors the spirit of
 * `storyItemToCryptoStory` in `components/crypto-page/cryptoStories.ts`
 * — fill the fields the list actually renders (`id`, `title`,
 * `summary`, `category`, `timeAgo`, `sourceCount`, `rank`) and
 * leave the rest at safe defaults so the `Highlight` contract
 * stays satisfied.
 *
 * `category` + `affectedCategories` are sourced from the live
 * story's `topics[]`, intersected with the closed `Category`
 * union. The rail's chrome (`CATEGORY_CONFIG[category]`,
 * `HERO_GRADIENT[category]`, the per-row chip color/icon) only
 * knows the seven whitelisted slugs, so anything outside that
 * set gets dropped. When a story has no usable topic tag the
 * caller passes `fallbackCategory` (the topic hint derived from
 * `currentHeadline`) so the rail still renders with a sensible
 * color/icon pair instead of falling back to undefined and
 * breaking the lookup downstream.
 *
 * The live wire doesn't ship:
 *   - a per-source breakdown  → `sources: []`, `sourceCount: 1`
 *     (one story ≈ one article count baseline; the crypto adapter
 *     uses the same default),
 *   - events / keyData / etc. → `[]` / `undefined` (the rail
 *     doesn't render them).
 *
 * `rank` uses the fetch order (1-indexed) so the "Sedang
 * Terjadi"-style `#1 #2 #3 #4` badges read as newest-first
 * inside the rail. `timeAgo` comes from the shared
 * `getRelativeTime()` helper so the rail text matches the rest
 * of the page.
 */
const ALLOWED_CATEGORIES = new Set<Category>([
  "saham",
  "bisnis",
  "ekonomi",
  "kebijakan",
  "global",
  "komoditas",
  "crypto",
]);

function storyItemToHighlight(
  item: StoryItem,
  rank: number,
  fallbackCategory: Category,
): Highlight {
  // Pull every topic slug the API ships, drop anything that
  // isn't on the `Category` whitelist, and dedupe. The cast is
  // safe because we filter on the whitelist above — without it
  // `affectedCategories: Category[]` would fail for any slug
  // outside the closed union (e.g. a future "politik" tag).
  const affected = Array.from(
    new Set(
      (item.topics ?? [])
        .map((t) => t.slug)
        .filter((s): s is Category => ALLOWED_CATEGORIES.has(s as Category)),
    ),
  );
  // Primary category is the first surviving topic; if the story
  // shipped no usable topics, fall back to the caller-supplied
  // hint so the chip color/icon still matches the rail's scope.
  const primary = affected[0] ?? fallbackCategory;
  const affectedCategories = affected.length > 0 ? affected : [fallbackCategory];

  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    category: primary,
    affectedCategories,
    sources: [],
    sourceCount: 1,
    readTime: "2 mnt",
    timeAgo: getRelativeTime(item.created_at),
    keywords: item.keywords ?? [],
    tags: [],
    // Primary ticker code from the live wire — drives the
    // `<RelatedStoriesList />` chip text. Optional because some
    // stories (policy, market-mood narratives) ship without a
    // concrete ticker; the rail then falls back to the category
    // label in the render branch.
    primary_ticker_code: item.primary_ticker_code?.trim().toUpperCase() || undefined,
    rank,
    events: [],
  };
}

/**
 * Compact vertical list of related stories for sidebar use.
 * - "compact" variant: small dot + category chip + headline + byline. For 4+ items.
 * - "featured" variant: bigger headline + summary visible. For 2-3 items.
 */
export function RelatedStoriesList({
  className,
  label = "Cerita Terkait",
  meta,
  variant = "compact",
  currentHeadlineId,
  currentHeadline,
}: RelatedStoriesListProps) {
  // ── Live topic-scoped headlines ────────────────────────────────
  // When the caller hands us a `topicId`, fire a 4-row
  // `useHeadlines(topic_id=…)` fetch and let the live result
  // shadow the `stories` prop. The prop stays in place as a
  // fallback so existing callers (the headline-detail sidebar
  // passes a pre-filtered `related[]` from its orchestrator) keep
  // rendering until — or instead of — the live response lands.
  //
  // The filter array is memoized to keep the request-level cache
  // slot stable across renders (same array-identity gotcha
  // documented in `useHeadlines` and `useListStory`).
  //
  // Topic id is derived from `currentHeadline` — see
  // `topicHintForHeadline`. Crypto wins if either the primary
  // ticker is a known crypto code OR any of the headline's
  // `topics[].slug === "crypto"`. Everything else scopes to
  // "saham". When `currentHeadline` isn't passed at all, the
  // helper falls through to "saham" (the previous behavior was
  // crypto-only — older callers that don't pass the prop now
  // land on saham instead, which is the safer default since
  // most editorial stories are saham, not crypto).
  const { topics } = useTopicsContext();
  const topicHint = topicHintForHeadline(currentHeadline);
  const topicId =
    topicHint === "crypto"
      ? findCryptoTopicId(topics)
      : findSahamTopicId(topics);
  const topicFilters = useMemo<StoryFilter[]>(
    () =>
      topicId
        ? [{ field: "topic_id", operator: "eq", value: topicId }]
        : [],
    [topicId],
  );
  const { data: liveRows } = useHeadlines(
    4,
    0,
    topicFilters,
    topicId !== undefined && topicId !== "",
  );

  // Pick the source list:
  //   - live: hook returned ≥1 row for the topic — use those
  //     (already adapted to the `Highlight` shape below).
  //   - mock: hook not active or returned empty — fall back to the
  //     prop. This is the path the existing `HeadlineDetailSidebar`
  //     call site takes today.
  //
  // Either branch drops the current headline id BEFORE mapping, so
  // the current story can never end up in the rail — its rank
  // badge, link target, or duplicate card never leaks in. The
  // `excludeId` prop still applies afterwards as a belt-and-braces
  // for callers that pass a different id (e.g. some other
  // pre-filtered list).
  const filtered: Highlight[] =
    topicId && liveRows.length > 0
      ? liveRows
          .filter((item) => item.id !== currentHeadlineId)
          .map((item, i) => storyItemToHighlight(item, i + 1, topicHint))
      : [];

  if (filtered.length === 0) return null;

  return (
    <section
      aria-label="Cerita terkait"
      className={cn(
        "rounded-lg border border-border-strong bg-bg-secondary/50",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border-strong px-3 py-2">
        <div className="flex items-center gap-1.5">
          <ArrowRight className="h-3 w-3 text-brand" aria-hidden />
          <h3 className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-secondary">
            {label}
          </h3>
        </div>
        <span className="font-mono text-[8.5px] uppercase tracking-widest text-text-faint">
          {meta ?? `${filtered.length} cerita`}
        </span>
      </div>
      <ul>
        {filtered.map((s, i) => {
          // The chip displays the story's primary ticker code from
          // the live row — `primary_ticker_code` on `StoryItem` is
          // the canonical "what is this story about" field, which
          // is more concrete for readers than a topic label
          // ("crypto" → "BTC"). When the adapter couldn't read a
          // ticker (e.g. an empty primary code) we fall back to
          // the category label so the chip still says something.
          const cfg = CATEGORY_CONFIG[s.category];
          const tickerChip = s.primary_ticker_code?.trim().toUpperCase();
          const chipText = tickerChip || cfg.label;
          // Color/icon still come from the row's primary category
          // so the chip stays visually consistent with the row's
          // accent strip / dot.
          const IconComponent =
            (Icons as unknown as Record<string, Icons.LucideIcon>)[
              cfg.icon
                .split("-")
                .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                .join("")
            ] ?? TrendingUp;

          if (variant === "featured") {
            return (
              <li
                key={s.id}
                className={i < filtered.length - 1 ? "border-b border-border/50" : ""}
              >
                <Link
                  href={`/headline/detail/${s.id}`}
                  className="group block px-3 py-3 transition-colors hover:bg-bg-tertiary/40"
                >
                  {/* Top accent strip (mini hero) */}
                  <div
                    className={cn(
                      "mb-2 h-1 w-12 rounded-full",
                      HERO_GRADIENT[s.category] ?? "bg-hero-saham",
                    )}
                    aria-hidden
                  />
                  <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider",
                        cfg.colorClass,
                      )}
                    >
                      <IconComponent className="h-2.5 w-2.5" aria-hidden />
                      {chipText}
                    </span>
                    <span className="font-mono text-[8.5px] text-text-faint">
                      · #{s.rank}
                    </span>
                  </div>
                  <p className="text-[13px] font-semibold leading-snug text-text-primary transition-colors group-hover:text-text-primary">
                    {s.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-text-secondary">
                    {s.summary}
                  </p>
                  <p className="mt-1.5 font-mono text-[9px] text-text-muted">
                    {s.timeAgo}
                  </p>
                </Link>
              </li>
            );
          }

          // compact variant
          return (
            <li
              key={s.id}
              className={i < filtered.length - 1 ? "border-b border-border/50" : ""}
            >
              <Link
                href={`/headline/detail/${s.id}`}
                className="group block px-3 py-2.5 transition-colors hover:bg-bg-tertiary/40"
              >
                <div className="mb-1 flex items-center justify-between gap-1.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider",
                      cfg.colorClass,
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        HERO_GRADIENT[s.category] ?? "bg-hero-saham",
                      )}
                      aria-hidden
                    />
                    {chipText}
                  </span>
                  <span className="font-mono text-[8.5px] text-text-faint">
                    #{s.rank}
                  </span>
                </div>
                <p className="line-clamp-3 text-[12px] font-semibold leading-snug text-text-primary transition-colors group-hover:text-text-primary">
                  {s.title}
                </p>
                <p className="mt-1 line-clamp-1 font-mono text-[9px] text-text-muted">
                  {s.timeAgo} · {s.sourceCount} sumber
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import * as Icons from "lucide-react";
import type { StoryFilter, StoryItem } from "@/lib/api";
import { useHeadlines } from "@/lib/hooks/useHeadlines";
import {
  CATEGORY_CONFIG,
  type Highlight,
} from "@/lib/mock/highlights";
import { cn } from "@/lib/utils";
import { getRelativeTime } from "@/lib/util/formatDate";
import { useTopicsContext } from "./topics-provider";
import { findCryptoTopicId } from "./crypto-page/cryptoStories";
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
 * The live wire doesn't ship:
 *   - a per-source breakdown  → `sources: []`, `sourceCount: 1`
 *     (one story ≈ one article count baseline; the crypto adapter
 *     uses the same default),
 *   - a category slug         → `category: "crypto"`. The list
 *     is only rendered from the crypto-detail sidebar today, and
 *     the `Category` type is a closed union, so anything that
 *     isn't one of the seven known slugs would break
 *     `CATEGORY_CONFIG[category]` downstream. If a future caller
 *     reuses this from a non-crypto route, swap in the real
 *     topic-derived slug here.
 *   - events / keyData / etc. → `[]` / `undefined` (the rail
 *     doesn't render them).
 *
 * `rank` uses the fetch order (1-indexed) so the "Sedang
 * Terjadi"-style `#1 #2 #3 #4` badges read as newest-first
 * inside the rail. `timeAgo` comes from the shared
 * `getRelativeTime()` helper so the rail text matches the rest
 * of the page.
 */
function storyItemToHighlight(item: StoryItem, rank: number): Highlight {
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    category: "crypto",
    affectedCategories: ["crypto"],
    sources: [],
    sourceCount: 1,
    readTime: "2 mnt",
    timeAgo: getRelativeTime(item.created_at),
    keywords: item.keywords ?? [],
    tags: [],
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
}: RelatedStoriesListProps) {
  // ── Live topic-scoped headlines ────────────────────────────────
  // When the caller hands us a `topicId`, fire a 4-row
  // `useHeadlines(topic_id=…)` fetch and let the live result
  // shadow the `stories` prop. The prop stays in place as a
  // fallback so existing callers (the crypto-detail sidebar
  // passes a pre-filtered `related[]` from its orchestrator) keep
  // rendering until — or instead of — the live response lands.
  //
  // The filter array is memoized to keep the request-level cache
  // slot stable across renders (same array-identity gotcha
  // documented in `useHeadlines` and `useListStory`).
  const { topics } = useTopicsContext();
  const topicId = findCryptoTopicId(topics);
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
  //     prop. This is the path the existing `CryptoDetailSidebar`
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
          .map((item, i) => storyItemToHighlight(item, i + 1))
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
          const cfg = CATEGORY_CONFIG[s.category];
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
                  href={`/crypto/detail/${s.id}`}
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
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider",
                        cfg.colorClass,
                      )}
                    >
                      <IconComponent className="h-2.5 w-2.5" aria-hidden />
                      {cfg.label}
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
                href={`/crypto/detail/${s.id}`}
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
                    {cfg.label}
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

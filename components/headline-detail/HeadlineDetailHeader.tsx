"use client";

import { Newspaper, Tag } from "lucide-react";
import { CATEGORY_CONFIG, type Highlight } from "@/lib/highlight";
import { ShareButton } from "@/components/ShareButton";
import { cn } from "@/lib/utils";
import { SITE_URL } from "@/lib/og";

/** The primary category config — labels + colors live in the
 *  design system (`CATEGORY_CONFIG`), so the orchestrator just
 *  forwards the resolved entry instead of re-declaring the shape
 *  here. */
export type PrimaryCategoryConfig = (typeof CATEGORY_CONFIG)[keyof typeof CATEGORY_CONFIG];

interface HeadlineDetailHeaderProps {
  story: Highlight;
  primary: PrimaryCategoryConfig;
}

const HERO_GRADIENT_CLASS = "bg-hero-global";

/**
 * Hero card at the top of the detail page — category gradient strip,
 * category badge row, the story title, and the meta line
 * (source count + sources + share button on the right).
 *
 * Server component: the underlying `<ShareButton>` is the only
 * client island and handles its own state.
 */
export function HeadlineDetailHeader({
  story,
  primary,
}: HeadlineDetailHeaderProps) {
  // Affected categories are derived directly from
  // `story.affectedCategories` (the closed `Category[]` union on
  // `Highlight`) and looked up against `CATEGORY_CONFIG` for label
  // + color. The list is deduped against `primary` so the primary
  // badge doesn't appear twice when a headline's primary category
  // also appears in its affected list. Slugs outside the
  // whitelist (shouldn't happen — `buildDisplayStory` filters
  // them out at the orchestrator boundary, but defensive)
  // fall through with `undefined` and get skipped.
  const affected = story.affectedCategories
    .filter((slug) => slug !== story.category)
    .map((slug) => ({ slug, cfg: CATEGORY_CONFIG[slug] }))
    .filter(
      (entry): entry is { slug: typeof entry.slug; cfg: (typeof CATEGORY_CONFIG)[typeof entry.slug] } =>
        Boolean(entry.cfg),
    );

  return (
    <header className="glass-card relative overflow-hidden rounded-xl border border-border-strong bg-bg-secondary p-5 sm:p-7">
      {/* Top hero gradient strip */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1.5 opacity-90",
          HERO_GRADIENT_CLASS,
        )}
        aria-hidden
      />
      {/* Faint pattern overlay */}
      <div className="pattern-dot-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden />

      <div className="relative">
        {/* Category badges row */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded border bg-bg-tertiary px-2 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-wider",
              primary.colorClass,
              "border-current/30",
            )}
          >
            <Tag className="h-2.5 w-2.5" aria-hidden />
            {story.tickers ?? primary.label}
          </span>
          {affected.map(({ slug, cfg }) => (
            <span
              key={slug}
              className={cn(
                "inline-flex items-center gap-1 rounded border border-current/20 bg-bg-tertiary/60 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider",
                cfg.colorClass,
              )}
            >
              {cfg.label}
            </span>
          ))}
          <span className="ml-auto font-mono text-[10.5px] text-text-faint">
            {story.timeAgo}
          </span>
        </div>

        {/* Title — page H1 lives in the page wrapper as sr-only */}
        <h2 className="font-serif text-[24px] font-bold leading-tight tracking-tight text-text-primary sm:text-[36px] sm:leading-[1.1]">
          {story.title}
        </h2>

        {/* Meta line */}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10.5px] text-text-muted">
            <span className="inline-flex items-center gap-1">
            <Newspaper className="h-3 w-3" aria-hidden />
            {story.sourceCount} sumber
          </span>
          <span>·</span>
          <span className="line-clamp-1">
            {story.sources.slice(0, 3).join(", ")}
            {story.sources.length > 3 && ` +${story.sources.length - 3}`}
          </span>
          {/* Share button — pushed to the right edge of the meta
              line via `ml-auto` (ShareButton doesn't accept a
              className prop, so we wrap it). `tone="light"`
              pins the static white-on-dark styling because the
              hero gradient is dark in both themes (it doesn't
              follow the `.dark` class), so the auto-detection
              would pick the wrong side in light mode. */}
          <div className="ml-auto">
            <ShareButton
              tone="light"
              title={story.title}
              url={`${SITE_URL}/headline/detail/${story.id}`}
              surface="headline_detail_header"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
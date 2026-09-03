import Link from "next/link";
import { ArrowRight, TrendingUp, Newspaper } from "lucide-react";
import * as Icons from "lucide-react";
import {
  CATEGORY_CONFIG,
  type Highlight,
  type Category,
} from "@/lib/mock/highlights";
import { cn } from "@/lib/utils";

interface StoryEditorialProps {
  highlight: Highlight;
  /** Show 1-2 sentence summary under title (12px). Default true. */
  showSummary?: boolean;
  className?: string;
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
 * Editorial card used in homepage "Sedang Terjadi" (2-col with summary)
 * and "Cerita Lain" (3-col, compact without summary).
 */
export function StoryEditorial({
  highlight,
  showSummary = true,
  className,
}: StoryEditorialProps) {
  const cfg = CATEGORY_CONFIG[highlight.category];

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-bg-secondary transition-all hover:border-border-strong",
        className,
      )}
    >
      <Link href={`/headline/detail/${highlight.id}`} className="flex h-full flex-col">
        {/* Gradient header strip with icon */}
        <div
          className={cn(
            "relative flex h-1.5 w-full",
            HERO_GRADIENT[highlight.category] ?? "bg-hero-saham",
          )}
          aria-hidden
        />

        <div className="flex flex-1 flex-col gap-2 p-3.5 sm:p-4">
          {/* Category + time. Instead of pinning only the primary
              `cfg.label`, render the full `affectedCategories[]`
              inline — every topic the story is filed under gets its
              own icon + label chip — so a multi-topic card
              ("ekonomi" that also touches "saham" and "kebijakan")
              reads as one rich row instead of two stacked rows.
              Layout mirrors `timeAgo`: on `sm:`+ the list sits on
              the left of the same flex row with `justify-between`
              pushing `timeAgo` to the right; on smaller widths the
              row stacks vertically (`flex-col`) so a long list
              never gets squeezed. */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
            <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              {highlight.affectedCategories.map((c) => {
                const cc = CATEGORY_CONFIG[c];
                const CategoryIcon =
                  (Icons as unknown as Record<string, Icons.LucideIcon>)[
                    cc.icon
                      .split("-")
                      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                      .join("")
                  ] ?? TrendingUp;
                return (
                  <span
                    key={c}
                    className={cn(
                      "inline-flex items-center gap-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-widest",
                      cc.colorClass,
                    )}
                  >
                    <CategoryIcon className="h-3 w-3" aria-hidden />
                    {cc.label}
                  </span>
                );
              })}
            </span>
            <span className="font-mono text-[9.5px] text-text-faint">
              {highlight.timeAgo}
            </span>
          </div>

          {/* Serif headline */}
          <h3 className="font-serif text-[16.5px] font-bold leading-[1.2] tracking-tight text-text-primary sm:text-[18px]">
            {highlight.title}
          </h3>

          {/* Optional summary (12px text-secondary) */}
          {showSummary && (
            <p className="line-clamp-3 text-[12px] leading-snug text-text-secondary">
              {highlight.summary}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}

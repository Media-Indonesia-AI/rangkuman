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
  const IconComponent =
    (Icons as unknown as Record<string, Icons.LucideIcon>)[
      cfg.icon
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join("")
    ] ?? TrendingUp;

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-bg-secondary transition-all hover:border-border-strong",
        className,
      )}
    >
      <Link href={`/crypto/detail/${highlight.id}`} className="flex h-full flex-col">
        {/* Gradient header strip with icon */}
        <div
          className={cn(
            "relative flex h-1.5 w-full",
            HERO_GRADIENT[highlight.category] ?? "bg-hero-saham",
          )}
          aria-hidden
        />

        <div className="flex flex-1 flex-col gap-2 p-3.5 sm:p-4">
          {/* Category + time */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 font-mono text-[9.5px] font-semibold uppercase tracking-widest",
                cfg.colorClass,
              )}
            >
              <IconComponent className="h-3 w-3" aria-hidden />
              {cfg.label}
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
            <p className="line-clamp-2 text-[12px] leading-snug text-text-secondary">
              {highlight.summary}
            </p>
          )}

          {/* Spacer pushes meta to bottom */}
          <div className="mt-auto" />

          {/* Meta line — bold source count + category color */}
          <div className="flex items-center justify-between gap-2 border-t border-border pt-2 font-mono text-[9.5px] text-text-muted">
            <span className="line-clamp-1">
              {highlight.flag && (
                <span className="mr-1 text-[11px]" aria-hidden>
                  {highlight.flag}
                </span>
              )}
              <span className="inline-flex items-center gap-0.5">
                <Newspaper className="h-2.5 w-2.5" aria-hidden />
                <span
                  className={cn(
                    "font-bold tabular-nums",
                    cfg.colorClass,
                  )}
                >
                  {highlight.sourceCount}
                </span>
                <span> sumber</span>
              </span>
              <span className="mx-1">·</span>
              <span>{highlight.readTime}</span>
            </span>
            <ArrowRight
              className="h-3 w-3 text-text-faint transition-all group-hover:translate-x-0.5 group-hover:text-text-secondary"
              aria-hidden
            />
          </div>
        </div>
      </Link>
    </article>
  );
}

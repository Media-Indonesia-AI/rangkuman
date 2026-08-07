import Link from "next/link";
import { TrendingUp } from "lucide-react";
import * as Icons from "lucide-react";
import {
  CATEGORY_CONFIG,
  type Highlight,
  type Category,
} from "@/lib/mock/highlights";
import { cn } from "@/lib/utils";

interface StoryCompactProps {
  highlight: Highlight;
  /** Optional rank for ordering (e.g. #5, #6). */
  rank?: number;
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
 * Text-only list item, WSJ "also happening" style. Time on left, headline bold,
 * byline below, no image. Tight, scannable.
 */
export function StoryCompact({ highlight, rank }: StoryCompactProps) {
  const cfg = CATEGORY_CONFIG[highlight.category];
  const IconComponent =
    (Icons as unknown as Record<string, Icons.LucideIcon>)[
      cfg.icon
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join("")
    ] ?? TrendingUp;

  // Affected categories (count for visual indicator).
  const affectedCount = highlight.affectedCategories.length;

  return (
    <Link
      href={`/sorotan/detail/${highlight.id}`}
      className="group block border-b border-border/60 py-3.5 last:border-b-0"
    >
      <div className="flex items-start gap-3">
        {/* Left rail: rank + color dot */}
        <div className="flex w-7 shrink-0 flex-col items-center gap-1 pt-0.5">
          {rank !== undefined && (
            <span className="font-mono text-[10px] font-semibold text-text-faint">
              #{rank}
            </span>
          )}
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              HERO_GRADIENT[highlight.category] ?? "bg-hero-saham",
            )}
            aria-hidden
          />
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Category + time row */}
          <div className="mb-1 flex items-center gap-1.5 font-mono text-[9.5px] text-text-muted">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold uppercase tracking-wider",
                cfg.colorClass,
              )}
            >
              <IconComponent className="h-2.5 w-2.5" aria-hidden />
              {cfg.label}
            </span>
            <span className="text-text-faint">·</span>
            <span>{highlight.timeAgo}</span>
            {affectedCount > 1 && (
              <>
                <span className="text-text-faint">·</span>
                <span className="text-text-faint">{affectedCount} topik</span>
              </>
            )}
          </div>

          {/* Headline (sans, not serif, for visual hierarchy contrast) */}
          <h3 className="text-[14.5px] font-semibold leading-snug text-text-primary transition-colors group-hover:text-text-primary sm:text-[15px]">
            {highlight.title}
          </h3>

          {/* Byline */}
          <p className="mt-1 line-clamp-1 font-mono text-[10.5px] text-text-muted">
            By {highlight.sources.slice(0, 2).join(", ")}
            {highlight.sources.length > 2 && ` +${highlight.sources.length - 2}`}
          </p>
        </div>
      </div>
    </Link>
  );
}

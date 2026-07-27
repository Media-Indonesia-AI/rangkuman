import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import * as Icons from "lucide-react";
import {
  CATEGORY_CONFIG,
  type Highlight,
} from "@/lib/mock/highlights";
import { cn } from "@/lib/utils";

interface RelatedStoriesListProps {
  stories: Highlight[];
  className?: string;
  /** Header label. */
  label?: string;
  /** Right-side meta text under label. */
  meta?: string;
  /** Optional current story id to exclude (in case helper didn't filter it). */
  excludeId?: string;
  /**
   * Visual variant:
   *  - "compact" (default): text-only, dense list. Good for 4+ items.
   *  - "featured": bigger headlines + summary visible. Good for 2-3 items.
   */
  variant?: "compact" | "featured";
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
 * Compact vertical list of related stories for sidebar use.
 * - "compact" variant: small dot + category chip + headline + byline. For 4+ items.
 * - "featured" variant: bigger headline + summary visible. For 2-3 items.
 */
export function RelatedStoriesList({
  stories,
  className,
  label = "Cerita Terkait",
  meta,
  excludeId,
  variant = "compact",
}: RelatedStoriesListProps) {
  const filtered = excludeId
    ? stories.filter((s) => s.id !== excludeId)
    : stories;

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
                    {s.timeAgo} · {s.sourceCount} sumber
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

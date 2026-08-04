import Link from "next/link";
import { ArrowRight, Clock, Newspaper, TrendingUp } from "lucide-react";
import * as Icons from "lucide-react";
import {
  CATEGORY_CONFIG,
  type Highlight,
} from "@/lib/mock/highlights";
import { cn } from "@/lib/utils";

interface StoryHeroProps {
  highlight: Highlight;
}

const HERO_GRADIENT: Record<string, string> = {
  saham: "bg-hero-saham",
  bisnis: "bg-hero-bisnis",
  ekonomi: "bg-hero-ekonomi",
  kebijakan: "bg-hero-kebijakan",
  global: "bg-hero-global",
  komoditas: "bg-hero-komoditas",
};

const HERO_PATTERN: Record<string, string> = {
  saham: "pattern-chart-line",
  bisnis: "pattern-dot-grid",
  ekonomi: "pattern-chart-line",
  kebijakan: "pattern-dot-grid",
  global: "pattern-dot-grid",
  komoditas: "pattern-dot-grid",
};

/**
 * Lead-story hero block. WSJ-style: big serif headline, byline, category badge,
 * gradient hero background (acts as "illustration" without a real photo), CTA.
 */
export function StoryHero({ highlight }: StoryHeroProps) {
  const cfg = CATEGORY_CONFIG[highlight.category];
  const IconComponent =
    (Icons as unknown as Record<string, Icons.LucideIcon>)[
      cfg.icon
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join("")
    ] ?? TrendingUp;

  return (
    <article className="group relative overflow-hidden rounded-xl border border-border-strong bg-bg-secondary">
      {/* Full-bleed gradient hero "image" */}
      <div
        className={cn(
          "relative h-28 w-full overflow-hidden sm:h-32",
          HERO_GRADIENT[highlight.category] ?? "bg-hero-saham",
        )}
        aria-hidden
      >
        {/* Pattern overlay */}
        <div
          className={cn(
            "absolute inset-0 opacity-50",
            HERO_PATTERN[highlight.category] ?? "pattern-dot-grid",
          )}
        />
        {/* Big watermark icon (decorative). Uses the PRIMARY
            category icon only — this is the "hero image"
            watermark, not a multi-topic indicator. */}
        <IconComponent
          className="absolute -right-4 -top-4 h-32 w-32 rotate-12 text-white/[0.06] sm:-right-6 sm:-top-6 sm:h-40 sm:w-40"
          strokeWidth={1.2}
          aria-hidden
        />
        {/* Gradient fade-to-bg for text legibility */}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-bg-secondary to-transparent" />
        {/* Category badge strip floating top-left. Renders the
            full `affectedCategories[]` — every topic the story
            is filed under — each as its own icon + label chip,
            matching the same visual vocabulary as the top row of
            `<StoryEditorial />` and `<StockHero />`. Replaces the
            prior "primary only" badge so a multi-topic story
            (e.g. an "ekonomi" piece that also touches "saham"
            and "kebijakan") shows all three pills here instead
            of relying on a separate "Pengaruh ke:" strip in the
            content area — the strip below is removed. The LIVE
            pill stays as the rightmost element so the freshness
            signal isn't lost. `flex-wrap` lets the pills wrap
            onto a second line when the list is long, preventing
            overflow into the headline / CTA. */}
        <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-1.5 sm:left-4 sm:top-4">
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
                className="inline-flex items-center gap-1 rounded border border-white/20 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm"
              >
                <CategoryIcon className="h-2.5 w-2.5" aria-hidden />
                {cc.label}
              </span>
            );
          })}
          <span className="inline-flex items-center gap-1 rounded border border-white/20 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            LIVE
          </span>
        </div>
      </div>

      {/* Content area */}
      <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
        {/* Serif headline — more compact */}
        <Link href={`/crypto/detail/${highlight.id}`} className="block">
          <h2 className="font-serif text-[22px] font-bold leading-[1.1] tracking-tight text-text-primary transition-colors group-hover:text-text-primary sm:text-[28px] sm:leading-[1.08] lg:text-[32px] lg:leading-[1.05]">
            {highlight.title}
          </h2>
        </Link>

        {/* Dek (subtitle/dek in editorial terms) */}
        <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-text-secondary sm:text-[13.5px]">
          {highlight.summary}
        </p>

        {/* Byline / meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-border pt-2.5 font-mono text-[10px] text-text-muted">
          <span>{highlight.timeAgo}</span>

          {/* CTA */}
          <Link
            href={`/crypto/detail/${highlight.id}`}
            className="ml-auto inline-flex items-center gap-1 rounded border border-current/30 bg-current/5 px-2 py-0.5 text-[10px] font-semibold text-text-primary transition-all hover:bg-current/10"
          >
            Baca cerita
            <ArrowRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

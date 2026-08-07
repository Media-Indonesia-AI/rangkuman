"use client";

import { Clock, Newspaper, Tag } from "lucide-react";
import type { Highlight } from "@/lib/mock/highlights";
import { ShareButton } from "@/components/ShareButton";
import { SavedButton } from "@/components/SavedButton";
import { LoginPromptOverlay } from "@/components/LoginPromptOverlay";
import { cn } from "@/lib/utils";

interface CategoryConfig {
  label: string;
  colorClass: string;
}

interface SorotanDetailHeaderProps {
  story: Highlight;
  primary: CategoryConfig;
  /** De-duplicated list of affected category configs (excluding `primary`). */
  affected: CategoryConfig[];
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
 * Hero card at the top of the detail page — category gradient strip,
 * category badge row, the story title, the meta line (read time /
 * sources), and the Share + Save action row.
 *
 * Server component: the underlying `<ShareButton>` / `<SavedButton>`
 * are the only client islands and they handle their own state.
 */
export function SorotanDetailHeader({
  story,
  primary,
  affected,
}: SorotanDetailHeaderProps) {
  return (
    <header className="glass-card relative overflow-hidden rounded-xl border border-border-strong bg-bg-secondary p-5 sm:p-7">
      {/* Top hero gradient strip */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1.5 opacity-90",
          HERO_GRADIENT[story.category] ?? "bg-hero-saham",
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
            {primary.label}
          </span>
          {affected
            .filter((c) => c.label !== primary.label)
            .slice(0, 4)
            .map((c) => (
              <span
                key={c.label}
                className={cn(
                  "inline-flex items-center gap-1 rounded border border-current/20 bg-bg-tertiary/60 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider",
                  c.colorClass,
                )}
              >
                {c.label}
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
        </div>

        {/* Action row */}
        <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
          <ShareButton
            title={story.title}
            url={`https://rangkuman.news/sorotan/detail/${story.id}`}
          />
          <SavedButton
            id={story.id}
            kind="story"
            publishedAt={new Date().toISOString().slice(0, 10)}
            variant="default"
          />
        </div>
      </div>

      {/*
        Auth gate. The hero card's `<header>` is already
        `relative overflow-hidden`, so the overlay positions
        correctly over the whole hero. Hidden automatically when
        the user is signed in (`LoginPromptOverlay` early-returns
        on truthy user).
      */}
      <LoginPromptOverlay title="Masuk dulu untuk lihat headline crypto ini" />
    </header>
  );
}
"use client";

import { useState, useEffect, useCallback } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSaved } from "@/lib/hooks/useSaved";
import type { SavedItemKind } from "@/lib/saved";

interface SavedButtonProps {
  /** The id used for the saved list. For stocks: ticker. For stories: story id. */
  id: string;
  /** Kind of item. */
  kind: SavedItemKind;
  /** ISO date the item was published (yyyy-mm-dd) — used for display only. */
  publishedAt: string;
  /** Compact = overlay style (icon-only, small). Default = standalone with text. */
  variant?: "compact" | "default";
  /** Color theme: "light" for dark backgrounds (default), "dark" for light backgrounds. */
  tone?: "light" | "dark";
}

export function SavedButton({
  id,
  kind,
  publishedAt,
  variant = "compact",
  tone = "light",
}: SavedButtonProps) {
  const { check, toggle } = useSaved();
  const [mounted, setMounted] = useState(false);

  // Avoid SSR mismatch — saved state is localStorage-only.
  useEffect(() => {
    setMounted(true);
  }, []);

  const isCurrentlySaved = mounted ? check(id) : false;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const nowSaved = toggle(id, kind, publishedAt);
      window.dispatchEvent(
        new CustomEvent("berita-investor:toast", {
          detail: nowSaved ? "Tersimpan" : "Dihapus",
        }),
      );
    },
    [id, kind, publishedAt, toggle],
  );

  const sizeClasses = variant === "compact" ? "h-7 w-7" : "h-8 px-2.5";
  const iconSize = variant === "compact" ? "h-3.5 w-3.5" : "h-3.5 w-3.5";

  const baseTone =
    tone === "light"
      ? "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
      : "border-border bg-bg-tertiary hover:border-border-strong";

  const activeClass = isCurrentlySaved
    ? tone === "light"
      ? "border-brand/50 bg-brand/15 text-brand"
      : "border-brand/50 bg-brand/10 text-brand"
    : `${baseTone} text-white/80 hover:text-white`;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isCurrentlySaved ? "Hapus dari tersimpan" : "Simpan"}
      aria-pressed={isCurrentlySaved}
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-md border transition-colors",
        sizeClasses,
        activeClass,
      )}
    >
      {isCurrentlySaved ? (
        <BookmarkCheck className={iconSize} aria-hidden />
      ) : (
        <Bookmark className={iconSize} aria-hidden />
      )}
      {variant === "default" && (
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider">
          {isCurrentlySaved ? "Tersimpan" : "Simpan"}
        </span>
      )}
    </button>
  );
}

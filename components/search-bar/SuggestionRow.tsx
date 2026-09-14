"use client";

import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuggestionRowProps {
  item: { href: string; label: string; hint: string };
  active: boolean;
  onClick: () => void;
  onHover: () => void;
}

/** One row in the suggestions list. Tappable (renders as a
 *  `<button role="option">` so screen readers announce the
 *  active descendant) with a leading icon, a label / hint
 *  stack, and a trailing "Saham" tag. */
export function SuggestionRow({ item, active, onClick, onHover }: SuggestionRowProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onClick}
      onMouseEnter={onHover}
      className={cn(
        "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition-colors",
        active ? "bg-bg-tertiary" : "hover:bg-bg-tertiary/60",
      )}
    >
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-bg-tertiary text-bullish">
        <TrendingUp className="h-3 w-3" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12.5px] font-semibold text-text-primary">
          {item.label}
        </span>
        <span className="block truncate text-[10.5px] text-text-muted">
          {item.hint}
        </span>
      </span>
      <span className="shrink-0 font-mono text-[9.5px] font-semibold uppercase tracking-widest text-bullish">
        Saham
      </span>
    </button>
  );
}

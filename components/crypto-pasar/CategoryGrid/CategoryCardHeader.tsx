import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CoinCategory } from "@/lib/api";
import { formatUsd } from "./formatters";

// ─── Hue palette ────────────────────────────────────────────────
//
// The wire shape doesn't carry a per-category hue, so we derive
// one deterministically from the category name (same djb2-ish
// hash `lib/util/sectorMappers.ts` uses for sectors). Keeping the
// palette identical to the sector grid means cards in both
// sections feel like one design system.

export type Hue = "amber" | "sky" | "rose" | "violet" | "emerald" | "slate";

const HUES: Hue[] = ["amber", "sky", "rose", "violet", "emerald", "slate"];

function hashName(name: string): number {
  let h = 5381;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) + h + name.charCodeAt(i)) | 0;
  }
  return h;
}

export function resolveHue(name: string): Hue {
  return HUES[Math.abs(hashName(name)) % HUES.length];
}

const HUE_TEXT: Record<Hue, string> = {
  amber: "text-amber-500",
  sky: "text-sky-500",
  rose: "text-rose-500",
  violet: "text-violet-500",
  emerald: "text-emerald-500",
  slate: "text-slate-400",
};

const HUE_BG: Record<Hue, string> = {
  amber: "bg-amber-500/20",
  sky: "bg-sky-500/20",
  rose: "bg-rose-500/20",
  violet: "bg-violet-500/20",
  emerald: "bg-emerald-500/20",
  slate: "bg-slate-500/20",
};

const HUE_BORDER: Record<Hue, string> = {
  amber: "border-amber-500/30",
  sky: "border-sky-500/30",
  rose: "border-rose-500/30",
  violet: "border-violet-500/30",
  emerald: "border-emerald-500/30",
  slate: "border-slate-500/30",
};

interface CategoryCardHeaderProps {
  cat: CoinCategory;
  hue: Hue;
}

/** Header strip: icon badge (hue-derived) + category name + 24h
 *  volume. No sentiment badge — the wire shape doesn't carry one. */
export function CategoryCardHeader({ cat, hue }: CategoryCardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-2 border-b border-border bg-bg-tertiary px-3.5 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border",
            HUE_BORDER[hue],
            HUE_BG[hue],
            HUE_TEXT[hue],
          )}
        >
          <Coins className="h-3.5 w-3.5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-[14px] font-bold tracking-tight text-text-primary">
            {cat.name}
          </h3>
          <p className="font-mono text-[10px] text-text-muted">
            Vol 24h {formatUsd(cat.volume_24h)}
          </p>
        </div>
      </div>
    </div>
  );
}

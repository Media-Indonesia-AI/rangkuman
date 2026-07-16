/**
 * Tailwind class fragments for the sector card's per-hue palette.
 *
 * Extracted from the old `components/SektorSection.tsx` so the
 * main component stays focused on layout and the card lives in
 * its own file. Three parallel `Record<SektorHue, string>` maps:
 *
 *   - `hueText`   → applied to the inline Building2 icon glyph
 *   - `hueBg`     → background tint for the rounded icon badge
 *   - `hueBorder` → border tint for the rounded icon badge
 *
 * Each sector carries a `hue` field that maps into these
 * lookups; consumers spread all three into the same `cn(...)` so
 * the three layers stay coordinated per sector.
 */

import type { SektorHue } from "@/lib/util/sectorMappers";

export const hueText: Record<SektorHue, string> = {
  amber: "text-amber-500",
  sky: "text-sky-500",
  rose: "text-rose-500",
  violet: "text-violet-500",
  emerald: "text-emerald-500",
  slate: "text-slate-400",
};

export const hueBg: Record<SektorHue, string> = {
  amber: "bg-amber-500/20",
  sky: "bg-sky-500/20",
  rose: "bg-rose-500/20",
  violet: "bg-violet-500/20",
  emerald: "bg-emerald-500/20",
  slate: "bg-slate-500/20",
};

export const hueBorder: Record<SektorHue, string> = {
  amber: "border-amber-500/30",
  sky: "border-sky-500/30",
  rose: "border-rose-500/30",
  violet: "border-violet-500/30",
  emerald: "border-emerald-500/30",
  slate: "border-slate-500/30",
};

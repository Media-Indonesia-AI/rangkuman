/**
 * Hue palette for the category cards. The keys (`amber`, `sky`,
 * …) match `Coin["hue"]` in `lib/mock/crypto.ts`; each entry
 * bundles the three Tailwind classes the card needs (chip
 * background, border tint, foreground icon tint).
 */

export const HUE_BG: Record<string, string> = {
  amber: "bg-amber-500/15",
  sky: "bg-sky-500/15",
  rose: "bg-rose-500/15",
  violet: "bg-violet-500/15",
  emerald: "bg-emerald-500/15",
  slate: "bg-slate-500/15",
};

export const HUE_BORDER: Record<string, string> = {
  amber: "border-amber-500/30",
  sky: "border-sky-500/30",
  rose: "border-rose-500/30",
  violet: "border-violet-500/30",
  emerald: "border-emerald-500/30",
  slate: "border-slate-500/30",
};

export const HUE_TEXT: Record<string, string> = {
  amber: "text-amber-500",
  sky: "text-sky-500",
  rose: "text-rose-500",
  violet: "text-violet-500",
  emerald: "text-emerald-500",
  slate: "text-slate-400",
};

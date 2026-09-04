/**
 * Hero-strip gradient picker.
 *
 * Stock cards (`components/stock-card/*`) and the stock detail page
 * (`components/stock/StockHero`) paint a small gradient backdrop
 * behind the ticker name. This helper hashes the ticker code to a
 * stable hue index so each ticker gets a distinct color and the
 * same ticker always renders with the same gradient — keeping SSR
 * and client output identical (no hydration mismatch).
 */

/** Hue keys used by both the picker and the gradient palette below.
 *  Kept local — the picker is the only place that needs to enumerate
 *  them, so exporting them wider would just leak an implementation
 *  detail. */
type HeroHue = "amber" | "emerald" | "rose" | "sky" | "violet" | "slate";

/** Tailwind gradient classes mapped to each hue bucket. Lives next
 *  to the picker so the palette and its consumer can't drift. */
const HUE_GRADIENT: Record<HeroHue, string> = {
  amber: "from-amber-500/20 via-orange-500/10 to-transparent",
  emerald: "from-emerald-500/20 via-teal-500/10 to-transparent",
  rose: "from-rose-500/20 via-red-500/10 to-transparent",
  sky: "from-sky-500/20 via-cyan-500/10 to-transparent",
  violet: "from-violet-500/20 via-fuchsia-500/10 to-transparent",
  slate: "from-slate-500/20 via-zinc-500/10 to-transparent",
};

/**
 * Pick a hue-gradient class string for the given ticker code.
 * The result is one of the entries in `HUE_GRADIENT` (e.g.
 * `"from-sky-500/20 via-cyan-500/10 to-transparent"`).
 */
export function pickHeroGradient(kode: string): string {
  const keys = Object.keys(HUE_GRADIENT) as HeroHue[];
  let hash = 0;
  for (let i = 0; i < kode.length; i++) {
    hash = (hash * 31 + kode.charCodeAt(i)) >>> 0;
  }
  return HUE_GRADIENT[keys[hash % keys.length]];
}

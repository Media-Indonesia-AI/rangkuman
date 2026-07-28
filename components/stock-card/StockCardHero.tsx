"use client";

import { cn } from "@/lib/utils";

interface StockCardHeroProps {
  /** Two-stop gradient classes (e.g. `"from-amber-500 to-rose-500"`)
   *  passed straight to `bg-gradient-to-br`. Sourced from
   *  `pickHeroGradient(ticker)` so the same ticker always gets the
   *  same gradient. */
  heroGradient: string;
  /** 1-based rank in the feed. When present, rendered as "#01" /
   *  "#02" pinned to the top of the panel. */
  rank?: number;
  /** Ticker code, rendered as the panel's headline (oversized
   *  monospace). */
  ticker: string;
  /** Full legal company name (e.g. `"Bank Central Asia Tbk"`).
   *  Optional — when present, rendered in a smaller line below the
   *  ticker so the panel reads as `BBCA · Bank Central Asia Tbk`.
   *  Clamped to two lines so a long name doesn't blow out the
   *  hero's vertical rhythm. */
  companyName?: string;
  /** Variant selector — the two variants that use a hero (`featured`
   *  and `list`) have different widths, paddings, and grid-pattern
   *  densities. */
  variant: "featured" | "list";
}

/**
 * Hero gradient panel used on the left edge of the `featured` and
 * `list` `<StockCard />` variants. Combines a sector-tinted gradient,
 * a low-opacity grid pattern, an optional rank badge, and the ticker
 * set in oversized monospace.
 *
 * Hidden on mobile for the `list` variant (the `<StockCardList />`
 * variant renders a compact mobile header separately) so this panel
 * is desktop-only there; `featured` shows it at all breakpoints.
 *
 * `aria-hidden` because the panel's text duplicates content already
 * rendered in the card body; keeping it out of the a11y tree avoids
 * screen readers announcing the ticker twice.
 */
export function StockCardHero({
  heroGradient,
  rank,
  ticker,
  companyName,
  variant,
}: StockCardHeroProps) {
  const isFeatured = variant === "featured";

  return (
    <div
      className={cn(
        "relative block shrink-0 overflow-hidden",
        isFeatured
          ? "w-[120px] sm:w-[160px]"
          : "hidden w-[150px] sm:block",
      )}
      aria-hidden
    >
      <div
        className={cn("absolute inset-0 bg-gradient-to-br", heroGradient)}
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: isFeatured ? "20px 20px" : "18px 18px",
        }}
        aria-hidden
      />

      <div
        className={cn(
          "relative flex h-full flex-col justify-between",
          isFeatured
            ? "min-h-[160px] p-3 sm:p-4"
            : "min-h-[140px] p-3.5",
        )}
      >
        {rank !== undefined && (
          <span className="font-mono text-[10px] font-semibold tracking-widest text-text-primary/80 num-tabular">
            #{String(rank).padStart(2, "0")}
          </span>
        )}

        <div>
          <h2
            className={cn(
              "font-mono font-bold leading-[0.9] tracking-tighter text-text-primary",
              isFeatured
                ? "text-[32px] sm:text-[40px]"
                : "text-[28px]",
            )}
          >
            {ticker}
          </h2>
          {companyName && (
            <p
              className={cn(
                "mt-1 line-clamp-2 font-mono font-medium leading-tight text-text-primary/75",
                isFeatured
                  ? "text-[9.5px] sm:text-[10px]"
                  : "text-[9.5px]",
              )}
            >
              {companyName}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

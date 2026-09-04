"use client";

import { HeadlineSentimentBadge } from "./HeadlineSentimentBadge";
import { Shimmer } from "@/components/Shimmer";
import { pickHeroGradient } from "@/lib/util/heroGradient";
import { cn } from "@/lib/utils";

interface StockHeroProps {
  /** Ticker code, e.g. `"ANTM"`. Drives the big h2, the chip
   *  fallback, and the deterministic gradient picked via
   *  `pickHeroGradient`. */
  kode: string;
  /** Small label chip above the h2 — typically the exchange board
   *  (`"IDX"`) or sector. Falls back to `kode` when `null`, so a
   *  caller without a separate chip value still renders the ticker
   *  rather than an empty badge. */
  chip?: string | null;
  /** Company legal name. Renders `"N/A"` when `null`/`undefined`. */
  companyName?: string | null;
  /** Latest price, pre-formatted by the caller (e.g. `"3.060"`).
   *  Renders `"N/A"` when `null`/`undefined`. */
  price?: string | null;
  /** Day change in percent (signed). Renders `"—"` when
   *  `null`/`undefined`. Positive values get a leading `+`, decimal
   *  separator is a comma (Indonesian locale). */
  pctChange?: number | null;
  /** When `true`, the dynamic slots (chip, sentiment badge,
   *  company name, price, pct-change) render as `<Shimmer />`
   *  placeholders instead of their "N/A" / "—" fallbacks. The
   *  ticker `kode` h2 stays visible — it's a required prop and
   *  known at mount time, so hiding it would just make the
   *  loading state feel slower than it is. The gradient
   *  background + grid overlay also stay mounted so the page
   *  layout doesn't reflow when the real data lands. */
  isLoading?: boolean;
}

/**
 * Hero / price block for the stock detail page — one composable
 * widget that owns the gradient background, the grid pattern
 * overlay, the ticker chip + sentiment badge, and the
 * big-ticker / price / change layout.
 *
 * Placeholder behavior when data is missing (`isLoading === false`):
 *   - `chip == null`        → falls back to `kode`
 *   - `companyName == null` → renders `"N/A"`
 *   - `price == null`       → renders `"N/A"`
 *   - `pctChange == null`   → renders `"—"`
 *
 * Loading state (`isLoading === true`):
 *   - the five dynamic slots above render as `<Shimmer />`
 *     placeholders sized to match the real content so the cell
 *     layout stays stable through the handoff.
 */
export function StockHero({
  kode,
  chip,
  companyName,
  price,
  pctChange,
  isLoading = false,
}: StockHeroProps) {
  const gradient = pickHeroGradient(kode);

  return (
    <section
      aria-busy={isLoading || undefined}
      className={cn(
        "relative mb-6 overflow-hidden rounded-lg border border-border bg-gradient-to-br",
        gradient,
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden
      />

      <div className="relative p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {isLoading ? (
            // `!bg-white/15` overrides the `<Shimmer />` default
            // (`bg-bg-tertiary`). On the dark gradient background
            // that picks up the gradient class, the default token
            // reads as a near-black blob — too dark to register as
            // a "placeholder" against the hero's midnight palette.
            // 15% white opacity sits just above the grid overlay
            // (which is at 4% white) so the shimmer reads as a
            // subtle lighter block without competing with the
            // gradient. The `!` prefix is the Tailwind v3 way to
            // force the override regardless of class-name order.
            <Shimmer className="!bg-white/15 h-4 w-12" />
          ) : (
            <span className="rounded border border-border bg-bg-primary/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-primary backdrop-blur-sm">
              {chip ?? kode}
            </span>
          )}
          {isLoading ? (
            <Shimmer className="!bg-white/15 h-4 w-16" />
          ) : (
            <HeadlineSentimentBadge />
          )}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            {/* Ticker stays visible during loading — it's a
                required prop and known at mount, so swapping it
                for a shimmer would just make the page feel
                slower. The shimmer below it (company name) marks
                the first row of "waiting" content. */}
            <h2 className="font-mono text-[56px] font-bold leading-none tracking-tighter text-text-primary sm:text-[72px]">
              {kode}
            </h2>
            {isLoading ? (
              <Shimmer className="!bg-white/15 mt-1 h-4 w-48" />
            ) : (
              <p className="mt-1 text-[14px] text-text-secondary">
                {companyName ?? "N/A"}
              </p>
            )}
          </div>
          <div className="text-right">
            {isLoading ? (
              // Matches the price line height (40px / 48px) so
              // the right column doesn't jump when the number
              // lands.
              <Shimmer className="!bg-white/15 ml-auto h-10 w-40 sm:h-12 sm:w-44" />
            ) : (
              <p className="font-mono text-[40px] font-bold leading-none tracking-tight text-text-primary num-tabular sm:text-[48px]">
                {price ?? "N/A"}
              </p>
            )}
            {isLoading ? (
              <Shimmer className="!bg-white/15 mt-1 ml-auto h-4 w-24" />
            ) : (
              <p
                className={cn(
                  "mt-1 font-mono text-[16px] font-semibold num-tabular",
                  pctChange == null
                    ? "text-text-primary"
                    : pctChange >= 0
                      ? "text-bullish"
                      : "text-bearish",
                )}
              >
                {pctChange == null
                  ? "—"
                  : `${pctChange >= 0 ? "+" : ""}${pctChange.toFixed(2).replace(".", ",")}%`} hari ini
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
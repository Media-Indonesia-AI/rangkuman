"use client";

import { HeadlineSentimentBadge } from "./HeadlineSentimentBadge";
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
}

/**
 * Hero / price block for the stock detail page — one composable
 * widget that owns the gradient background, the grid pattern
 * overlay, the ticker chip + sentiment badge, and the
 * big-ticker / price / change layout.
 *
 * The sentiment badge reads via `useHeadlineDetail()` from the
 * outer `<HeadlineDetailProvider>`. **This widget must be rendered
 * inside that provider.**
 *
 * Placeholder behavior matches the original inline JSX so the
 * page can keep rendering gracefully while its data hooks are
 * still in flight:
 *   - `chip == null`        → falls back to `kode`
 *   - `companyName == null` → renders `"N/A"`
 *   - `price == null`       → renders `"N/A"`
 *   - `pctChange == null`   → renders `"—"`
 */
export function StockHero({
  kode,
  chip,
  companyName,
  price,
  pctChange,
}: StockHeroProps) {
  const gradient = pickHeroGradient(kode);

  return (
    <section
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
          <span className="rounded border border-border bg-bg-primary/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-primary backdrop-blur-sm">
            {chip ?? kode}
          </span>
          <HeadlineSentimentBadge />
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-mono text-[56px] font-bold leading-none tracking-tighter text-text-primary sm:text-[72px]">
              {kode}
            </h2>
            <p className="mt-1 text-[14px] text-text-secondary">
              {companyName ?? "N/A"}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[40px] font-bold leading-none tracking-tight text-text-primary num-tabular sm:text-[48px]">
              {price ?? "N/A"}
            </p>
            <p className="mt-1 font-mono text-[16px] font-semibold text-text-primary num-tabular">
              {pctChange == null
                ? "—"
                : `${pctChange >= 0 ? "+" : ""}${pctChange.toFixed(2).replace(".", ",")}%`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
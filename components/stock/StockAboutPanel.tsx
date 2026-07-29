"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { TickerArticles } from "@/lib/api/types/stocks";

interface StockAboutPanelProps {
  /** Ticker code; drives the panel header. */
  kode: string;
  /** Sector name — rendered in the "Sektor" row. Renders `"N/A"`
   *  when `null`/`undefined`. */
  sektor?: string | null;
  /** Pre-formatted price for the "Harga" row. */
  price?: string | null;
  /** Day change in percent (signed). Renders `"N/A"` when
   *  `null`/`undefined`. The panel formats it (sign, two decimals,
   *  comma separator) and colors it: positive → `text-bullish`,
   *  negative → `text-bearish`. */
  pctChange?: number | null;
  articles?: TickerArticles[] | null;
}

/**
 * "Tentang {kode}" — the stock-info card for the stock detail page.
 *
 * One self-contained `<section>` with a header and a 4-row `<dl>`
 * (Sektor / Harga / Perubahan / Coverage). Designed to sit in the
 * right rail as its own card, above a separate `<SimilarStocks />`
 * card. Keeping it independent from the peer list makes it easier
 * to reorder, hide, or restyle either block on its own.
 *
 * The Coverage row is driven by the headline-scoped fetches
 * `useHeadlineDetail()` + `useHeadlineStories()` — same pair
 * `<AggregateSummary />` reads — so the counts stay in sync with
 * the rest of the page:
 *   - **artikel** = `detail.stories.length`
 *   - **media**   = unique `source_name` count across all
 *                   `stories[].articles[]`, derived via `useMemo`
 *                   so the Set walk only runs when `stories`
 *                   changes.
 *
 * Placeholder behavior matches the original inline JSX so the
 * page keeps rendering gracefully while its data hooks are still
 * in flight:
 *   - `sektor == null`     → renders `"N/A"`
 *   - `price == null`      → renders `"N/A"`
 *   - `pctChange == null`  → renders `"N/A"`
 *   - `media === 0`        → renders just `"<n> artikel"`
 *   - `media > 0`          → renders `"<n> artikel · <m> media"`
 *     (same shape as the count chip in `<AggregateSummary />`)
 *
 * **Must be rendered inside `<HeadlineDetailProvider>` and
 * `<HeadlineStoriesProvider>`** — the coverage row reads from both
 * contexts. The stock detail page already wraps the entire right
 * rail in those providers, so no extra wiring is required.
 */
export function StockAboutPanel({
  kode,
  sektor,
  price,
  pctChange,
  articles,
}: StockAboutPanelProps) {
  const { artikelCount, mediaCount } = useMemo(() => {
    const sources = new Set<string>();
    for (const article of articles ?? []) {
      if (article.source_name) sources.add(article.source_name);
    }
    return {
      artikelCount: articles?.length ?? 0,
      mediaCount: sources.size,
    };
  }, [articles]);

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-bg-secondary">
      <header className="border-b border-border bg-bg-tertiary px-3 py-2">
        <h3 className="label">Tentang {kode}</h3>
      </header>

      <dl className="divide-y divide-border text-[12.5px]">
        <div className="flex justify-between gap-2 px-3 py-2">
          <dt className="text-text-muted">Sektor</dt>
          <dd className="text-right text-text-primary">{sektor ?? "N/A"}</dd>
        </div>
        <div className="flex justify-between gap-2 px-3 py-2">
          <dt className="text-text-muted">Harga</dt>
          <dd className="font-mono text-text-primary num-tabular">
            {price ?? "N/A"}
          </dd>
        </div>
        <div className="flex justify-between gap-2 px-3 py-2">
          <dt className="text-text-muted">Perubahan</dt>
          <dd
            className={cn(
              "font-mono font-semibold num-tabular",
              pctChange == null
                ? "text-text-primary"
                : pctChange >= 0
                  ? "text-bullish"
                  : "text-bearish",
            )}
          >
            {pctChange == null
              ? "N/A"
              : `${pctChange >= 0 ? "+" : ""}${pctChange.toFixed(2).replace(".", ",")}%`}
          </dd>
        </div>
        <div className="flex justify-between gap-2 px-3 py-2">
          <dt className="text-text-muted">Coverage</dt>
          <dd className="font-mono text-text-muted num-tabular">
            {`${artikelCount} artikel${mediaCount > 0 ? ` · ${mediaCount} media` : ""}`}
          </dd>
        </div>
      </dl>
    </section>
  );
}

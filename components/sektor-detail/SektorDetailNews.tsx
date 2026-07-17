"use client";

import { useCallback, useEffect, useState } from "react";
import { Newspaper } from "lucide-react";
import type { EmbeddedStory } from "@/lib/api";
import type { SektorDisplay } from "@/lib/util/sectorMappers";
import { useSektorDetail } from "@/lib/hooks/useSektorDetail";
import { SektorNewsItem } from "./SektorNewsItem";

interface SektorDetailNewsProps {
  /** The sector whose news section we're rendering. Used for the
   *  H2 copy ("Recap terbaru dari emiten {name}") and to drive
   *  the per-stock `<StoryCollector />` list — each stock in
   *  `sektor.stocks` feeds one collector, whose stories become
   *  the rendered rows. */
  sektor: SektorDisplay;
}

/**
 * "Berita sektor" section on the sector detail page
 * (`/sektor/{slug}`).
 *
 * Renders the section header (Newspaper icon + label + H2 +
 * "<N> cerita · agregat dari 6+ media" meta) and a flex column of
 * `<SektorNewsItem />` rows — **one per story**, not per stock.
 * A stock with multiple stories surfaces as multiple rows; stocks
 * with no stories disappear from the list entirely.
 *
 * Why the lifted-state pattern:
 *   - The natural React shape is one child component per stock,
 *     each calling `useSektorDetail(ticker)` independently and
 *     deduping at the request-level cache.
 *   - But rows need a *global* rank assigned after sorting by
 *     date, which requires the parent to know every story first.
 *   - So the parent mounts an invisible `<StoryCollector />` per
 *     stock, which fetches its stories and reports them back via
 *     a stable callback. The parent flattens all reported
 *     stories, sorts by `created_at`/`recap_date` desc, and
 *     renders `<SektorNewsItem />` rows with sequential ranks.
 *
 * The collectors return `null` so they don't take layout space —
 * only the rendered rows do. As collectors resolve one at a time
 * the row list grows and re-sorts; the rank labels update in
 * lockstep so they always reflect the current sort.
 *
 * Edge cases:
 *   - sector with no stocks → fallback empty-state shell (the
 *     original "Belum ada emiten di sektor ini" copy),
 *   - sector with stocks but no resolved stories yet → no rows
 *     + a quieter "Sedang memuat cerita…" shimmer line under
 *     the header,
 *   - sector with stocks and stories → rows render in date desc
 *     order with `#01`, `#02`, …, `#NN` ranks.
 */
export function SektorDetailNews({ sektor }: SektorDetailNewsProps) {
  // ticker → its stories from `useSektorDetail`. Updated by the
  // `<StoryCollector />` children once their fetches settle. We
  // own the merge here so the rendered rows can carry a globally
  // sorted rank.
  const [storiesByTicker, setStoriesByTicker] = useState<
    Map<string, EmbeddedStory[]>
  >(() => new Map());

  const reportStories = useCallback(
    (ticker: string, stories: EmbeddedStory[]) => {
      setStoriesByTicker((prev) => {
        // Skip the update when the stories array for this ticker
        // hasn't actually changed — keeps `sortedPairs` /
        // `totalStories` / rank assignments stable while the
        // parent re-renders for unrelated reasons.
        if (prev.get(ticker) === stories) return prev;
        const next = new Map(prev);
        next.set(ticker, stories);
        return next;
      });
    },
    [],
  );

  // Flatten + sort by `created_at` / `recap_date` desc. Tie-break
  // by ticker so equal timestamps stay in a deterministic order.
  const sortedPairs: Array<{ ticker: string; story: EmbeddedStory }> = [];
  for (const [ticker, stories] of storiesByTicker) {
    for (const story of stories) {
      sortedPairs.push({ ticker, story });
    }
  }
  sortedPairs.sort((a, b) => {
    const ad = storyDate(a.story);
    const bd = storyDate(b.story);
    if (bd !== ad) return bd - ad;
    return a.ticker.localeCompare(b.ticker);
  });

  const stockByKode = new Map(sektor.stocks.map((s) => [s.kode, s]));
  const totalStories = sortedPairs.length;
  const hasStocks = sektor.stocks.length > 0;

  return (
    <section aria-label="Berita sektor">
      <header className="mb-3 flex items-end justify-between border-b border-border-strong pb-2">
        <div>
          <div className="mb-0.5 flex items-center gap-1.5">
            <Newspaper className="h-3.5 w-3.5 text-brand" aria-hidden />
            <span className="label text-text-secondary">Berita sektor</span>
          </div>
          <h2 className="text-[15px] font-bold tracking-tight text-text-primary">
            Recap terbaru dari emiten {sektor.name}
          </h2>
        </div>
        <span className="font-mono text-[10.5px] text-text-muted">
          {hasStocks
            ? `${totalStories > 0 ? `${totalStories} cerita · ` : ""}agregat dari 6+ media`
            : "agregat dari 6+ media"}
        </span>
      </header>

      {/* Per-stock collectors — invisible, just trigger fetches
          and report stories back up to the parent. */}
      {hasStocks && (
        <div aria-hidden className="hidden">
          {sektor.stocks.map((stock) => (
            <StoryCollector
              key={stock.kode}
              ticker={stock.kode}
              onStories={reportStories}
            />
          ))}
        </div>
      )}

      {totalStories > 0 ? (
        <ul className="flex flex-col gap-2">
          {sortedPairs.map(({ ticker, story }, idx) => {
            const stock = stockByKode.get(ticker);
            if (!stock) return null;
            return (
              <SektorNewsItem
                key={story.id}
                story={story}
                stock={stock}
                rank={idx + 1}
              />
            );
          })}
        </ul>
      ) : hasStocks ? (
        <div className="rounded-lg border border-dashed border-border bg-bg-secondary/50 px-6 py-10 text-center">
          <p className="text-[13px] text-text-muted">
            Sedang memuat cerita untuk sektor ini…
          </p>
          <p className="mt-1 font-mono text-[10.5px] text-text-faint">
            Daftar recap emiten akan muncul setelah data API tiba.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-bg-secondary/50 px-6 py-10 text-center">
          <p className="text-[13px] text-text-muted">
            Belum ada emiten di sektor ini.
          </p>
          <p className="mt-1 font-mono text-[10.5px] text-text-faint">
            Daftar saham sektor ini sedang kosong di API.
          </p>
        </div>
      )}
    </section>
  );
}

/**
 * Invisible per-stock fetcher. Mounts `useSektorDetail(ticker)` and
 * forwards the resolved `stories` array back to the parent via the
 * `onStories(ticker, stories)` callback once the fetch settles.
 *
 * Returns `null` so it occupies no layout space — the parent
 * renders the actual rows after sorting its collected stories.
 */
function StoryCollector({
  ticker,
  onStories,
}: {
  ticker: string;
  onStories: (ticker: string, stories: EmbeddedStory[]) => void;
}) {
  const { stories, isLoading } = useSektorDetail(ticker);

  useEffect(() => {
    // Skip the report while the fetch is in flight so the parent
    // doesn't churn on the loading→loading transitions; only
    // report the resolved state. The dependency array includes
    // `stories` so a new array reference (e.g. after a ticker
    // switch resets state) triggers a fresh report.
    if (isLoading) return;
    onStories(ticker, stories);
  }, [ticker, stories, isLoading, onStories]);

  return null;
}

/** Best-effort date accessor for an `EmbeddedStory`. Newer wire
 *  rows carry `created_at`; older rows only have `recap_date`.
 *  Returns `0` when neither is present so such stories sink to
 *  the bottom of the sort without throwing. */
function storyDate(story: EmbeddedStory): number {
  const iso = story.created_at || story.recap_date || "";
  const ms = iso ? new Date(iso).getTime() : 0;
  return Number.isNaN(ms) ? 0 : ms;
}

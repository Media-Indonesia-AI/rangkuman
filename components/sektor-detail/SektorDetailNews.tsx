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

/** One (ticker, story) pair from the flattened stories list.
 *  Used for both the sort input and the bucket entries. */
type SortedPair = { ticker: string; story: EmbeddedStory };

/** dayKey → ordered list of pairs sharing that recap date. */
interface DayGroup {
  dayKey: string;
  entries: SortedPair[];
}

/** Map used to look up the parent sector's stock by ticker code. */
type StockByKode = Map<string, SektorDisplay["stocks"][number]>;

/**
 * "Berita sektor" section on the sector detail page
 * (`/sektor/[slug]`).
 *
 * Renders the section header (Newspaper icon + label + H2)
 * followed by **day-grouped** lists of `<SektorNewsItem />` rows.
 * Stories are bucketed by their `recap_date` (YYYY-MM-DD), and
 * each bucket gets its own header:
 *   - today     → "Hari ini"
 *   - yesterday → "Kemarin"
 *   - otherwise → long Indonesian format
 *     (e.g. "Minggu, 12 Januari 2025")
 * Stories without a `recap_date`/`created_at` all collapse into a
 * single "Tanggal tidak diketahui" group at the bottom.
 *
 * **One row per story**, not per stock. A stock with multiple
 * stories surfaces as multiple rows; stocks with no stories
 * disappear from the list entirely. The row's left rail carries
 * its own per-story time chip (`HH:MM`) so the reader can place
 * each row on the timeline without a global `#NN` rank.
 *
 * Why the lifted-state pattern:
 *   - The natural React shape is one child component per stock,
 *     each calling `useSektorDetail(ticker)` independently and
 *     deduping at the request-level cache.
 *   - But rows need a globally consistent sort by date, which
 *     requires the parent to know every story first.
 *   - So the parent mounts an invisible `<StoryCollector />` per
 *     stock, which fetches its stories and reports them back via
 *     a stable callback. The parent flattens all reported
 *     stories, sorts by `created_at`/`recap_date` desc, groups
 *     by day, and renders `<SektorNewsItem />` rows.
 *
 * Edge cases:
 *   - sector with no stocks → "Belum ada emiten di sektor ini"
 *     fallback message,
 *   - sector with stocks but no resolved stories yet →
 *     "Sedang memuat cerita…" shimmer line,
 *   - sector with stocks and stories → grouped-by-day rows in
 *     date desc order, each with its own time chip.
 */
export function SektorDetailNews({ sektor }: SektorDetailNewsProps) {
  // ticker → its stories from `useSektorDetail`. Updated by the
  // `<StoryCollector />` children once their fetches settle. We
  // own the merge here so the rendered rows can carry a globally
  // sorted order.
  const [storiesByTicker, setStoriesByTicker] = useState<
    Map<string, EmbeddedStory[]>
  >(() => new Map());

  const reportStories = useCallback(
    (ticker: string, stories: EmbeddedStory[]) => {
      setStoriesByTicker((prev) => {
        // Skip the update when the stories array for this ticker
        // hasn't actually changed — keeps `sortedPairs` and the
        // group ordering stable while the parent re-renders for
        // unrelated reasons.
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
  const sortedPairs: SortedPair[] = [];
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

  // Bucket by `recap_date` (YYYY-MM-DD). Stories without a date
  // fall into the sentinel `"unknown"` bucket. The Map preserves
  // insertion order — since `sortedPairs` is date-desc, this
  // yields buckets in date-desc order too. Convert back to an
  // array of `DayGroup` so downstream consumers can `.map` over
  // it.
  const groupMap = new Map<string, SortedPair[]>();
  for (const pair of sortedPairs) {
    const dk = dayKey(pair.story);
    const bucket = groupMap.get(dk);
    if (bucket) bucket.push(pair);
    else groupMap.set(dk, [pair]);
  }
  const groups: DayGroup[] = Array.from(groupMap, ([dayKey, entries]) => ({
    dayKey,
    entries,
  }));

  const stockByKode: StockByKode = new Map(
    sektor.stocks.map((s) => [s.kode, s]),
  );
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

      {groups.length > 0 ? (
        <div className="flex flex-col gap-5">
          {groups.map((group) => (
            <DayGroupSection
              key={group.dayKey}
              group={group}
              stockByKode={stockByKode}
            />
          ))}
        </div>
      ) : hasStocks ? (
        <MessageState
          heading="Sedang memuat cerita untuk sektor ini…"
          sub="Daftar recap emiten akan muncul setelah data API tiba."
        />
      ) : (
        <MessageState
          heading="Belum ada emiten di sektor ini."
          sub="Daftar saham sektor ini sedang kosong di API."
        />
      )}
    </section>
  );
}

/**
 * One recap-date bucket. Renders the day header + the list of
 * `<SektorNewsItem />` rows for stories that fell into this
 * bucket. Each row carries its own per-story time chip on its
 * left rail, so no global rank needs to be threaded through
 * here.
 */
function DayGroupSection({
  group,
  stockByKode,
}: {
  group: DayGroup;
  stockByKode: StockByKode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between border-b border-border pb-1.5">
        <h3 className="label text-text-secondary">
          {formatDayHeader(group.dayKey)}
        </h3>
        <span className="font-mono text-[10px] text-text-faint">
          {group.entries.length} cerita
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {group.entries.map(({ ticker, story }) => {
          const stock = stockByKode.get(ticker);
          if (!stock) return null;
          return (
            <SektorNewsItem key={story.id} story={story} stock={stock} />
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Centered, dashed-border message block used for the "no rows
 * yet" and "no stocks at all" branches. Headline copy is the
 * user-facing message; sub is the secondary mono-font line
 * underneath.
 */
function MessageState({ heading, sub }: { heading: string; sub: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-bg-secondary/50 px-6 py-10 text-center">
      <p className="text-[13px] text-text-muted">{heading}</p>
      <p className="mt-1 font-mono text-[10px] text-text-faint">{sub}</p>
    </div>
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

/** Stable bucket key for a story's recap date — `YYYY-MM-DD` from
 *  either `recap_date` (preferred — the actual publication day)
 *  or `created_at` as a fallback. The `"unknown"` sentinel
 *  collects stories without any date so they still render
 *  somewhere instead of dropping on the floor. */
function dayKey(story: EmbeddedStory): string {
  const iso = story.recap_date || story.created_at || "";
  return iso ? iso.slice(0, 10) : "unknown";
}

/** Format a `YYYY-MM-DD` bucket key for display. "Hari ini" and
 *  "Kemarin" short-circuit the format to match the language the
 *  rest of the section uses; everything else goes through
 *  `toLocaleDateString("id-ID", …)` for the long Indonesian form
 *  (e.g. "Minggu, 12 Januari 2025"). The `"unknown"` bucket gets
 *  a plain "Tanggal tidak diketahui" label. */
function formatDayHeader(key: string): string {
  if (key === "unknown") return "Tanggal tidak diketahui";

  const day = new Date(`${key}T00:00:00`);
  if (Number.isNaN(day.getTime())) return key;

  const today = startOfDay(new Date());
  const target = startOfDay(day);
  const dayDiff = Math.round(
    (today.getTime() - target.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (dayDiff === 0) return "Hari ini";
  if (dayDiff === 1) return "Kemarin";

  return day.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Strip the time-of-day portion of a `Date` so `isSameDay`-style
 *  comparisons on bucket keys are timezone-stable. Without this,
 *  comparing a key like `"2025-08-26"` (parsed as UTC midnight)
 *  against `new Date()` (parsed in local TZ) can drift by a day
 *  for users east of UTC. */
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
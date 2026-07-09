"use client";

import { TrendingUp, Minus, TrendingDown } from "lucide-react";
import { useMemo } from "react";
import type { Sentimen } from "@/lib/mock/recaps";
import type { EmbeddedStory } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toSentimen } from "@/lib/util/sentiment";
import { Shimmer } from "@/components/Shimmer";
import { useTickerStories } from "./TickerStoriesProvider";

/** One day's worth of chart data — the calendar date (yyyy-mm-dd)
 *  plus the dominant sentiment for that day's stories. */
type SentimentDay = { date: string; sentiment: Sentimen };

interface SentimentSparklineProps {
  /** ISO date for "today" — used only to highlight the matching
   *  bar (the one whose `recap_date` equals this). Doesn't pin the
   *  window size — the chart's range follows the response. The
   *  ticker itself is provided by `<TickerStoriesProvider>`, not
   *  by this prop. */
  todayIso?: string;
  className?: string;
}

const sentimentColor: Record<Sentimen, { bar: string; text: string; bg: string; label: string }> = {
  positif: { bar: "#16C784", text: "text-bullish", bg: "bg-bullish-soft", label: "Positif" },
  netral:  { bar: "#737373", text: "text-muted",   bg: "bg-bg-tertiary",  label: "Netral" },
  negatif: { bar: "#EA3943", text: "text-bearish", bg: "bg-bearish-soft", label: "Negatif" },
};

/** Day-of-week abbreviation for a given ISO date. */
function dayLabel(dateStr: string): { day: string; date: number } {
  const d = new Date(dateStr);
  const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sat"];
  return { day: days[d.getDay()], date: d.getDate() };
}

/**
 * Mini bar chart showing daily sentiment, one bar per unique day
 * present in the `/stories` response. Green = Positif, gray = Netral,
 * red = Negatif. Netral bars are slightly shorter so the visual
 * hierarchy is clear.
 *
 * Data flow: shared via `<TickerStoriesProvider>` (mounted by the
 * page). Reads `useTickerStories()` to consume the ticker-scoped
 * `EmbeddedStory[]` that the provider fetches once per page load —
 * the same fetch that drives `<ArsipSingkat>`.
 *
 * Each story is bucketed by its `recap_date`'s date portion. The
 * chart's range follows the response — if the API returns stories
 * spanning 1 distinct day, the chart renders 1 bar; 3 days → 3
 * bars; 10 days → 10 narrower bars. A day's bar takes the dominant
 * sentiment across that day's stories, with ties broken in favor
 * of `positif` to match the recaps' "good news dominates" framing.
 *
 * No placeholder neutral bars are rendered for empty days — the
 * chart's window is the actual data span, not a synthetic window.
 */
export function SentimentSparkline({ todayIso, className }: SentimentSparklineProps) {
  // Shared ticker-scoped fetch owned by <TickerStoriesProvider>.
  const { stories, isLoading: storiesLoading } = useTickerStories();

  // Bucket stories by date (yyyy-mm-dd slice of recap_date), then
  // walk the sorted date list and pick each day's dominant sentiment.
  // The resulting array's length is the chart's bar count.
  const data = useMemo<SentimentDay[]>(() => {
    const storiesByDay = new Map<string, EmbeddedStory[]>();
    for (const story of stories) {
      const day = story.recap_date.split("T")[0];
      const bucket = storiesByDay.get(day);
      if (bucket) bucket.push(story);
      else storiesByDay.set(day, [story]);
    }

    // yyyy-mm-dd strings sort chronologically, so Array#sort is enough.
    return Array.from(storiesByDay.keys())
      .sort()
      .map((day): SentimentDay => {
        const dayStories = storiesByDay.get(day) ?? [];
        const counts = { positif: 0, netral: 0, negatif: 0 };
        for (const s of dayStories) {
          counts[toSentimen(s.primary_sentiment)] += 1;
        }
        // Tie-break: positif > negatif > netral. Keeps the chart from
        // drifting to neutral just because a busy day had a mix.
        let sentiment: Sentimen = "netral";
        if (counts.positif >= counts.netral && counts.positif >= counts.negatif) sentiment = "positif";
        else if (counts.negatif >= counts.netral) sentiment = "negatif";
        return { date: day, sentiment };
      });
  }, [stories]);

  // SVG layout. `slotW` adapts to the actual number of days in the
  // response so the chart never overflows its viewport. When empty
  // (initial render before fetch resolves), fall back to a single
  // wide slot to avoid division by zero.
  const W = 320;
  const H = 88;
  const padX = 8;
  const padTop = 4;
  const padBottom = 22; // room for day labels
  const chartH = H - padTop - padBottom;
  const barAreaW = W - padX * 2;
  const barCount = Math.max(data.length, 1);
  const slotW = barAreaW / barCount;
  const barW = slotW * 0.55;

  // Distribution for the header
  const counts = {
    positif: data.filter((d) => d.sentiment === "positif").length,
    netral: data.filter((d) => d.sentiment === "netral").length,
    negatif: data.filter((d) => d.sentiment === "negatif").length,
  };
  const dominant = (Object.entries(counts) as [Sentimen, number][])
    .sort((a, b) => b[1] - a[1])[0][0];
  const DominantIcon =
    dominant === "positif" ? TrendingUp : dominant === "negatif" ? TrendingDown : Minus;

  // Date-range label for the right side of the header. Shows the
  // span of days actually present in the response.
  const dateRangeLabel =
    data.length > 0
      ? `${formatShort(data[0].date)} – ${formatShort(data[data.length - 1].date)}`
      : null;

  return (
    <section
      className={cn("overflow-hidden rounded-lg border border-border bg-bg-secondary", className)}
      aria-label="Sentimen trail"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-bg-tertiary px-3.5 py-2">
        <div className="flex items-center gap-1.5">
          <span className="label">Sentimen Trail</span>
          <span className="font-mono text-[9.5px] text-text-faint">
            · {data.length} hari{data.length === 1 ? "" : ""}
            {dateRangeLabel ? ` (${dateRangeLabel})` : ""}
          </span>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold",
            sentimentColor[dominant].text,
          )}
        >
          {storiesLoading ? (
            <Shimmer className="h-2.5 w-14" />
          ) : (
            <>
              <DominantIcon className="h-2.5 w-2.5" aria-hidden />
              {counts.positif}↑ · {counts.netral}= · {counts.negatif}↓
            </>
          )}
        </span>
      </header>

      <div className="px-3.5 py-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={`Sentimen trail ${data.length} hari: ${counts.positif} positif, ${counts.netral} netral, ${counts.negatif} negatif`}
        >
          {/* Subtle baseline at the bottom of the chart area */}
          <line
            x1={padX}
            y1={padTop + chartH}
            x2={W - padX}
            y2={padTop + chartH}
            stroke="#262626"
            strokeWidth="0.5"
          />

          {/* One bar per unique day in the response. Layout adapts:
              slot width = (chart width) / (bar count). */}
          {data.map((entry, i) => {
            const cfg = sentimentColor[entry.sentiment];
            // Netral bar is shorter to soften the silhouette.
            const isNetral = entry.sentiment === "netral";
            const barH = isNetral ? chartH * 0.5 : chartH * 0.9;
            const x = padX + i * slotW + (slotW - barW) / 2;
            const y = padTop + chartH - barH;
            const { day, date } = dayLabel(entry.date);
            // "Today" highlight fires only when this bar's date
            // matches `todayIso`; not just because it's the
            // rightmost bar.
            const isToday = todayIso !== undefined && entry.date === todayIso;
            return (
              <g key={entry.date}>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  rx={3}
                  fill={cfg.bar}
                  opacity={isToday ? 1 : 0.85}
                />
                {/* Highlight ring on today's bar */}
                {isToday && (
                  <rect
                    x={x - 1.5}
                    y={y - 1.5}
                    width={barW + 3}
                    height={barH + 3}
                    rx={4.5}
                    fill="none"
                    stroke={cfg.bar}
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity={0.6}
                  />
                )}
                {/* Date label */}
                <text
                  x={x + barW / 2}
                  y={H - 9}
                  textAnchor="middle"
                  className="num-tabular"
                  fontSize="9"
                  fontWeight="500"
                  fill={isToday ? "#F7931A" : "#737373"}
                  fontFamily="ui-monospace, SFMono-Regular, monospace"
                >
                  {date}
                </text>
                {/* Day-of-week label */}
                <text
                  x={x + barW / 2}
                  y={H - 1}
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="600"
                  fill={isToday ? "#A3A3A3" : "#525252"}
                  fontFamily="ui-monospace, SFMono-Regular, monospace"
                  letterSpacing="0.05em"
                >
                  {day.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
          <div className="flex items-center gap-3">
            <LegendItem color="bg-bullish" label="Positif" count={counts.positif} />
            <LegendItem color="bg-text-muted" label="Netral" count={counts.netral} />
            <LegendItem color="bg-bearish" label="Negatif" count={counts.negatif} />
          </div>
          <span className="font-mono text-[9.5px] text-text-faint">
            Sumber: agregat media, dikurasi harian
          </span>
        </div>
      </div>
    </section>
  );
}

function LegendItem({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("h-2 w-2 rounded-sm", color)} aria-hidden />
      <span className="font-mono text-[10px] text-text-secondary">
        {label}
      </span>
      <span className="font-mono text-[10.5px] font-semibold text-text-primary num-tabular">
        {count}
      </span>
    </div>
  );
}

/** Format an ISO date as "7 Jun" / "6 Jun" for the date-range label.
 *  Uses Indonesian month abbreviations; falls back to the raw string
 *  if parsing fails. */
function formatShort(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}
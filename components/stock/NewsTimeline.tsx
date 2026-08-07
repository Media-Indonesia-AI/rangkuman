"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useHeadlinesLast7Days } from "@/lib/hooks/useHeadlinesLast7Days";
import { toSentimen } from "@/lib/util/sentiment";
import { Shimmer } from "@/components/Shimmer";
import type { HeadlineLast7DaysItem, StorySentiment } from "@/lib/api";

interface NewsTimelineProps {
  /** Ticker code the timeline is scoped to (e.g. `"ANTM"`). */
  kode: string;
  todayIso: string;
  className?: string;
}

// Sentiment → Tailwind class. Pill variant (soft background) and dot
// variant (solid background) share the same mapping.
const sentimentPillClass = (s: StorySentiment) => {
  const sm = toSentimen(s);
  if (sm === "positif") return "bg-bullish-soft text-bullish";
  if (sm === "negatif") return "bg-bearish-soft text-bearish";
  return "bg-mixed-soft text-mixed";
};

const sentimentDotClass = (s: StorySentiment) => {
  const sm = toSentimen(s);
  if (sm === "positif") return "bg-bullish";
  if (sm === "negatif") return "bg-bearish";
  return "bg-mixed";
};

const SHIMMER_ROW_COUNT = 5;

/** Skeleton list shown while headlines are in flight. Row shape
 *  mirrors a real headline row so the layout doesn't shift. */
function StoriesShimmerList() {
  return (
    <ul className="space-y-2 px-3.5 py-3.5">
      {Array.from({ length: SHIMMER_ROW_COUNT }).map((_, i) => (
        <li
          key={`skel-${i}`}
          className="rounded-md border border-border bg-bg-tertiary/40 p-2.5"
        >
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <Shimmer className="h-3 w-12" />
            <Shimmer className="h-2.5 w-10" />
            <Shimmer className="h-2.5 w-16" />
          </div>
          <Shimmer className="h-3 w-full" />
        </li>
      ))}
    </ul>
  );
}

/** News timeline. Renders one cell per day — headline rows when the
 *  ticker has headlines that day, a `-` placeholder otherwise. The
 *  day list is derived from the headlines' `created_at` dates, sorted
 *  **newest-first** so "today" (if present) anchors the top of the
 *  column; within each day, headlines are also sorted by `created_at`
 *  desc so the latest leads the cell. When no headlines are available
 *  for the ticker's last-7-days window, shows an empty-widget branch
 *  instead of fabricating a 7-day placeholder grid. */
export function NewsTimeline({ kode, todayIso, className }: NewsTimelineProps) {
  // Last-7-days headlines for this ticker, fetched via the shared
  // (ticker, date) request cache. `todayIso` (when set) anchors the
  // window end; otherwise the hook defaults to today.
  const { data: headlines, isLoading } = useHeadlinesLast7Days(
    kode,
    todayIso || undefined,
  );

  const isFetchingStories = isLoading;

  // No headlines to plot for this ticker's window — render the empty
  // state instead of fabricating a 7-day placeholder grid.
  const showEmptyWidget = !isFetchingStories && headlines.length === 0;

  // Bucket headlines by local-time date so each cell does an O(1) lookup.
  const storiesByDay = new Map<string, HeadlineLast7DaysItem[]>();
  for (const s of headlines) {
    const dayKey = format(parseISO(s.created_at), "yyyy-MM-dd");
    const bucket = storiesByDay.get(dayKey);
    if (bucket) bucket.push(s);
    else storiesByDay.set(dayKey, [s]);
  }

  // Sort each day's headlines by `created_at` desc — newest at the top
  // of the cell. `created_at` carries the time component so `Date.parse`
  // gives a real wall-clock comparison; ties stay in the API's natural
  // order.
  for (const bucket of storiesByDay.values()) {
    bucket.sort(
      (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
    );
  }

  // Map keys are already `yyyy-MM-dd` so string sort is chronological;
  // `.reverse()` flips it to newest-first so the timeline reads top-
  // down from "today" backwards.
  const sortedDayKeys = Array.from(storiesByDay.keys()).sort().reverse();
  const dateRangeLabel =
    sortedDayKeys.length > 0
      ? `${format(
          parseISO(sortedDayKeys[sortedDayKeys.length - 1]),
          "dd MMM",
        )} s/d ${format(parseISO(sortedDayKeys[0]), "dd MMM")}`
      : null;

  // Headlines present → one cell per unique date. The empty case is
  // handled by the empty-widget branch below, so we don't fabricate a
  // 7-day placeholder grid here.
  const days = sortedDayKeys.map((iso) => parseISO(iso));

  return (
    <section
      className={cn("overflow-hidden rounded-lg border border-border bg-bg-secondary", className)}
      aria-label="Timeline berita 7 hari"
    >
      <header className="flex items-center justify-between gap-2 border-b border-border bg-bg-tertiary px-3.5 py-2">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-brand" aria-hidden />
          <span className="label">Timeline Berita · {storiesByDay.size} Hari</span>
        </div>
        <span className="font-mono text-[10px] text-text-faint">
          {dateRangeLabel ?? "-"}
        </span>
      </header>

      {isFetchingStories ? (
        <StoriesShimmerList />
      ) : showEmptyWidget ? (
        <div className="flex flex-col items-center gap-2 px-3.5 py-10 text-center">
          <Calendar className="h-5 w-5 text-text-faint" aria-hidden />
          <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-text-muted">
            Belum ada berita terkait
          </p>
          <p className="max-w-xs text-[11.5px] leading-relaxed text-text-faint">
            Belum ada berita untuk saham ini dalam 7 hari terakhir. Coba
            cek saham lain atau kembali ke beranda.
          </p>
        </div>
      ) : (
      <ol className="relative px-3.5 py-3.5">
        {/* Vertical rail */}
        <span
          aria-hidden
          className="absolute left-[26px] top-3.5 bottom-3.5 w-px bg-border"
        />
        {days.map((d) => {
          const iso = format(d, "yyyy-MM-dd");
          const isToday = iso === todayIso;
          const date = format(d, "d MMM", { locale: idLocale });
          const dayName = format(d, "EEE", { locale: idLocale });

          const dayStories = storiesByDay.get(iso) ?? [];
          const dotColor = dayStories.length > 0
            ? sentimentDotClass(dayStories[0].sentiment)
            : "bg-border";

          return (
            <li
              key={iso}
              className={cn(
                "relative grid grid-cols-[40px_1fr] items-start gap-3 py-2",
                isToday && "font-semibold",
              )}
            >
              {/* Date pill on the left */}
              <div className="flex flex-col items-end">
                <span
                  className={cn(
                    "rounded border border-border bg-bg-tertiary px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-widest",
                    isToday ? "text-brand" : "text-text-secondary",
                  )}
                >
                  {date}
                </span>
                <span className="mt-0.5 font-mono text-[8.5px] uppercase tracking-wider text-text-faint">
                  {dayName}
                </span>
              </div>

              {/* Dot on the rail */}
              <div className="relative min-w-0">
                <span
                  aria-hidden
                  className={cn(
                    "absolute -left-[19px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-bg-secondary",
                    dotColor,
                    dayStories.length === 0 && "opacity-40",
                    isToday && "ring-2",
                  )}
                />
                {dayStories.length > 0 ? (
                  <ul className="space-y-2">
                    {dayStories.map((s) => (
                      <li
                        key={s.id}
                        className="rounded-md border border-border bg-bg-tertiary/40 p-2.5 transition-colors hover:border-border-strong hover:bg-bg-tertiary"
                      >
                        {/* Whole-row link to the Sorotan detail page
                            for this headline. The `<Link>` wraps
                            the chips + title so a click anywhere on
                            the row navigates; `aria-label` gives
                            screen readers the headline text since
                            the link has no visible link copy. */}
                        <Link
                          href={`/sorotan/detail/${s.id}`}
                          aria-label={s.title}
                          className="block"
                        >
                          <div className="mb-1 flex flex-wrap items-center gap-1.5">
                            <span
                              className={cn(
                                "rounded px-1 py-px font-mono text-[8.5px] font-semibold uppercase tracking-widest",
                                sentimentPillClass(s.sentiment),
                              )}
                            >
                              {s.sentiment}
                            </span>
                            <span className="font-mono text-[10px] text-text-muted">
                              {format(parseISO(s.created_at), "HH:mm", {
                                locale: idLocale,
                              })}
                            </span>
                            <span className="font-mono text-[10px] text-text-muted">
                              {s.keywords.length} kata kunci
                            </span>
                          </div>
                          <p className="text-[11.5px] leading-snug text-text-primary">
                            {s.title}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-center gap-1.5 rounded-md border border-dashed border-border bg-bg-tertiary/20 px-2.5 py-1.5">
                    <span className="font-mono text-[10.5px] text-text-faint">
                      -
                    </span>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      )}
    </section>
  );
}

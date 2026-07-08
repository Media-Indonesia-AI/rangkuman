"use client";

import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, subDays } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useHeadlineDetail } from "./HeadlineDetailProvider";
import { useListStory } from "@/lib/hooks/useListStory";
import { toSentimen } from "@/lib/util/sentiment";
import { Shimmer } from "@/components/Shimmer";
import type { EmbeddedStory, StoryFilter } from "@/lib/api";

interface NewsTimelineProps {
  todayIso: string;
  className?: string;
}

// Sentiment → Tailwind class. Pill variant (soft background) and dot
// variant (solid background) share the same mapping.
const sentimentPillClass = (s: EmbeddedStory["primary_sentiment"]) => {
  const sm = toSentimen(s);
  if (sm === "positif") return "bg-bullish-soft text-bullish";
  if (sm === "negatif") return "bg-bearish-soft text-bearish";
  return "bg-mixed-soft text-mixed";
};

const sentimentDotClass = (s: EmbeddedStory["primary_sentiment"]) => {
  const sm = toSentimen(s);
  if (sm === "positif") return "bg-bullish";
  if (sm === "negatif") return "bg-bearish";
  return "bg-mixed";
};

const SHIMMER_ROW_COUNT = 5;

/** Skeleton list shown while stories are in flight. Row shape
 *  mirrors a real story row so the layout doesn't shift. */
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

/** News timeline. Renders one cell per day — story rows when the
 *  headline has related stories, a `-` placeholder otherwise. The
 *  day list is derived from the stories' dates when present, or
 *  from a 7-day window ending at `todayIso` as a fallback. */
export function NewsTimeline({ todayIso, className }: NewsTimelineProps) {
  const { detail, loading: detailLoading } = useHeadlineDetail();

  // Gate the fetch: we can only filter by `headline_id` once the
  // detail has resolved, so the hook stays disabled during the
  // detail-fetch window. Without this, we'd fire a wasted no-filter
  // request followed by a real one — different cache keys, no dedup.
  const filters: StoryFilter[] = detail
    ? [{ field: "headline_id", operator: "eq", value: detail.id }]
    : [];
  const { data: stories, isLoading: storiesLoading } = useListStory(
    10,
    0,
    filters,
    detail !== null,
  );

  // Either fetch stage (detail or stories) should show the shimmer.
  const isFetchingStories =
    detailLoading || (detail !== null && storiesLoading);

  // Deep-linked headline with no related stories.
  const showEmptyWidget =
    detail !== null && !storiesLoading && stories.length === 0;

  // Bucket stories by local-time date so each cell does an O(1) lookup.
  const storiesByDay = new Map<string, EmbeddedStory[]>();
  for (const s of stories) {
    const dayKey = format(parseISO(s.recap_date), "yyyy-MM-dd");
    const bucket = storiesByDay.get(dayKey);
    if (bucket) bucket.push(s);
    else storiesByDay.set(dayKey, [s]);
  }

  // Map keys are already `yyyy-MM-dd` so string sort is chronological.
  const sortedDayKeys = Array.from(storiesByDay.keys()).sort();
  const dateRangeLabel =
    sortedDayKeys.length > 0
      ? `${format(parseISO(sortedDayKeys[0]), "dd MMM")} s/d ${format(
          parseISO(sortedDayKeys[sortedDayKeys.length - 1]),
          "dd MMM",
        )}`
      : null;

  // Stories present → one cell per unique date. Otherwise → 7-day
  // window as a placeholder grid.
  const today = parseISO(todayIso);
  const days =
    sortedDayKeys.length > 0
      ? sortedDayKeys.map((iso) => parseISO(iso))
      : Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));

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
            Belum ada cerita terkait
          </p>
          <p className="max-w-xs text-[11.5px] leading-relaxed text-text-faint">
            Headline ini belum punya cerita terkait. Coba cek headline
            lain atau kembali ke beranda.
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
            ? sentimentDotClass(dayStories[0].primary_sentiment)
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
                        className="rounded-md border border-border bg-bg-tertiary/40 p-2.5"
                      >
                        <div className="mb-1 flex flex-wrap items-center gap-1.5">
                          <span
                            className={cn(
                              "rounded px-1 py-px font-mono text-[8.5px] font-semibold uppercase tracking-widest",
                              sentimentPillClass(s.primary_sentiment),
                            )}
                          >
                            {s.primary_sentiment}
                          </span>
                          <span className="font-mono text-[10px] text-text-muted">
                            {format(parseISO(s.recap_date), "HH:mm", {
                              locale: idLocale,
                            })}
                          </span>
                          <span className="font-mono text-[10px] text-text-muted">
                            {s.articles?.length ?? 0} artikel
                          </span>
                        </div>
                        <p className="text-[11.5px] leading-snug text-text-primary">
                          {s.headline}
                        </p>
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
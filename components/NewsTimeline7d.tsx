"use client";

import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRecapForStock } from "@/lib/mock/recaps";
import { format, parseISO, subDays } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useHeadlineDetail } from "./HeadlineDetailProvider";
import { useListStory } from "@/lib/hooks/useListStory";
import { toSentimen } from "@/lib/util/sentiment";
import type { EmbeddedStory, StoryFilter } from "@/lib/api";

interface NewsTimeline7dProps {
  kode: string;
  todayIso: string;
  className?: string;
}

/** Tailwind color for a story's sentiment pill. */
function sentimentPillClass(s: EmbeddedStory["primary_sentiment"]): string {
  const sm = toSentimen(s);
  if (sm === "positif") return "bg-bullish-soft text-bullish";
  if (sm === "negatif") return "bg-bearish-soft text-bearish";
  return "bg-mixed-soft text-mixed";
}

/** Tailwind background for the rail dot. */
function sentimentDotClass(s: EmbeddedStory["primary_sentiment"]): string {
  const sm = toSentimen(s);
  if (sm === "positif") return "bg-bullish";
  if (sm === "negatif") return "bg-bearish";
  return "bg-mixed";
}

/**
 * 7-day news timeline. Each day cell is filled with one of two data
 * sources, in priority order:
 *
 * 1. Stories from `useListStory(10, 0, [{ field: "headline_id",
 *    operator: "eq", value: detail.id }])` — the paginated
 *    standalone `/stories` endpoint, filtered to the deep-linked
 *    headline. The hook dedups concurrent mounts via the
 *    `loadListStory` cache wrapper; the same fetch is shared with
 *    any other consumer of `useListStory` keyed on the same
 *    headline. Each cell renders one row per story with `headline`,
 *    `primary_sentiment`, and the time portion of `recap_date`,
 *    bucketed by the local-date portion of `recap_date`.
 * 2. The aggregate recap (`getRecapForStock(kode, iso)`) — the
 *    pre-existing mock fallback. Used when no `?id=` is set, the
 *    fetch is in flight / failed, or no story landed on that day.
 *
 * This keeps the statically prerendered shell (no `?id=`) rendering
 * the prior recap-based view unchanged, while the deep-linked path
 * replaces the per-day content with per-story content. The 7-day
 * grid, date pill, and rail dot stay constant across both modes.
 */
export function NewsTimeline7d({ kode, todayIso, className }: NewsTimeline7dProps) {
  const { detail } = useHeadlineDetail();

  // Filter the stories list to the deep-linked headline. The
  // `useListStory` hook must be called unconditionally (hook rules);
  // when there's no `detail` we pass `[]` and the hook returns
  // whatever the API gives us — but the per-day bucket below will
  // be empty in that case, so the cell falls back to mock recap.
  const filters: StoryFilter[] = detail
    ? [{ field: "headline_id", operator: "eq", value: detail.id }]
    : [];
  const { data: stories, isLoading: storiesLoading } = useListStory(10, 0, filters);

  // Empty-state condition: a deep-linked headline (`?id=…`) that
  // resolved to a `detail` payload but whose `useListStory` fetch
  // settled with zero related stories. The statically prerendered
  // shell (no `?id=…`) keeps the recap fallback because there's no
  // headline in context to be "empty of stories" for.
  const showEmptyWidget =
    detail !== null && !storiesLoading && stories.length === 0;

  // Bucket stories by `yyyy-MM-dd` (the local-time date portion of
  // `recap_date`) so each cell can do a constant-time lookup.
  const storiesByDay = new Map<string, EmbeddedStory[]>();
  for (const s of stories) {
    const dayKey = format(parseISO(s.recap_date), "yyyy-MM-dd");
    const bucket = storiesByDay.get(dayKey);
    if (bucket) bucket.push(s);
    else storiesByDay.set(dayKey, [s]);
  }

  // Earliest → latest range for the header sub-label. The map keys
  // are already in `yyyy-MM-dd` local-time form, so a string sort
  // gives chronological order without re-parsing dates.
  const sortedDayKeys = Array.from(storiesByDay.keys()).sort();
  const dateRangeLabel =
    sortedDayKeys.length > 0
      ? `${format(parseISO(sortedDayKeys[0]), "dd MMM")} s/d ${format(
          parseISO(sortedDayKeys[sortedDayKeys.length - 1]),
          "dd MMM",
        )}`
      : null;

  // Build the timeline's day list. When stories have loaded, the
  // timeline spans exactly the unique dates present in the stories
  // (one cell per date, chronological). When no stories are present
  // — no `?id=…`, fetch in flight / failed, or the headline has no
  // related stories — fall back to the original 7-day window ending
  // at `todayIso` so the recap fallback still has a contiguous grid.
  // `sortedDayKeys` is the already-sorted unique-date list, so its
  // order is chronological; `parseISO` produces a Date compatible
  // with the existing `format(d, …)` calls below.
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

      {showEmptyWidget ? (
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
          const recap = dayStories.length === 0 ? getRecapForStock(kode, iso) : undefined;

          // Dot color: first story's sentiment in stories mode, recap
          // sentiment in fallback mode, neutral border when empty.
          const dotColor = dayStories.length > 0
            ? sentimentDotClass(dayStories[0].primary_sentiment)
            : recap
              ? recap.sentimen === "positif"
                ? "bg-bullish"
                : recap.sentimen === "negatif"
                  ? "bg-bearish"
                  : "bg-mixed"
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
                    dayStories.length === 0 && !recap && "opacity-40",
                    isToday && "ring-2",
                  )}
                />
                {dayStories.length > 0 ? (
                  // Stories mode — one row per story in this day bucket.
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
                          {/* `articles` is only present on items from the
                              standalone `/stories` endpoint; the older
                              embedded form (in `HeadlineDetail.stories[]`)
                              doesn't carry it. `?? 0` keeps the count
                              always rendered, matching the recap's
                              "X artikel" line above. */}
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
                ) : recap ? (
                  // Fallback mode — pre-existing recap rendering.
                  <div className="rounded-md border border-border bg-bg-tertiary/40 p-2.5">
                    <div className="mb-1 flex items-center gap-1.5">
                      <span
                        className={cn(
                          "rounded px-1 py-px font-mono text-[8.5px] font-semibold uppercase tracking-widest",
                          recap.sentimen === "positif"
                            ? "bg-bullish-soft text-bullish"
                            : recap.sentimen === "negatif"
                              ? "bg-bearish-soft text-bearish"
                              : "bg-mixed-soft text-mixed",
                        )}
                      >
                        {recap.sentimen}
                      </span>
                      <span className="font-mono text-[10px] text-text-muted">
                        {recap.jumlahBerita} artikel
                      </span>
                    </div>
                    <p className="line-clamp-2 text-[11.5px] leading-snug text-text-primary">
                      {recap.ringkasan}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 rounded-md border border-dashed border-border bg-bg-tertiary/20 px-2.5 py-1.5">
                    <Clock className="h-2.5 w-2.5 text-text-faint" aria-hidden />
                    <span className="font-mono text-[10.5px] italic text-text-faint">
                      Gak ada berita
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
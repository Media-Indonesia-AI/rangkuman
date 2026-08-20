import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { LoginPromptOverlay } from "@/components/LoginPromptOverlay";
import { Shimmer } from "@/components/Shimmer";
import { cn } from "@/lib/utils";
import { getRelativeTime, hariIniIso } from "@/lib/util/formatDate";
import type { EmbeddedStory } from "@/lib/api";
import { articleHref, sentimentMeta, SectionHeader } from "./shared";

interface StoryStoriesListProps {
  /** Stories to render — usually `stories.slice(1)` (everything
   *  except the featured one which the hero shows). */
  stories: EmbeddedStory[];
  isLoading: boolean;
  /** Total story count from the hook, for the section subtitle
   *  (`"N peristiwa penting"`). */
  totalCount: number;
}

/** "Timeline" — the related stories for the headline, rendered as
 *  a vertical rail of date-grouped events. Each group has a small
 *  date pill + day-name stack on the left, a sentiment-colored dot
 *  sitting on the rail, and the stories for that date as cards on
 *  the right. Renders one of three states: skeleton while fetching,
 *  the grouped list when present, or a dashed empty-state panel
 *  when no stories remain. */
export function StoriesList({
  stories,
  isLoading,
  totalCount,
}: StoryStoriesListProps) {
  return (
    <section aria-label="Timeline story" className="relative">
      <SectionHeader
        title="Timeline"
        subtitle={
          totalCount > 0
            ? `${totalCount} peristiwa penting`
            : "Belum ada peristiwa"
        }
      />
      {isLoading ? (
        <ListSkeleton />
      ) : stories.length > 0 ? (
        <TimelineList stories={stories} />
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-bg-secondary/30 p-6 text-center text-[12.5px] text-text-muted">
          Tidak ada peristiwa tambahan untuk headline ini.
        </div>
      )}
      <LoginPromptOverlay />
    </section>
  );
}

// ─── helpers ───────────────────────────────────────────────────

/** Sort descending by `recap_date` so the most recent recap sits at
 *  the top of the timeline and older events trail downward. ISO
 *  8601 strings sort lexicographically as timestamps, so
 *  `localeCompare` is enough — no `Date` parsing needed. Stories
 *  missing a `recap_date` sort to the end so the populated entries
 *  still form a coherent sequence. The spread avoids mutating the
 *  prop array — the parent may reuse it across renders. */
function sortStoriesByRecapDateDesc(stories: EmbeddedStory[]): EmbeddedStory[] {
  return [...stories].sort((a, b) => {
    if (!a.recap_date && !b.recap_date) return 0;
    if (!a.recap_date) return 1;
    if (!b.recap_date) return -1;
    return b.recap_date.localeCompare(a.recap_date);
  });
}

interface DateGroup {
  /** `YYYY-MM-DD` for valid dates, empty string for stories whose
   *  `recap_date` is missing. The empty key is a sentinel — the
   *  unknown-date group is rendered at the tail after the desc sort. */
  dateKey: string;
  stories: EmbeddedStory[];
}

/** Bucket the input stories by their **calendar day**, preserving
 *  the order they came in so the groups inherit the caller's
 *  sort. `recap_date` may arrive as either a date-only string
 *  (`"2026-08-19"`) or a full timestamp (`"2026-08-19T21:31:00Z"`)
 *  — the grouping goes through `dateKeyOf` so both shapes collapse
 *  to the same `YYYY-MM-DD` bucket and two stories on the same day
 *  always share one group. A `Map` keeps insertion order in every
 *  modern engine, so the oldest group ends up last without any
 *  extra sort. */
function groupStoriesByRecapDate(stories: EmbeddedStory[]): DateGroup[] {
  const buckets = new Map<string, EmbeddedStory[]>();
  for (const story of stories) {
    const key = dateKeyOf(story.recap_date);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(story);
    else buckets.set(key, [story]);
  }
  return Array.from(buckets, ([dateKey, items]) => ({
    dateKey,
    stories: items,
  }));
}

/** Reduce an ISO date string to its `YYYY-MM-DD` calendar-day form
 *  for grouping purposes. Falls back to the raw string when
 *  `parseISO` can't recover the input so entries are never silently
 *  dropped from the timeline — same defensive convention as the
 *  format helpers below. */
function dateKeyOf(recapDate: string): string {
  if (!recapDate) return "";
  try {
    return format(parseISO(recapDate), "yyyy-MM-dd");
  } catch {
    return recapDate;
  }
}

/** Format a date key as the date pill label. Shows `d MMM` for
 *  the current calendar year (e.g. `"19 AGT"`) and `d MMM yyyy`
 *  for older years (e.g. `"19 AGT 2025"`) — recent timelines are
 *  year-implicit since the year context is already obvious, while
 *  older entries surface the year so they don't read as current
 *  when the timeline spans multiple years. Falls back to `"—"`
 *  when the key is empty and to the raw key when `parseISO` can't
 *  recover the input — same defensive convention as the other
 *  date helpers. */
function formatDatePill(dateKey: string): string {
  if (!dateKey) return "—";
  try {
    const d = parseISO(dateKey);
    const currentYear = Number(hariIniIso().slice(0, 4));
    const fmt = d.getFullYear() === currentYear ? "d MMM" : "d MMM yyyy";
    return format(d, fmt, { locale: idLocale });
  } catch {
    return dateKey;
  }
}

/** Format a date key as the 3-letter weekday label that sits below
 *  the date pill (e.g. `"MIN"`). Empty key → `"—"`. */
function formatDayName(dateKey: string): string {
  if (!dateKey) return "—";
  try {
    return format(parseISO(dateKey), "EEE", { locale: idLocale });
  } catch {
    return "";
  }
}

/** Format a `recap_date` as `HH:mm` for the per-card timestamp
 *  chip. Returns `"—"` for empty / unparseable inputs so the row
 *  still reads as a coherent line rather than a malformed time. */
function formatTimeOrDash(recapDate: string): string {
  if (!recapDate) return "—";
  try {
    return format(parseISO(recapDate), "HH:mm", { locale: idLocale });
  } catch {
    return "—";
  }
}

// ─── list ──────────────────────────────────────────────────────

/** Container with the vertical rail behind every day's dot. The
 *  rail sits at `left-[26px]` (inset 12px from the left edge of the
 *  40px date column so it visually anchors the dot on each row) and
 *  is short of the very top/bottom padding so it "joins" the first
 *  and last dots cleanly. `overflow-hidden` on the container keeps
 *  the rail from spilling past the rounded corners. */
function TimelineList({ stories }: { stories: EmbeddedStory[] }) {
  const groups = groupStoriesByRecapDate(sortStoriesByRecapDateDesc(stories));

  return (
    <div className="relative overflow-hidden">
      <ol className="relative">
        <span
          aria-hidden
          className="absolute left-[26px] top-3.5 bottom-3.5 w-px bg-border"
        />
        {groups.map((group) => (
          <DateGroup
            key={group.dateKey || "unknown-date"}
            group={group}
          />
        ))}
      </ol>
    </div>
  );
}

/** Dot anchored on the rail. Pulled back into the gap via
 *  `-left-[19px]` so it lands on the rail position; the
 *  `ring-4 ring-bg-secondary` masks the rail behind the dot so it
 *  reads as a clean circle, not a line bleeding through. Shared
 *  with `ListSkeleton` so the loading shimmer sits at the exact
 *  same offset. */
const DOT_CLASSES =
  "absolute -left-[19px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-bg-secondary";

/** One date bucket on the timeline. The grid splits the row into a
 *  40px date column (date pill right-aligned + day name) and a 1fr
 *  content column (dot on the rail + stacked story cards). Today
 *  bumps the whole row to bold and the pill text to brand color so
 *  "today" reads as one block at a glance. */
function DateGroup({ group }: { group: DateGroup }) {
  const isToday = group.dateKey === hariIniIso();
  const firstStory = group.stories[0];
  // The dot's color picks up the first story's sentiment — a quick
  // "what tone this date mostly carried" signal at a glance, the
  // same way per-item pills do for individual stories below. Falls
  // back to neutral when the group is empty so the dot still has a
  // coherent color rather than an unstyled gap.
  const dotMeta = sentimentMeta[firstStory?.primary_sentiment ?? "neutral"];
  const dateLabel = formatDatePill(group.dateKey);
  const dayName = formatDayName(group.dateKey);

  return (
    <li
      className={cn(
        "relative grid grid-cols-[40px_1fr] items-start gap-3 py-2",
        isToday && "font-semibold",
      )}
    >
      {/* Date pill + day name on the left, right-aligned so the
          date text sits at the inner edge of its column. */}
      <div className="flex flex-col items-end">
        <span
          className={cn(
            "rounded border border-border bg-bg-tertiary px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-widest",
            isToday ? "text-brand" : "text-text-secondary",
          )}
        >
          {dateLabel}
        </span>
        <span className="mt-0.5 font-mono text-[8.5px] uppercase tracking-wider text-text-faint">
          {dayName}
        </span>
      </div>

      {/* Dot + stacked story cards on the right. */}
      <div className="relative min-w-0">
        <span
          aria-hidden
          className={cn(DOT_CLASSES, dotMeta.dot, isToday && "ring-2")}
        />
        <ul className="space-y-2">
          {group.stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </ul>
      </div>
    </li>
  );
}

// ─── items ─────────────────────────────────────────────────────

/** One story card — sentiment pill, time, and article count on
 *  the first row, then the headline, then (when the story has at
 *  least one article) a top-bordered preview link to the article
 *  source. The article preview uses a `border-t` divider instead
 *  of a nested card so the visual doesn't double-up the border
 *  against the surrounding card. */
function StoryCard({ story }: { story: EmbeddedStory }) {
  const pillMeta = sentimentMeta[story.primary_sentiment];
  // Surface only the first article as the preview link — the API
  // may eventually ship more, but the row stays single-focus until
  // then. Article count is read from `articles.length` so the
  // label reflects the full payload, not just the surfaced one.
  const article = story.articles?.[0];

  return (
    <li className="rounded-md border border-border bg-bg-tertiary/40 p-2.5 transition-colors hover:border-border-strong hover:bg-bg-tertiary">
      <div className="mb-1 flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            "rounded px-1 py-px font-mono text-[8.5px] font-semibold uppercase tracking-widest",
            pillMeta.pill,
          )}
        >
          {pillMeta.label}
        </span>
        <span className="font-mono text-[10px] text-text-muted">
          {formatTimeOrDash(story.recap_date)}
        </span>
      </div>
      <p className="text-[11.5px] leading-snug text-text-primary">
        {story.headline || "n/a"}
      </p>
      {article && (
        <ArticlePreview
          title={article.title}
          sourceName={article.source_name}
          sourceUrl={article.source_url}
          // Relative time is derived from the story's recap_date
          // since the article payload doesn't carry a timestamp.
          // Falls back to "n/a" when the recap_date is missing.
          relativeTime={story.recap_date ? getRelativeTime(story.recap_date) : "n/a"}
        />
      )}
    </li>
  );
}

/** Article preview link — title in bold, source + relative time
 *  in muted mono. Rendered as a `border-t` divider inside the
 *  story card so it reads as a sub-block of the same card rather
 *  than a nested rectangle. */
function ArticlePreview({
  title,
  sourceName,
  sourceUrl,
  relativeTime,
}: {
  title: string;
  sourceName: string;
  sourceUrl: string;
  relativeTime: string;
}) {
  return (
    <a
      href={articleHref(sourceUrl)}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1.5 block border-t border-border pt-1.5 transition-colors hover:border-brand/40"
    >
      <p className="text-[11.5px] font-semibold leading-snug text-text-primary">
        {title || "n/a"}
      </p>
      <p className="mt-0.5 font-mono text-[10px] text-text-faint">
        <span>{sourceName || "n/a"}</span>
        <span className="px-1">·</span>
        <span>{relativeTime}</span>
      </p>
    </a>
  );
}

/** Loading skeleton — mirrors the loaded layout exactly so the
 *  row positions / rail / dot don't shift when the real list
 *  swaps in. Wrapper is intentionally bare (no border / bg / px),
 *  matching the new `TimelineList` shape — the parent
 *  `<section>` provides the visual context. */
function ListSkeleton() {
  return (
    <div className="relative overflow-hidden">
      <ol className="relative">
        <span
          aria-hidden
          className="absolute left-[26px] top-3.5 bottom-3.5 w-px bg-border"
        />
        {Array.from({ length: 3 }).map((_, i) => (
          <li
            key={i}
            className="relative grid grid-cols-[40px_1fr] items-start gap-3 py-2"
          >
            <div className="flex flex-col items-end gap-1">
              <Shimmer className="h-4 w-12 rounded" />
              <Shimmer className="h-2.5 w-8" />
            </div>
            <div className="relative min-w-0 space-y-2">
              <Shimmer
                aria-hidden
                className={DOT_CLASSES}
              />
              <div className="rounded-md border border-border bg-bg-tertiary/40 p-2.5">
                <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                  <Shimmer className="h-3 w-12 rounded" />
                  <Shimmer className="h-2.5 w-10" />
                  <Shimmer className="h-2.5 w-16" />
                </div>
                <Shimmer className="h-3 w-full" />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

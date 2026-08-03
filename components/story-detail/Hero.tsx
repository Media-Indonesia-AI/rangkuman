import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Newspaper,
  Clock,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { Shimmer } from "@/components/Shimmer";
import { cn } from "@/lib/utils";
import { getRelativeTime } from "@/lib/util/formatDate";
import type { HeadlineDetail } from "@/lib/api";
import { NotAvailable, STATUS_ICON, sentimentMeta } from "./shared";

interface StoryHeroProps {
  /** The headline detail returned by `loadHeadlineById` — or
   *  `null` while loading / on error / when the id didn't resolve.
   *  Carries the headline's own `title` / `summary` /
   *  `primary_ticker_code` / `sentiment` / `keywords` / `topics`
   *  plus `stories[]` (used here for the liputan count).
   *  Editor-only fields (sector / price impact / timeline / start
   *  date) aren't on the endpoint and stay `n/a`. */
  detail: HeadlineDetail | null;
  isLoading: boolean;
}

/** Hero block — title, brief, stats row, and price-impact strip.
 *  Renders one of three states based on `isLoading` / `detail`:
 *  skeleton while fetching, the headline when present, or a
 *  centered empty state when the id didn't resolve. */
export function Hero({ detail, isLoading }: StoryHeroProps) {
  return (
    <section className="mb-6 rounded-lg border border-border-strong bg-bg-secondary/40 p-4 sm:p-5">
      {isLoading ? (
        <HeroSkeleton />
      ) : detail ? (
        <HeroFeatured detail={detail} />
      ) : (
        <HeroEmpty />
      )}
    </section>
  );
}

function HeroFeatured({ detail }: { detail: HeadlineDetail }) {
  const meta = sentimentMeta[detail.sentiment];
  const StatusIcon = STATUS_ICON[detail.sentiment];

  // Liputan count is the sum of articles across all related
  // stories — `HeadlineDetail` doesn't expose a top-level article
  // count, but each `EmbeddedStory.articles[]` does. When the
  // endpoint grows a `story_count` field on the parent headline,
  // this reducer can be replaced with `detail.story_count`.
  const articleCount = detail.stories.reduce(
    (sum, s) => sum + (s.articles?.length ?? 0),
    0,
  );
  const updateDate = detail.updated_at ?? detail.created_at;
  // Total stories drives the timeline dot count below. When the
  // endpoint grows a `story_count` field on the parent headline,
  // this can be replaced with `detail.story_count`.
  const totalStories = detail.stories.length;

  // Berjalan (duration) — span from the earliest related story
  // to the headline's last update. The single-relative-time
  // label couldn't tell a story cluster that's been collecting
  // articles for a week apart from one that just started today,
  // so we compute the cluster's full lifetime instead: sort
  // `detail.stories[]` ascending by `recap_date`, take the
  // first entry's date as the cluster's start, then floored-
  // day delta against `updateDate`. The sort direction matches
  // `<StoriesTimeline />` (ascending there too — see
  // `StoriesTimeline.tsx` for the same comparator) so both
  // widgets agree on which story is "the start" of the cluster.
  // ISO 8601 strings sort lexicographically as timestamps, so
  // `localeCompare` is enough — no `Date` parsing needed for
  // the comparison. Stories missing `recap_date` sort to the
  // end, so the index-0 entry either carries a date or the
  // array was empty / entirely date-less — both fall through to
  // the `?? null` and render `<NotAvailable />`. The spread
  // avoids mutating the prop array — the parent may reuse it
  // across renders.
  const sortedStories = [...detail.stories].sort((a, b) => {
    if (!a.recap_date && !b.recap_date) return 0;
    if (!a.recap_date) return 1;
    if (!b.recap_date) return -1;
    return a.recap_date.localeCompare(b.recap_date);
  });
  const earliestStoryDate = sortedStories[0]?.recap_date ?? null;
  const berjalanDays =
    earliestStoryDate && updateDate
      ? Math.max(
          0,
          Math.floor(
            (new Date(updateDate).getTime() -
              new Date(earliestStoryDate).getTime()) /
              86_400_000,
          ),
        )
      : null;

  return (
    <>
      {/* Status + ticker + sector badges — `ticker` and `sektor`
          come straight off `HeadlineDetail`. Sector still falls
          back to `n/a` since the endpoint doesn't carry it yet. */}
      <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
            meta.color,
          )}
        >
          <StatusIcon className="h-3 w-3" aria-hidden />
          {meta.label}
        </span>
        <Link
          href={`/stock/${detail.primary_ticker_code}`}
          className="rounded border border-brand/30 bg-brand/10 px-2 py-0.5 font-mono text-[11px] font-bold tracking-tight text-brand transition-colors hover:bg-brand/20"
        >
          {detail.primary_ticker_code}
        </Link>
        <span className="rounded border border-border bg-bg-tertiary/60 px-2 py-0.5 font-mono text-[10px] text-text-faint">
          sektor <span className="text-text-muted">n/a</span>
        </span>
      </div>

      {/* Title + brief */}
      <h2 className="text-[24px] font-bold leading-tight tracking-tight text-text-primary sm:text-[30px]">
        {detail.title}
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed text-text-secondary sm:text-[15px]">
        {detail.summary}
      </p>

      {/* Timeline — one dot per `detail.stories[]` entry, connected
          by a thin line. The active (most recent) dot is enlarged
          and brand-colored; the rest are smaller muted markers.
          Renders nothing when there are no stories to show. */}
      {/* <StoryTimeline totalStories={totalStories} /> */}

      {/* Stats row — `liputan` (summed) and `update` come from the
          API; `durasi` and `dimulai` are `n/a` since the endpoint
          doesn't carry a start date yet. */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/60 pt-3 text-[11.5px]">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-text-faint" aria-hidden />
          <span className="font-mono text-text-secondary">
            <span className="font-bold text-text-primary">
              {berjalanDays !== null ? `${berjalanDays} hari` : <NotAvailable />}
            </span>{" "}
            berjalan
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Newspaper className="h-3.5 w-3.5 text-text-faint" aria-hidden />
          <span className="font-mono text-text-secondary">
            <span className="font-bold text-text-primary">
              {articleCount}
            </span>{" "}
            liputan
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-text-faint" aria-hidden />
          <span className="font-mono text-text-secondary">
            <span className="font-bold text-text-primary">
              {getRelativeTime(updateDate)}
            </span>
          </span>
        </div>
      </div>

      {/* Price impact — only renders when the headline carries a
          `pct_change_since_story` value. Older headlines (or those
          whose price snapshot wasn't captured) leave the field
          null, and we hide the strip entirely rather than fall
          back to `n/a`. Sign convention: positive = up (bullish +
          TrendingUp), negative = down (bearish + TrendingDown).

          `!= null` (not `!== undefined`) because the live wire has
          shipped `null` for those older headlines, and a strict
          undefined check would let `null` through and crash on
          `pct.toFixed(1)`. `!= null` covers both nullish values
          and TypeScript narrows `pct` to `number` automatically
          inside the IIFE. */}
      {detail.pct_change_since_story != null && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded border border-border bg-bg-tertiary/30 px-3 py-2.5">
          {(() => {
            const pct = detail.pct_change_since_story;
            const isPositive = pct >= 0;
            const Icon = isPositive ? TrendingUp : TrendingDown;
            const color = isPositive ? "text-bullish" : "text-bearish";
            return (
              <>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 font-mono text-[14px] font-bold tabular-nums",
                    color,
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {isPositive ? "+" : ""}
                  {pct.toFixed(1)}%
                </span>
                <span className="font-mono text-[10.5px] text-text-muted">
                  Pergerakan harga sejak story
                </span>
              </>
            );
          })()}
        </div>
      )}
    </>
  );
}

function HeroEmpty() {
  return (
    <div className="py-8 text-center">
      <Newspaper
        className="mx-auto mb-2 h-6 w-6 text-text-faint"
        aria-hidden
      />
      <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-text-muted">
        Headline tidak ditemukan
      </p>
      <p className="mt-1 text-[12.5px] text-text-faint">
        ID headline ini tidak ada di server — coba cek URL-nya
        atau kembali ke saham.
      </p>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <Shimmer className="h-4 w-16" />
        <Shimmer className="h-4 w-20" />
        <Shimmer className="h-4 w-20" />
      </div>
      <Shimmer className="h-7 w-3/4" />
      <div className="space-y-1.5">
        <Shimmer className="h-3.5 w-full" />
        <Shimmer className="h-3.5 w-5/6" />
      </div>
      <div className="flex items-center gap-5 border-t border-border/60 pt-3">
        <Shimmer className="h-3.5 w-24" />
        <Shimmer className="h-3.5 w-20" />
        <Shimmer className="h-3.5 w-28" />
      </div>
    </div>
  );
}

/** Dot timeline — one dot per story in the headline, connected by
 *  a thin horizontal line. The active dot defaults to the most
 *  recent story (last index) and is rendered larger and brand-
 *  colored to mark the current position in the sequence; the rest
 *  are smaller muted markers. Renders nothing when there's nothing
 *  to show, so callers can pass `totalStories` of zero safely. */
function StoryTimeline({
  totalStories,
  currentIndex,
}: {
  totalStories: number;
  /** Optional override for which dot is rendered as the active one.
   *  Defaults to the last index (most recent story). */
  currentIndex?: number;
}) {
  if (totalStories <= 0) return null;
  const active = currentIndex ?? totalStories - 1;

  return (
    <div className="mt-3 flex items-center gap-3">
      <span className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
        Timeline
      </span>
      <div className="relative flex flex-1 items-center">
        {/* Connecting line — sits behind the dots, inset slightly so
            it doesn't poke out past the first/last marker. */}
        <div className="absolute inset-x-1.5 top-1/2 h-px -translate-y-1/2 bg-border" />
        {Array.from({ length: totalStories }).map((_, i) => {
          const isActive = i === active;
          return (
            <div
              key={i}
              className="relative z-10 flex flex-1 items-center justify-center"
            >
              <span
                aria-hidden
                className={cn(
                  "block rounded-full transition-colors",
                  isActive
                    ? "h-2.5 w-2.5 bg-brand"
                    : "h-1.5 w-1.5 bg-text-muted",
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

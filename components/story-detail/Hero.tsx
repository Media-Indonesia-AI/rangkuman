import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Newspaper,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Shimmer } from "@/components/Shimmer";
import { ShareButton } from "@/components/ShareButton";
import { cn } from "@/lib/utils";
import { getRelativeTime, todayIsoDate } from "@/lib/util/formatDate";
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
  /** Absolute URL of this story-detail page, used by the share
   *  button so WhatsApp/Telegram/clipboard receive a fully-qualified
   *  link (those targets reject relative URLs). Required to render
   *  the share affordance; the share button is hidden when the URL
   *  hasn't resolved yet (SSR pass + first hydration). The parent
   *  (`app/story/[id]/StoryDetailPage`) reads `window.location.origin`
   *  inside a `useEffect` and threads it down here. */
  shareUrl?: string;
}

/** Hero block — title, brief, stats row, and price-impact strip.
 *  Renders one of three states based on `isLoading` / `detail`:
 *  skeleton while fetching, the headline when present, or a
 *  centered empty state when the id didn't resolve. */
export function Hero({ detail, isLoading, shareUrl }: StoryHeroProps) {
  return (
    <section className="mb-6 rounded-lg border border-border-strong bg-bg-secondary/40 p-4 sm:p-5">
      {isLoading ? (
        <HeroSkeleton />
      ) : detail ? (
        <HeroFeatured detail={detail} shareUrl={shareUrl} />
      ) : (
        <HeroEmpty />
      )}
    </section>
  );
}

function HeroFeatured({
  detail,
  shareUrl,
}: {
  detail: HeadlineDetail;
  shareUrl?: string;
}) {
  const meta = sentimentMeta[detail.sentiment];
  const StatusIcon = STATUS_ICON[detail.sentiment];

  // Most recent `recap_date` across related stories — `reduce` on
  // an empty array falls through to the initial `""`, so no length
  // guard is needed. Used as the prefer-end of the update chain
  // (most recent story timestamp beats headline's own update / create).
  const latestRecapDate = detail.stories.reduce(
    (latest, s) => (s.recap_date > latest ? s.recap_date : latest),
    "",
  );
  const updateTimestamp = latestRecapDate || detail.updated_at || detail.created_at;
  const updateDate = detail.updated_at ?? detail.created_at;

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
            (new Date(todayIsoDate()).getTime() -
              new Date(earliestStoryDate).getTime()) /
              86_400_000,
          ),
        )
      : null;

  return (
    <>
      {/* Status + ticker + sector badges — `ticker` and `sektor`
          come straight off `HeadlineDetail`. Sector still falls
          back to `n/a` since the endpoint doesn't carry it yet.
          Share button sits at the right edge of this row (via
          `ml-auto`) — only rendered once the parent has resolved
          the absolute URL (SSR + first hydration pass receive
          `shareUrl` undefined). */}
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
        {shareUrl && (
          <div className="ml-auto">
            <ShareButton
              url={shareUrl}
              title={detail.title}
              variant="compact"
              surface="story_detail_hero"
            />
          </div>
        )}
      </div>

      {/* Title + brief */}
      <h2 className="text-[24px] font-bold leading-tight tracking-tight text-text-primary sm:text-[30px]">
        {detail.title}
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed text-text-secondary sm:text-[15px]">
        {detail.summary}
      </p>

      {/* Stats row — `update` comes from the API; `durasi` and
          `dimulai` are `n/a` since the endpoint doesn't carry a
          start date yet. `liputan` (summed article count across
          related stories) is currently hidden — re-enable when the
          liputan section comes back. */}
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
          <Clock className="h-3.5 w-3.5 text-text-faint" aria-hidden />
          <span className="font-mono text-text-secondary">
            <span className="font-bold text-text-primary">
              {getRelativeTime(updateTimestamp)}
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
          inside `<PriceImpactStrip />`. */}
      {detail.pct_change_since_story != null && (
        <PriceImpactStrip pct={detail.pct_change_since_story} />
      )}
    </>
  );
}

/** Price impact strip — rounded pill showing the percentage move
 *  since the headline's story, with a bullish/bearish icon and
 *  color. Sign convention: positive = up (bullish + TrendingUp),
 *  negative = down (bearish + TrendingDown). The caller guards on
 *  `pct_change_since_story != null` so the type narrows to
 *  `number` at the call site. */
function PriceImpactStrip({ pct }: { pct: number }) {
  const isPositive = pct >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const color = isPositive ? "text-bullish" : "text-bearish";
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 rounded border border-border bg-bg-tertiary/30 px-3 py-2.5">
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
    </div>
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

/** (StoryTimeline deleted — never mounted; the future timeline
 *  component lives in a sibling file so this module stays focused
 *  on the hero.) */

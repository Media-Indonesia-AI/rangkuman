import {
  TrendingUp,
  Calendar,
  Newspaper,
  Clock,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { Shimmer } from "@/components/Shimmer";
import { cn } from "@/lib/utils";
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

      {/* Stats row — `liputan` (summed) and `update` come from the
          API; `durasi` and `dimulai` are `n/a` since the endpoint
          doesn't carry a start date yet. */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/60 pt-3 text-[11.5px]">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-text-faint" aria-hidden />
          <span className="font-mono text-text-secondary">
            <span className="font-bold text-text-primary">
              <NotAvailable />
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
            Update{" "}
            <span className="font-bold text-text-primary">{updateDate}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-text-faint" aria-hidden />
          <span className="font-mono text-text-secondary">
            Dimulai <NotAvailable />
          </span>
        </div>
      </div>

      {/* Price impact — the endpoint doesn't carry a price move
          since the headline started, so the strip stays as `n/a`.
          Ticker mirrors the badge above. */}
      <div className="mt-3 flex flex-wrap items-center gap-3 rounded border border-border bg-bg-tertiary/30 px-3 py-2.5">
        <span className="inline-flex items-center gap-1 font-mono text-[14px] font-bold tabular-nums text-text-faint">
          <TrendingUp className="h-4 w-4" aria-hidden />
          <NotAvailable />
        </span>
        <span className="font-mono text-[10.5px] text-text-muted">
          Pergerakan harga sejak story
        </span>
        <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] text-text-faint">
          ticker <span className="text-text-muted">{detail.primary_ticker_code}</span>
        </span>
      </div>
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
        atau kembali ke /saham/.
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

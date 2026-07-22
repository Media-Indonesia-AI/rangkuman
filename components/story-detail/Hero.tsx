import {
  TrendingUp,
  Calendar,
  Newspaper,
  Clock,
  Tag,
} from "lucide-react";
import { Shimmer } from "@/components/Shimmer";
import { cn } from "@/lib/utils";
import type { EmbeddedStory } from "@/lib/api";
import { NotAvailable, STATUS_ICON, sentimentMeta } from "./shared";

interface StoryHeroProps {
  /** The first story in the list (or undefined while loading / on
   *  empty). The hero uses it for title, brief, sentiment, and
   *  article count; ticker / sector / start date / price impact
   *  fall back to `n/a` since those fields aren't on
   *  `EmbeddedStory` yet. */
  featured: EmbeddedStory | undefined;
  isLoading: boolean;
}

/** Hero block — title, brief, stats row, and price-impact strip.
 *  Renders one of three states based on `isLoading` / `featured`:
 *  skeleton while fetching, the featured story when present, or a
 *  centered empty state when the headline returns no stories. */
export function Hero({ featured, isLoading }: StoryHeroProps) {
  return (
    <section className="mb-6 rounded-lg border border-border-strong bg-bg-secondary/40 p-4 sm:p-5">
      {isLoading ? (
        <HeroSkeleton />
      ) : featured ? (
        <HeroFeatured story={featured} />
      ) : (
        <HeroEmpty />
      )}
    </section>
  );
}

function HeroFeatured({ story }: { story: EmbeddedStory }) {
  const meta = sentimentMeta[story.primary_sentiment];
  const StatusIcon = STATUS_ICON[story.primary_sentiment];
  const articleCount = story.articles?.length ?? null;
  const updateDate =
    story.updated_at ?? story.created_at ?? story.recap_date;

  return (
    <>
      {/* Status + ticker + sector badges — ticker / sector aren't on
          `EmbeddedStory` yet, so they show as `n/a` placeholders
          rather than fabricating values. */}
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
        <span className="rounded border border-border bg-bg-tertiary/60 px-2 py-0.5 font-mono text-[10px] text-text-faint">
          ticker <span className="text-text-muted">n/a</span>
        </span>
        <span className="rounded border border-border bg-bg-tertiary/60 px-2 py-0.5 font-mono text-[10px] text-text-faint">
          sektor <span className="text-text-muted">n/a</span>
        </span>
      </div>

      {/* Title + brief */}
      <h2 className="text-[24px] font-bold leading-tight tracking-tight text-text-primary sm:text-[30px]">
        {story.headline}
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed text-text-secondary sm:text-[15px]">
        {story.summary}
      </p>

      {/* Stats row — only `liputan` and `update` come from the API;
          `durasi` and `dimulai` are `n/a` since start date isn't on
          `EmbeddedStory`. */}
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
              {articleCount ?? "n/a"}
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

      {/* Price impact — `EmbeddedStory` doesn't carry it yet, so
          the strip renders with the icon + `n/a` placeholder. The
          ticker on the right mirrors the badge above. */}
      <div className="mt-3 flex flex-wrap items-center gap-3 rounded border border-border bg-bg-tertiary/30 px-3 py-2.5">
        <span className="inline-flex items-center gap-1 font-mono text-[14px] font-bold tabular-nums text-text-faint">
          <TrendingUp className="h-4 w-4" aria-hidden />
          <NotAvailable />
        </span>
        <span className="font-mono text-[10.5px] text-text-muted">
          Pergerakan harga sejak story
        </span>
        <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] text-text-faint">
          ticker <span className="text-text-muted">n/a</span>
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
        Belum ada story
      </p>
      <p className="mt-1 text-[12.5px] text-text-faint">
        Headline ini belum punya story terkait.
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

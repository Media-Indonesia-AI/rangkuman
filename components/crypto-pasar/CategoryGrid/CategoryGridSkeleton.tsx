import { Shimmer } from "@/components/Shimmer";

/** Loading skeleton for the full category grid — mirrors the
 *  real grid's responsive breakpoints (`sm:2 lg:3 xl:4`) and
 *  the `<CategoryCard />` body shape so the layout doesn't
 *  reflow when data lands.
 *
 *  Card count matches `useCoinCategories`'s default `limit`
 *  (10) — same as `<TopMoversSkeleton />`'s choice to mirror
 *  its hook's default. */
export function CategoryGridSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <CardSkeleton key={`skel-${i}`} />
      ))}
    </div>
  );
}

/** Skeleton card mirroring `<CategoryCard />`'s header strip +
 *  body blurb + two-column top movers block. */
function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg-secondary">
      <div className="flex items-start justify-between gap-2 border-b border-border bg-bg-tertiary px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <Shimmer className="h-7 w-7 rounded" />
          <div className="space-y-1.5">
            <Shimmer className="h-3 w-24" />
            <Shimmer className="h-2 w-14" />
          </div>
        </div>
      </div>
      <div className="space-y-1.5 px-3.5 pt-2.5">
        <Shimmer className="h-2.5 w-full" />
        <Shimmer className="h-2.5 w-2/3" />
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-3 border-t border-border px-3.5 py-2.5">
        <div className="space-y-1.5">
          <Shimmer className="h-2.5 w-14" />
          <Shimmer className="h-2.5 w-16" />
          <Shimmer className="h-2.5 w-12" />
        </div>
        <div className="space-y-1.5">
          <Shimmer className="h-2.5 w-14" />
          <Shimmer className="h-2.5 w-16" />
          <Shimmer className="h-2.5 w-12" />
        </div>
      </div>
    </div>
  );
}

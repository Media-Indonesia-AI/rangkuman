import { Shimmer } from "../../Shimmer";

/** Skeleton for the featured card block. */
function FeaturedSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-bg-secondary p-4">
      <div className="flex items-center gap-2">
        <Shimmer className="h-4 w-12" />
        <Shimmer className="h-4 w-20" />
      </div>
      <Shimmer className="mt-2.5 h-5 w-2/3" />
      <div className="mt-2 space-y-1.5">
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-4/5" />
      </div>
    </div>
  );
}

/** Loading placeholder — one featured block + three compact rows. */
function StoriesSkeleton() {
  return (
    <div>
      <FeaturedSkeleton />
      <ul className="mt-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="flex gap-3 border-t border-white py-3">
            <div className="flex w-[52px] shrink-0 flex-col gap-1">
              <Shimmer className="h-4 w-11" />
              <Shimmer className="h-3 w-10" />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <Shimmer className="h-3 w-24" />
              <Shimmer className="h-3.5 w-1/2" />
              <Shimmer className="h-3 w-full" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { FeaturedSkeleton, StoriesSkeleton };

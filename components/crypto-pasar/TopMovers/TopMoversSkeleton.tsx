/**
 * Loading skeleton for the full Top Movers section — two stacked
 * groups (gainer + loser) of 6 card skeletons each. Mirrors the
 * real `<TopMoverGroup />` layout so the grid doesn't reflow when
 * data lands.
 */
export function TopMoversSkeleton() {
  return (
    <div className="space-y-4">
      <GroupSkeleton />
      <GroupSkeleton />
    </div>
  );
}

function GroupSkeleton() {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <div className="h-3 w-3 animate-pulse rounded-full bg-bg-tertiary/60" />
        <div className="h-2.5 w-20 animate-pulse rounded bg-bg-tertiary/60" />
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-secondary px-3 py-2.5">
      <div className="h-6 w-6 shrink-0 animate-pulse rounded-full bg-bg-tertiary/60" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="h-3 w-16 animate-pulse rounded bg-bg-tertiary/60" />
        <div className="h-2.5 w-20 animate-pulse rounded bg-bg-tertiary/40" />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <div className="h-3 w-14 animate-pulse rounded bg-bg-tertiary/60" />
        <div className="h-2.5 w-10 animate-pulse rounded bg-bg-tertiary/40" />
      </div>
    </div>
  );
}

import { Shimmer } from "@/components/Shimmer";

/** Loading skeleton for the full category grid — mirrors the
 *  real grid's `1 col / 2 col` layout and each
 *  `<CategoryListItem />`'s header + group shape so the page
 *  doesn't reflow when data lands.
 *
 *  Renders 10 list items (matches `useCoinCategories`'s
 *  default `limit`). Each item has 3 coin-row placeholders
 *  per group × 2 groups (gainer + looser) = 6 rows per item. */
export function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <ItemSkeleton key={`skel-${i}`} />
      ))}
    </div>
  );
}

/** Skeleton list item — header strip (category name + volume +
 *  market cap, on the same `bg-bg-tertiary` background the real
 *  header uses) then two group blocks (gainer + looser) split
 *  by the same hairline divider, each with three coin-row
 *  placeholders that include a price-change shimmer slot so the
 *  loading shape matches the populated row. */
function ItemSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg-secondary">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-bg-tertiary px-3.5 py-2.5">
        <Shimmer className="h-3 w-40" />
        <div className="flex flex-col items-end gap-1">
          <Shimmer className="h-2 w-24" />
          <Shimmer className="h-2 w-20" />
        </div>
      </div>
      <div className="px-3.5 py-3">
        <GroupSkeleton />
        <div className="my-2.5 border-t border-border" aria-hidden />
        <GroupSkeleton />
      </div>
    </div>
  );
}

/** Skeleton for one bucket (gainer or looser) — mini header
 *  strip + three coin-row placeholders. */
function GroupSkeleton() {
  return (
    <div>
      <Shimmer className="mb-1.5 h-2.5 w-14" />
      <div className="space-y-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <CoinRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/** Skeleton for one coin row — small round icon + ticker pill +
 *  name line + price pill + price-change pill side by side +
 *  trailing `1D` label + sparkline placeholder, all on a single
 *  horizontal baseline so the loading row matches the populated
 *  row's full width and inline layout. */
function CoinRowSkeleton() {
  return (
    <div className="flex items-center gap-2.5 rounded-md px-1.5 py-1">
      <Shimmer className="h-5 w-5 rounded-full" />
      <Shimmer className="h-3 w-10" />
      <Shimmer className="h-2.5 flex-1" />
      <div className="mr-3 flex shrink-0 items-baseline gap-2">
        <Shimmer className="h-3 w-12" />
        <Shimmer className="h-2 w-10" />
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="font-mono text-[8.5px] uppercase tracking-widest text-text-faint">
          1D
        </span>
        <Shimmer className="h-5 w-14 shrink-0 rounded-sm" />
      </div>
    </div>
  );
}

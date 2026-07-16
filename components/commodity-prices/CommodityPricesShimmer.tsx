import { Shimmer } from "@/components/Shimmer";

/**
 * Skeleton shown while `GET stocks/commodity-categories` is in
 * flight. Mirrors the real section's structure (header strip +
 * two category sub-grids with a 5-tile grid each) so the card
 * height doesn't shift on resolution.
 *
 * Rendered in place of `<CommodityPrices />` while `isLoading`
 * is true — see the main component for the three-branch
 * loading / empty / data dispatch.
 */
export function CommodityPricesShimmer() {
  return (
    <section aria-label="Harga Komoditas" aria-busy="true">
      <header className="mb-2 flex items-end justify-between gap-3 border-b border-border-strong pb-1.5">
        <div className="min-w-0">
          <Shimmer className="mb-1 h-3.5 w-44" />
          <Shimmer className="h-2.5 w-56" />
        </div>
        <Shimmer className="h-2.5 w-16" />
      </header>

      <div className="space-y-3">
        {[0, 1].map((g) => (
          <div key={g}>
            <div className="mb-1.5 flex items-center gap-1.5">
              <Shimmer className="h-3 w-12 rounded-sm" />
              <Shimmer className="h-2.5 w-4" />
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={`skel-${g}-${i}`}
                  className="space-y-1 rounded-md border border-border bg-bg-secondary p-2"
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <Shimmer className="h-4 w-4 rounded" />
                      <Shimmer className="h-2.5 w-16" />
                    </div>
                    <Shimmer className="h-2.5 w-8" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <Shimmer className="h-3.5 w-20" />
                    <Shimmer className="h-2 w-6" />
                  </div>
                  <Shimmer className="h-[18px] w-full" />
                  <Shimmer className="-mx-2 -mb-2 h-5 w-[calc(100%+1rem)] rounded-none" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
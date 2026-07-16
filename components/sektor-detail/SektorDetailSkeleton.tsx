import { Shimmer } from "@/components/Shimmer";

/**
 * Loading skeleton for the sector detail page — `/sektor/{slug}`.
 *
 * Mirrors the real page's structure (back link, header, top-5
 * grid, news section) so the layout doesn't shift on resolution.
 * The Navbar/Footer chrome is wrapped around this by the caller
 * (`<SektorDetailPage />`), so the skeleton renders only the
 * inner content.
 *
 * Three shimmer regions correspond to the three real sections:
 *
 *   1. Header card  — sector icon badge, name, stats
 *   2. Top-5 grid   — three stock-card skeletons in the same
 *                     `sm:2 lg:3` responsive layout
 *   3. News section — three list-row placeholders
 *
 * Same pattern as `<SektorSectionShimmer />` from the main
 * `/sektor` index — extracted into its own file rather than
 * inlined so the `<SektorDetailPage />` orchestrator stays
 * focused on routing logic.
 */
export function SektorDetailSkeleton() {
  return (
    <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5">
      <div className="mb-3 h-3 w-24">
        <Shimmer className="h-3 w-24" />
      </div>

      {/* Header skeleton */}
      <header className="mb-5 overflow-hidden rounded-lg border border-border bg-bg-secondary">
        <div className="flex flex-wrap items-start gap-4 p-5">
          <Shimmer className="h-12 w-12 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-6 w-64" />
            <Shimmer className="h-3 w-96" />
          </div>
          <div className="grid w-full grid-cols-2 gap-3 sm:w-auto">
            <div className="space-y-1.5">
              <Shimmer className="h-3 w-12" />
              <Shimmer className="h-5 w-20" />
            </div>
            <div className="space-y-1.5">
              <Shimmer className="h-3 w-12" />
              <Shimmer className="h-5 w-16" />
            </div>
          </div>
        </div>
      </header>

      {/* Top stocks skeleton */}
      <section className="mb-5" aria-busy="true">
        <header className="mb-3 flex items-end justify-between border-b border-border-strong pb-2">
          <div className="space-y-2">
            <Shimmer className="h-3 w-32" />
            <Shimmer className="h-4 w-48" />
          </div>
        </header>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg border border-border bg-bg-secondary"
            >
              <div className="flex items-center justify-between border-b border-border bg-bg-tertiary px-3.5 py-1.5">
                <Shimmer className="h-3 w-10" />
              </div>
              <div className="space-y-2 p-3.5">
                <Shimmer className="h-5 w-20" />
                <Shimmer className="h-4 w-24" />
                <Shimmer className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* News skeleton */}
      <section aria-busy="true">
        <header className="mb-3 flex items-end justify-between border-b border-border-strong pb-2">
          <div className="space-y-2">
            <Shimmer className="h-3 w-24" />
            <Shimmer className="h-4 w-56" />
          </div>
        </header>
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Shimmer key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      </section>
    </main>
  );
}
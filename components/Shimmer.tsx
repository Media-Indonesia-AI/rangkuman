import { cn } from "@/lib/utils";

interface ShimmerProps {
  className?: string;
}

/**
 * Generic pulsing placeholder used during async loading states.
 * Visual matches the existing `SkeletonRow` / `SkeletonCard` pattern in
 * `components/LeftSidebar.tsx` and `components/MobileTopMovers.tsx`.
 *
 * Caller controls the size via `className` — e.g.
 *   - `<Shimmer className="h-4 w-16" />`              — value text slot
 *   - `<Shimmer className="h-2 w-12" />`              — sub-label slot
 *   - `<Shimmer className="h-6 w-full" />`            — full-width row
 *
 * `aria-hidden` is set so screen readers don't read out the placeholder.
 */
export function Shimmer({ className }: ShimmerProps) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded bg-bg-tertiary", className)}
    />
  );
}
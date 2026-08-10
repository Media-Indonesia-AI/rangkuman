import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface ShimmerProps {
  className?: string;
  /** Inline-style override for cases where the caller's height
   *  is dynamic and can't be expressed via Tailwind utilities
   *  alone (e.g. `<SparklineChart isLoading />` taking a `height`
   *  prop the consumer already chose). Width/height should still
   *  be set when possible — `style` is the escape hatch. */
  style?: CSSProperties;
  /** Override `aria-hidden` when the placeholder is the loading
   *  indicator for a known section and assistive tech should
   *  announce it as busy (`aria-busy="true"`). Default stays
   *  `aria-hidden` so silent placeholders don't pollute the a11y
   *  tree. */
  "aria-busy"?: "true" | "false";
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
 * `aria-hidden` is set by default so screen readers don't read out
 * the placeholder. Pass `aria-busy="true"` when the placeholder
 * represents a known loading section so assistive tech announces
 * the busy state.
 */
export function Shimmer({ className, style, "aria-busy": ariaBusy }: ShimmerProps) {
  return (
    <div
      aria-busy={ariaBusy}
      aria-hidden={ariaBusy ? undefined : true}
      style={style}
      className={cn("animate-pulse rounded bg-bg-tertiary", className)}
    />
  );
}
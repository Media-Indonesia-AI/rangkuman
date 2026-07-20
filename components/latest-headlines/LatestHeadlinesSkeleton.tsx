"use client";

import { cn } from "@/lib/utils";
import { Shimmer } from "@/components/Shimmer";

interface LatestHeadlinesSkeletonProps {
  /** Number of placeholder rows to render. Matches the request
   *  page size used by `<LatestHeadlines />` so the layout doesn't
   *  shift when the first live page resolves. */
  count: number;
}

/**
 * Shimmer skeleton for the timeline — pulsing rectangles sized to
 * roughly match a single headline row, minus the real text. Keeps
 * the rail + dot in place so the layout doesn't shift when the
 * data arrives.
 */
export function LatestHeadlinesSkeleton({ count }: LatestHeadlinesSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={`skel-${i}`}
          className={cn(
            "relative pl-8 pr-3 py-2.5",
            i < count - 1 && "border-b border-border",
          )}
        >
          <span
            aria-hidden
            className="absolute left-3 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-border"
          />
          <span
            aria-hidden
            className="absolute left-3 top-3.5 h-2 w-2 -translate-x-1/2 rounded-full bg-border ring-4 ring-bg-secondary"
          />
          <div className="space-y-1.5">
            <Shimmer className="h-2.5 w-24" />
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-2 w-16" />
          </div>
        </li>
      ))}
    </>
  );
}

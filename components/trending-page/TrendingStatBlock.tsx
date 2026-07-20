import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TrendingStatBlockProps {
  /** Label shown above the value (e.g. "Positif"). */
  label: string;
  /** The big number to surface. */
  value: number;
  /** Optional sublabel appended next to the value in muted gray. */
  sublabel?: string;
  /** Tailwind text color class for the value (`text-bullish`,
   *  `text-bearish`, `text-mixed`, `text-brand`, …). */
  color: string;
  /** When `true`, render the value in monospace + tabular nums so
   *  it lines up with adjacent `TrendingStatBlock`s. Default false. */
  mono?: boolean;
}

/**
 * One cell of the trending-page stat strip — label + big number
 * + optional sublabel. Renders inside a `divide-x` strip, so the
 * visible spacing comes from the parent's grid layout; this cell
 * only owns its own padding.
 */
export function TrendingStatBlock({
  label,
  value,
  sublabel,
  color,
  mono,
}: TrendingStatBlockProps): ReactNode {
  return (
    <div className="px-3 py-2.5 sm:px-4 sm:py-3">
      <p className="label">{label}</p>
      <p
        className={cn(
          "mt-0.5 leading-none",
          color,
          mono
            ? "font-mono text-[20px] font-bold num-tabular sm:text-[24px]"
            : "text-[20px] font-bold sm:text-[24px]",
        )}
      >
        {value}
        {sublabel && (
          <span className="ml-1 font-mono text-[11px] text-text-muted">
            {sublabel}
          </span>
        )}
      </p>
    </div>
  );
}

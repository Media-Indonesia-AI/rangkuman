/**
 * Marquee container — border, edge fades, doubled scroll rows.
 * Pure CSS animation (no JS). Rows are rendered twice so when the
 * first set scrolls off, the second set is already in view — the
 * seamless infinite loop only works with the duplication.
 *
 * The row list comes from the parent; this component is just the
 * chrome around it.
 */
import type { TickerRow } from "./types";
import { TickerRowView } from "./TickerRowView";

interface MarqueeProps {
  rows: TickerRow[];
  ariaLabel: string;
}

export function Marquee({ rows, ariaLabel }: MarqueeProps) {
  return (
    <div
      className="relative overflow-hidden border-b border-border bg-bg-secondary"
      aria-label={ariaLabel}
    >
      {/* Edge fades so the marquee doesn't clip harshly */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-bg-secondary to-transparent sm:w-12" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-bg-secondary to-transparent sm:w-12" />

      <div className="flex animate-marquee whitespace-nowrap py-1.5 will-change-transform sm:py-2">
        {[0, 1].flatMap((dupIdx) =>
          rows.map((row, idx) => (
            <TickerRowView
              key={`row-d${dupIdx}-${row.kind}-${row.kode}-${idx}`}
              row={row}
            />
          )),
        )}
      </div>
    </div>
  );
}

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketIndicator {
  label: string;
  value: string;
  change: number;
  /** "%" or absolute value (for FX). */
  unit?: string;
}

interface MarketsStripProps {
  indicators?: MarketIndicator[];
  className?: string;
}

const DEFAULT_INDICATORS: MarketIndicator[] = [
  { label: "IHSG", value: "7,245", change: 0.87 },
  { label: "USD/IDR", value: "16,320", change: -0.4 },
  { label: "BI Rate", value: "6,25%", change: -0.25, unit: "bps" },
  { label: "Emas", value: "$2,480", change: 0.6 },
];

function Direction({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono text-[10.5px] font-semibold text-cat-saham">
        <TrendingUp className="h-2.5 w-2.5" aria-hidden />
        +{value.toFixed(2)}
        {!value.toString().includes("bps") && "%"}
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono text-[10.5px] font-semibold text-cat-kebijakan">
        <TrendingDown className="h-2.5 w-2.5" aria-hidden />
        {value.toFixed(2)}
        {!value.toString().includes("bps") && "%"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 font-mono text-[10.5px] font-semibold text-text-muted">
      <Minus className="h-2.5 w-2.5" aria-hidden />
      0.00%
    </span>
  );
}

/** WSJ-style horizontal market snapshot bar. */
export function MarketsStrip({
  indicators = DEFAULT_INDICATORS,
  className,
}: MarketsStripProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 border-y border-border-strong bg-bg-secondary/50 px-4 py-2.5 sm:gap-4 sm:px-5",
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
        <span className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-muted">
          Markets
        </span>
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-x-5 gap-y-1.5 sm:justify-end">
        {indicators.map((ind) => (
          <div key={ind.label} className="flex items-center gap-1.5">
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-text-muted">
              {ind.label}
            </span>
            <span className="font-mono text-[12px] font-semibold tabular-nums text-text-primary">
              {ind.value}
            </span>
            <Direction value={ind.change} />
          </div>
        ))}
      </div>
    </div>
  );
}

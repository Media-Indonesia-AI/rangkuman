import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { KeyDataPoint } from "@/lib/mock/highlights";
import { cn } from "@/lib/utils";

interface KeyDataBlockProps {
  /** 2-4 key data points. */
  points: KeyDataPoint[];
  className?: string;
}

function TrendIndicator({ trend }: { trend?: KeyDataPoint["trend"] }) {
  if (trend === "up") {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider text-cat-saham">
        <TrendingUp className="h-2.5 w-2.5" aria-hidden />
        Naik
      </span>
    );
  }
  if (trend === "down") {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider text-cat-kebijakan">
        <TrendingDown className="h-2.5 w-2.5" aria-hidden />
        Turun
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider text-text-muted">
      <Minus className="h-2.5 w-2.5" aria-hidden />
      Netral
    </span>
  );
}

/**
 * Editorial-style "Data Kunci" callout. 2-4 large numbers, each with
 * a short label, optional sublabel, and trend indicator. Borderless,
 * divided by vertical lines, designed to read in <2 seconds.
 */
export function KeyDataBlock({ points, className }: KeyDataBlockProps) {
  if (points.length === 0) return null;

  return (
    <section
      aria-label="Data kunci"
      className={cn(
        "rounded-lg border border-border-strong bg-bg-secondary/50 px-4 py-4 sm:px-5 sm:py-5",
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
          Data Kunci
        </h3>
        <span className="ml-auto font-mono text-[9.5px] uppercase tracking-widest text-text-faint">
          angka-angka terpenting
        </span>
      </div>

      <dl
        className={cn(
          "grid divide-x divide-border",
          points.length === 2 && "grid-cols-2",
          points.length === 3 && "grid-cols-1 sm:grid-cols-3",
          points.length === 4 && "grid-cols-2 sm:grid-cols-4",
        )}
      >
        {points.map((pt, i) => (
          <div
            key={i}
            className={cn(
              "px-1 py-2 first:pl-0 last:pr-0 sm:px-4",
              // 2-col layout: divide only between cells in same row
              points.length === 2 && i % 2 === 0 ? "border-r border-border" : "",
            )}
          >
            <div className="mb-1">
              <TrendIndicator trend={pt.trend} />
            </div>
            <dd className="font-mono text-[22px] font-bold leading-none tracking-tight text-text-primary sm:text-[26px]">
              {pt.value}
            </dd>
            <dt className="mt-1.5 text-[12.5px] font-semibold leading-tight text-text-primary sm:text-[13px]">
              {pt.label}
            </dt>
            {pt.sublabel && (
              <p className="mt-0.5 line-clamp-1 font-mono text-[10.5px] text-text-muted">
                {pt.sublabel}
              </p>
            )}
          </div>
        ))}
      </dl>
    </section>
  );
}

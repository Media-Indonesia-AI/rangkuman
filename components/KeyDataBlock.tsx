import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { KeyDataPoint } from "@/lib/mock/highlights";
import { cn } from "@/lib/utils";
import { KeywordItem, type StorySentiment } from "@/lib/api/types/story";

interface KeyDataBlockProps {
  /** 2-4 key data points. */
  keywords: KeywordItem[];
  className?: string;
}

/**
 * Trend chip in front of each tile. Uses the `text-bullish` /
 * `text-bearish` semantic tokens (defined in `app/globals.css`) so
 * the chip stays consistent with the rest of the app — green for
 * positive (Naik), red for negative (Turun), muted for neutral
 * (Netral). Switched off the older `text-cat-saham` /
 * `text-cat-kebijakan` category tokens, which conflated
 * sentiment with stock category and produced a colder,
 * category-locked green rather than the saturated bullish hue
 * the design now uses.
 */
function TrendIndicator({ sentiment }: { sentiment: StorySentiment }) {
  if (sentiment === "positive") {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider text-bullish">
        <TrendingUp className="h-2.5 w-2.5" aria-hidden />
        Naik
      </span>
    );
  }
  if (sentiment === "negative") {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider text-bearish">
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
export function KeyDataBlock({ keywords, className }: KeyDataBlockProps) {
  if (keywords.length === 0) return null;

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
      </div>

      <dl
        className={cn(
          "grid divide-x divide-border",
          keywords.length === 2 && "grid-cols-2",
          keywords.length === 3 && "grid-cols-1 sm:grid-cols-3",
          keywords.length === 4 && "grid-cols-2 sm:grid-cols-4",
        )}
      >
        {keywords.map((keyword, i) => (
          <div
            key={keyword.id}
            className={cn(
              "px-1 py-2 first:pl-0 last:pr-0 sm:px-4",
              // 2-col layout: divide only between cells in same row
              keywords.length === 2 && i % 2 === 0 ? "border-r border-border" : "",
            )}
          >
            <div className="mb-1">
              <TrendIndicator sentiment={keyword.sentiment} />
            </div>
            <dd className="font-mono text-[22px] font-bold leading-none tracking-tight text-text-primary sm:text-[26px]">
              {keyword.value}
            </dd>
            <dt className="mt-1.5 text-[12.5px] font-semibold leading-tight text-text-primary sm:text-[13px]">
              {keyword.label}
            </dt>
            {keyword.description && (
              <p className="mt-0.5 font-mono text-[10.5px] text-text-muted">
                {keyword.description}
              </p>
            )}
          </div>
        ))}
      </dl>
    </section>
  );
}

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MetricCard {
  id: string;
  /** Small uppercase label (e.g. "Total MC", "S&P 500") */
  label: string;
  /** Big value (e.g. "$2,84T", "5,847") */
  value: string;
  /** Optional sub-text shown below value (e.g. "Greed", "Bitcoin Season") */
  subValue?: string;
  /** % change — drives the colored bottom row */
  change?: number;
  /** Trend hint when change is not applicable */
  trend?: "up" | "down" | "neutral";
}

interface MarketSnapshotProps {
  metrics: MetricCard[];
  title?: string;
  subtitle?: string;
  className?: string;
}

/**
 * Compact 4-col data widget (distinct from article cards).
 * - 4 columns on desktop, 2x2 on mobile
 * - Background bg-secondary/50, subtle border
 * - Format: small label / big value / colored change row
 *
 * Used by /global/ and /crypto/ as the "Pasar Hari Ini" / "Bursa Global" widget
 * between Sorotan and Sedang Terjadi.
 */
export function MarketSnapshot({
  metrics,
  title = "Pasar Hari Ini",
  subtitle,
  className,
}: MarketSnapshotProps) {
  return (
    <section
      aria-label={title}
      className={cn(
        "rounded-lg border border-border/60 bg-bg-secondary/40 px-3 py-3 sm:px-4 sm:py-3.5",
        className,
      )}
    >
      {(title || subtitle) && (
        <header className="mb-2.5 flex items-end justify-between">
          <div>
            <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-0.5 text-[11px] text-text-muted">{subtitle}</p>
            )}
          </div>
        </header>
      )}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {metrics.map((m) => (
          <MetricCardItem key={m.id} metric={m} />
        ))}
      </div>
    </section>
  );
}

function MetricCardItem({ metric }: { metric: MetricCard }) {
  const hasChange = metric.change !== undefined;
  const trend =
    metric.trend ??
    (hasChange
      ? metric.change! > 0
        ? "up"
        : metric.change! < 0
          ? "down"
          : "neutral"
      : "neutral");

  const colorClass =
    trend === "up"
      ? "text-cat-saham"
      : trend === "down"
        ? "text-cat-kebijakan"
        : "text-text-secondary";

  return (
    <div className="rounded-md border border-border/40 bg-bg-tertiary/30 px-3 py-2.5">
      {/* Label */}
      <p className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-muted">
        {metric.label}
      </p>

      {/* Value */}
      <p className="mt-1.5 font-mono text-[18px] font-bold leading-none tracking-tight text-text-primary sm:text-[20px]">
        {metric.value}
      </p>

      {/* Change or sub-value */}
      <div className="mt-1.5 min-h-[14px] text-[10.5px] font-semibold">
        {hasChange ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-mono tabular-nums",
              colorClass,
            )}
          >
            {trend === "up" ? (
              <TrendingUp className="h-2.5 w-2.5" aria-hidden />
            ) : trend === "down" ? (
              <TrendingDown className="h-2.5 w-2.5" aria-hidden />
            ) : (
              <Minus className="h-2.5 w-2.5" aria-hidden />
            )}
            {metric.change! > 0 ? "+" : ""}
            {metric.change!.toFixed(2)}%
          </span>
        ) : metric.subValue ? (
          <span className={cn("font-mono uppercase tracking-wider", colorClass)}>
            {metric.subValue}
          </span>
        ) : null}
      </div>
    </div>
  );
}

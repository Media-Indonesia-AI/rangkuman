import { cn } from "@/lib/utils";

interface ProgressBarChartProps {
  /** 0-100 */
  value: number;
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
  compact?: boolean;
}

/**
 * Horizontal progress bar with orange→teal gradient and indicator dot.
 * Like cryptoslate's "Altcoin Season" widget.
 */
export function ProgressBarChart({
  value,
  leftLabel,
  rightLabel,
  className,
  compact = false,
}: ProgressBarChartProps) {
  const v = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("w-full space-y-1", className)}>
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-bg-tertiary">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${v}%`,
            background:
              "linear-gradient(to right, #F7931A 0%, #E8A33D 35%, #4DB6AC 70%, #3B82F6 100%)",
          }}
        />
        <div
          className="absolute top-1/2 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg-secondary bg-bg-primary shadow-[0_0_4px_rgba(0,0,0,0.5)]"
          style={{ left: `${v}%` }}
        />
      </div>
      {(leftLabel || rightLabel) && !compact && (
        <div className="flex justify-between font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-muted">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
}

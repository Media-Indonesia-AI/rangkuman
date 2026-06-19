import { cn } from "@/lib/utils";

interface FearGreedGaugeProps {
  value: number; // 0-100
  label: string;
  className?: string;
}

/**
 * Semi-circular gauge for Crypto Fear & Greed Index.
 * Color zones: 0-25 red, 25-45 orange, 45-55 yellow, 55-75 lime, 75-100 green.
 * Needle/dot positioned at `value` along the arc.
 */
export function FearGreedGauge({ value, label, className }: FearGreedGaugeProps) {
  // Map value 0-100 to angle 180° (left) -> 0° (right)
  const clamped = Math.max(0, Math.min(100, value));
  const angle = 180 - (clamped / 100) * 180;
  const rad = (angle * Math.PI) / 180;
  const cx = 50 + 35 * Math.cos(rad);
  const cy = 50 + 35 * Math.sin(rad);

  // Color of the needle/dot
  const dotColor =
    clamped < 25
      ? "#ef4444" // red
      : clamped < 45
        ? "#f97316" // orange
        : clamped < 55
          ? "#eab308" // yellow
          : clamped < 75
            ? "#84cc16" // lime
            : "#22c55e"; // green

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg
        viewBox="0 0 100 60"
        className="w-full max-w-[160px]"
        aria-label={`Fear & Greed Index: ${clamped} (${label})`}
      >
        {/* Arc background segments — gradient via multiple strokes */}
        <defs>
          <linearGradient id="fgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="25%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="75%" stopColor="#84cc16" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        <path
          d="M 15 50 A 35 35 0 0 1 85 50"
          fill="none"
          stroke="url(#fgGrad)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Indicator dot */}
        <circle cx={cx} cy={cy} r="3.2" fill="white" />
        <circle cx={cx} cy={cy} r="2" fill={dotColor} />
      </svg>
    </div>
  );
}

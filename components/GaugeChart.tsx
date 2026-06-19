import { cn } from "@/lib/utils";

interface GaugeChartProps {
  /** 0-100 */
  value: number;
  label?: string;
  className?: string;
}

/**
 * Semicircle gauge with red→yellow→green gradient and a dot at the value.
 * Like cryptoslate's "Fear & Greed" widget.
 */
export function GaugeChart({ value, label, className }: GaugeChartProps) {
  // Clamp to 0-100, map to angle 0° (left) to 180° (right)
  const v = Math.max(0, Math.min(100, value));
  const angle = (v / 100) * 180;

  // We render a semicircle path: starts at left (0,50), arcs over the top to right (100,50)
  // Then a thin track below it.
  const cx = 50;
  const cy = 50;
  const r = 42;

  // Convert angle to (x,y) on the circle. Start at 180° (left), go to 0° (right).
  // For 0% -> 180° -> (cx - r, cy). For 100% -> 0° -> (cx + r, cy).
  // Dot position: (cx + r * cos(angleFromRightRad), cy - r * sin(angleFromRightRad))
  // Easier: angle from the leftmost point.
  const rad = (Math.PI * (180 - angle)) / 180;
  const dotX = cx + r * Math.cos(rad);
  const dotY = cy - r * Math.sin(rad);

  return (
    <div className={cn("relative w-full", className)}>
      <svg
        viewBox="0 0 100 60"
        preserveAspectRatio="xMidYMid meet"
        className="w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="gauge-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#EA3943" />
            <stop offset="50%" stopColor="#FFB020" />
            <stop offset="100%" stopColor="#16C784" />
          </linearGradient>
          <filter id="gauge-glow">
            <feGaussianBlur stdDeviation="1.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track (subtle full arc) */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="#262626"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Colored arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="url(#gauge-gradient)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Indicator dot */}
        <circle
          cx={dotX}
          cy={dotY}
          r="3.5"
          fill="#FAFAFA"
          stroke="#0A0A0B"
          strokeWidth="1.5"
          filter="url(#gauge-glow)"
        />
      </svg>
      {label && (
        <p className="absolute inset-x-0 bottom-0 text-center font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-muted">
          {label}
        </p>
      )}
    </div>
  );
}

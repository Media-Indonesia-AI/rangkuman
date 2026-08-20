import { cn } from "@/lib/utils";
import { Shimmer } from "@/components/Shimmer";

interface SparklineChartProps {
  data: number[];
  positive?: boolean;
  className?: string;
  height?: number;
  showArea?: boolean;
  showDots?: boolean;
  /** When `true`, render a pulsing placeholder in place of the
   *  sparkline so the loading window reads as "data on its way"
   *  instead of an empty bar. Caller is responsible for flipping
   *  this off once `data.length >= 2` — the component trusts the
   *  flag and doesn't try to infer loading state from the data. */
  isLoading?: boolean;
}

/**
 * Smooth sparkline rendered as inline SVG. No external chart library.
 */
export function SparklineChart({
  data,
  positive = true,
  className,
  height = 40,
  showArea = true,
  showDots = false,
  isLoading = false,
}: SparklineChartProps) {
  // Loading window: the caller knows the fetch is still in flight
  // and signals that with `isLoading`. We render a pulsing
  // placeholder matching the chart's final height so the layout
  // stays stable and the swap to the real sparkline doesn't cause
  // a vertical shift on resolution. Takes precedence over the
  // empty-state branch below.
  if (isLoading) {
    return (
      <Shimmer
        aria-busy="true"
        className={cn("h-10 w-full rounded", className)}
        style={{ height }}
      />
    );
  }

  if (!data || data.length < 2) {
    return <div className={cn("h-10 w-full", className)} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 100; // viewBox width
  const h = 100; // viewBox height
  const pad = 4;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = pad + (1 - (v - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });

  // Build smooth path using simple cubic bezier between every two points.
  const path = points.reduce((acc, [x, y], i, arr) => {
    if (i === 0) return `M ${x.toFixed(2)} ${y.toFixed(2)}`;
    const [px, py] = arr[i - 1];
    const mx = (px + x) / 2;
    return `${acc} C ${mx.toFixed(2)} ${py.toFixed(2)}, ${mx.toFixed(2)} ${y.toFixed(2)}, ${x.toFixed(2)} ${y.toFixed(2)}`;
  }, "");

  // Area path (close the line at the bottom)
  const areaPath = `${path} L ${w} ${h} L 0 ${h} Z`;

  const stroke = positive ? "var(--sparkline-up, #16C784)" : "var(--sparkline-down, #EA3943)";
  const fill = positive
    ? "url(#sparkline-up-gradient)"
    : "url(#sparkline-down-gradient)";

  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("h-10 w-full", className)}
      style={{ height }}
      aria-hidden
    >
      <defs>
        <linearGradient id="sparkline-up-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16C784" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#16C784" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sparkline-down-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EA3943" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#EA3943" stopOpacity="0" />
        </linearGradient>
      </defs>

      {showArea && <path d={areaPath} fill={fill} />}
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {showDots && (
        <circle
          cx={last[0]}
          cy={last[1]}
          r="2"
          fill={stroke}
          stroke="#0A0A0B"
          strokeWidth="0.8"
        />
      )}
    </svg>
  );
}

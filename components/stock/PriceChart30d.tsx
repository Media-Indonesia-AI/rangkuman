import { cn } from "@/lib/utils";
import { getPriceHistory } from "@/lib/mock/price-history";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface PriceChart30dProps {
  kode: string;
  currentPrice: number;
  change30dPercent: number;
  ath: number;
  className?: string;
}

/**
 * 30-day price chart — SVG line + area fill.
 * Green when the 30-day change is positive, red when negative.
 */
export function PriceChart30d({
  kode,
  currentPrice,
  change30dPercent,
  ath,
  className,
}: PriceChart30dProps) {
  const data = getPriceHistory(kode, 30);
  const positive = change30dPercent >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;

  // Layout
  const W = 600;
  const H = 140;
  const padL = 36;
  const padR = 50;
  const padT = 8;
  const padB = 18;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Y grid: 4 lines (min, 25%, 75%, max)
  const gridLevels = 4;
  const yTicks = Array.from({ length: gridLevels }, (_, i) => min + (range * i) / (gridLevels - 1));

  // X axis: every 5 days label
  const xLabelIdx = [0, 6, 12, 18, 24, 29];

  // Build smooth path
  const points = data.map((v, i) => {
    const x = padL + (i / (data.length - 1)) * chartW;
    const y = padT + (1 - (v - min) / range) * chartH;
    return [x, y] as const;
  });

  const path = points.reduce((acc, [x, y], i, arr) => {
    if (i === 0) return `M ${x.toFixed(2)} ${y.toFixed(2)}`;
    const [px, py] = arr[i - 1];
    const mx = (px + x) / 2;
    return `${acc} C ${mx.toFixed(2)} ${py.toFixed(2)}, ${mx.toFixed(2)} ${y.toFixed(2)}, ${x.toFixed(2)} ${y.toFixed(2)}`;
  }, "");

  const areaPath = `${path} L ${padL + chartW} ${padT + chartH} L ${padL} ${padT + chartH} Z`;

  const stroke = positive ? "#16C784" : "#EA3943";
  const gradientId = `pc30d-${positive ? "up" : "down"}`;

  // Format price compactly for Y axis labels
  function fmt(v: number): string {
    if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}K`;
    return v.toFixed(0);
  }

  // Day labels: relative offsets (-29, -23, -17, -11, -5, today)
  const dayLabels = ["-29d", "-23d", "-17d", "-11d", "-5d", "today"];

  return (
    <section
      className={cn("overflow-hidden rounded-lg border border-border bg-bg-secondary", className)}
      aria-label="Pergerakan harga 30 hari"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-bg-tertiary px-3.5 py-2">
        <div className="flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-brand" aria-hidden />
          <span className="label">Harga 30 Hari</span>
        </div>
        <div className="flex items-center gap-3 text-[10.5px]">
          <span className="font-mono text-text-faint">ATH</span>
          <span className="font-mono font-semibold text-text-primary num-tabular">
            {ath.toLocaleString("id-ID")}
          </span>
          <span className="text-text-faint">·</span>
          <span className="font-mono text-text-faint">Current</span>
          <span className="font-mono font-semibold text-text-primary num-tabular">
            {currentPrice.toLocaleString("id-ID")}
          </span>
          <span className="text-text-faint">·</span>
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-mono font-semibold num-tabular",
              positive ? "text-bullish" : "text-bearish",
            )}
          >
            <Icon className="h-2.5 w-2.5" aria-hidden />
            {positive ? "+" : ""}
            {change30dPercent.toFixed(2)}%
          </span>
        </div>
      </header>

      <div className="px-3.5 py-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={`Chart harga 30 hari, perubahan ${change30dPercent.toFixed(2)}%`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.30" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y-axis grid + labels */}
          {yTicks.map((v, i) => {
            const y = padT + (1 - (v - min) / range) * chartH;
            return (
              <g key={i}>
                <line
                  x1={padL}
                  y1={y}
                  x2={padL + chartW}
                  y2={y}
                  stroke="#262626"
                  strokeWidth="0.5"
                  strokeDasharray="2 4"
                />
                <text
                  x={padL - 4}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fontFamily="ui-monospace, SFMono-Regular, monospace"
                  fill="#525252"
                >
                  {fmt(v)}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {xLabelIdx.map((idx, i) => {
            if (idx >= data.length) return null;
            const x = padL + (idx / (data.length - 1)) * chartW;
            return (
              <text
                key={idx}
                x={x}
                y={H - 4}
                textAnchor="middle"
                fontSize="9"
                fontFamily="ui-monospace, SFMono-Regular, monospace"
                fill={idx === data.length - 1 ? "#F7931A" : "#525252"}
                fontWeight={idx === data.length - 1 ? "700" : "500"}
              >
                {dayLabels[i]}
              </text>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill={`url(#${gradientId})`} />
          {/* Line */}
          <path
            d={path}
            fill="none"
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* End-point dot (today) */}
          {(() => {
            const [lx, ly] = points[points.length - 1];
            return (
              <>
                <circle cx={lx} cy={ly} r="5" fill={stroke} opacity="0.25" />
                <circle
                  cx={lx}
                  cy={ly}
                  r="2.5"
                  fill={stroke}
                  stroke="#0A0A0B"
                  strokeWidth="1"
                />
              </>
            );
          })()}

          {/* ATH dashed line */}
          {(() => {
            const yAth = padT + (1 - (ath - min) / range) * chartH;
            if (yAth < padT || yAth > padT + chartH) return null;
            return (
              <g>
                <line
                  x1={padL}
                  y1={yAth}
                  x2={padL + chartW}
                  y2={yAth}
                  stroke="#525252"
                  strokeWidth="0.5"
                  strokeDasharray="3 3"
                />
                <text
                  x={padL + chartW + 4}
                  y={yAth + 3}
                  fontSize="8"
                  fontFamily="ui-monospace, SFMono-Regular, monospace"
                  fill="#737373"
                >
                  ATH
                </text>
              </g>
            );
          })()}
        </svg>
      </div>
    </section>
  );
}

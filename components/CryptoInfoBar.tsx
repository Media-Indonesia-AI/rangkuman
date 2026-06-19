import { cn } from "@/lib/utils";
import { CRYPTO_MARKET, COINS } from "@/lib/mock/crypto";

/**
 * 1-line info bar for /crypto/:
 *   [F&G 68●] | [BTC ▴1.8% ▁▃▆█] | [ETH ▴2.4% ▂▄▇█] | [SOL ▴5.2% ▁▂▅▇]
 *
 * No editorial text — purely visual gauge + 3 mini sparklines.
 * Total width ~560-600px on desktop; wraps to 2 rows on mobile.
 */
export function CryptoInfoBar({ className }: { className?: string }) {
  const fg = CRYPTO_MARKET.fearGreedIndex;
  const fgColor =
    fg < 25
      ? "#ef4444"
      : fg < 45
        ? "#f97316"
        : fg < 55
          ? "#eab308"
          : fg < 75
            ? "#84cc16"
            : "#22c55e";

  const btc = COINS.find((c) => c.kode === "BTC")!;
  const eth = COINS.find((c) => c.kode === "ETH")!;
  const sol = COINS.find((c) => c.kode === "SOL")!;

  return (
    <div
      role="group"
      aria-label="Crypto info bar"
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-border bg-bg-secondary/40 px-3 py-2 sm:flex-nowrap sm:gap-x-4",
        className,
      )}
    >
      {/* Fear & Greed gauge */}
      <div className="flex items-center gap-2">
        <MiniFearGreedGauge value={fg} />
        <div className="flex flex-col leading-tight">
          <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-text-muted">
            Fear
          </span>
          <span className="font-mono text-[10px] font-bold tabular-nums" style={{ color: fgColor }}>
            {fg}
          </span>
        </div>
      </div>

      <Divider />

      {/* 3 sparklines */}
      <MiniSparklineTicker coin={btc} />
      <Divider />
      <MiniSparklineTicker coin={eth} />
      <Divider />
      <MiniSparklineTicker coin={sol} />
      <Divider />

      {/* BTC Dominance donut */}
      <div className="flex items-center gap-1.5">
        <BtcDominanceDonut percent={parseFloat(CRYPTO_MARKET.btcDominance.replace(",", "."))} />
        <div className="flex flex-col leading-tight">
          <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-text-muted">
            BTC.D
          </span>
          <span className="font-mono text-[10px] font-bold tabular-nums text-text-primary">
            {CRYPTO_MARKET.btcDominance}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Mini donut chart for BTC Dominance (~36x36px).
 * Color arc represents BTC share; remaining ring is altcoin.
 */
function BtcDominanceDonut({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  // Half-donut: 180° arc, BTC fills from left based on percent
  const r = 14;
  const cx = 18;
  const cy = 18;
  // Arc spans 180° from (cx-r, cy) to (cx+r, cy)
  // BTC portion: from start, sweep angle = 180 * (clamped/100)
  const sweepAngle = 180 * (clamped / 100);
  const endX = cx - r * Math.cos((sweepAngle * Math.PI) / 180);
  const endY = cy - r * Math.sin((sweepAngle * Math.PI) / 180);
  const largeArc = clamped > 50 ? 1 : 0;
  return (
    <svg
      viewBox="0 0 36 22"
      width={36}
      height={22}
      className="shrink-0"
      aria-label={`BTC Dominance ${clamped.toFixed(1)}%`}
    >
      {/* Background ring (altcoin) */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="var(--bg-tertiary)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* BTC portion (amber) */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`}
        fill="none"
        stroke="#f59e0b"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Divider() {
  return (
    <span
      aria-hidden
      className="hidden h-7 w-px shrink-0 bg-border sm:block"
    />
  );
}

/**
 * Compact Fear & Greed gauge (~50x32px) — semicircular arc with a dot.
 * No label text — value & label rendered separately by parent.
 */
function MiniFearGreedGauge({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const angle = 180 - (clamped / 100) * 180;
  const rad = (angle * Math.PI) / 180;
  const cx = 28 + 18 * Math.cos(rad);
  const cy = 28 + 18 * Math.sin(rad);
  return (
    <svg
      viewBox="0 0 56 32"
      width={56}
      height={32}
      className="shrink-0"
      aria-label={`Fear & Greed ${clamped}`}
    >
      <defs>
        <linearGradient id="fgMiniGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="25%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="75%" stopColor="#84cc16" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <path
        d="M 10 28 A 18 18 0 0 1 46 28"
        fill="none"
        stroke="url(#fgMiniGrad)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="2.2" fill="white" stroke="#1a1a1a" strokeWidth="0.5" />
    </svg>
  );
}

interface MiniSparklineTickerProps {
  coin: {
    kode: string;
    price: number;
    changePercent: number;
    sparkline: number[];
  };
}

function MiniSparklineTicker({ coin }: MiniSparklineTickerProps) {
  const isUp = coin.changePercent >= 0;
  const stroke = isUp ? "#22c55e" : "#ef4444";
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-text-primary">
        {coin.kode}
      </span>
      <span className="font-mono text-[10.5px] tabular-nums text-text-secondary">
        ${formatPrice(coin.price)}
      </span>
      <span
        className={cn(
          "font-mono text-[10px] font-semibold tabular-nums",
          isUp ? "text-cat-saham" : "text-cat-kebijakan",
        )}
      >
        {isUp ? "▴" : "▾"}
        {Math.abs(coin.changePercent).toFixed(1)}%
      </span>
      <Sparkline data={coin.sparkline} stroke={stroke} />
    </div>
  );
}

function Sparkline({
  data,
  stroke,
}: {
  data: number[];
  stroke: string;
}) {
  const w = 60;
  const h = 18;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = w / (data.length - 1);
  const points = data
    .map((v, i) => {
      const x = i * stepX;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      preserveAspectRatio="none"
      className="shrink-0"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatPrice(price: number): string {
  if (price >= 1000) {
    return `${(price / 1000).toFixed(1)}K`;
  }
  if (price >= 1) {
    return price.toFixed(2);
  }
  if (price >= 0.01) {
    return price.toFixed(3);
  }
  return price.toFixed(4);
}

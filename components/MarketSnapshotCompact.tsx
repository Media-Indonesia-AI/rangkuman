import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";

export interface MarketSnapshotItem {
  id: string;
  label: string;
  value: string;
  change: number;
  changeUnit?: "%" | "bps" | "";
}

interface MarketSnapshotCompactProps {
  items: MarketSnapshotItem[];
  className?: string;
  /** Header label override. */
  label?: string;
  /** Right-side meta override. */
  meta?: string;
}

const DEFAULT_ITEMS: MarketSnapshotItem[] = [
  { id: "ihsg", label: "IHSG", value: "7,245", change: 0.87, changeUnit: "%" },
  { id: "usd", label: "USD/IDR", value: "16,320", change: -0.4, changeUnit: "%" },
  { id: "bi", label: "BI Rate", value: "6,25%", change: -25, changeUnit: "bps" },
  { id: "inflasi", label: "Inflasi YoY", value: "2,6%", change: -0.2, changeUnit: "%" },
  { id: "emas", label: "Emas", value: "$2,480", change: 0.6, changeUnit: "%" },
  { id: "nikel", label: "Nikel", value: "$16,200", change: -4.0, changeUnit: "%" },
];

function DirectionText({ value, unit }: { value: number; unit?: string }) {
  const u = unit ?? "%";
  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono text-[10.5px] font-semibold text-cat-saham">
        <TrendingUp className="h-2.5 w-2.5" aria-hidden />
        +{value.toFixed(2).replace(/\.00$/, "")}
        {u}
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono text-[10.5px] font-semibold text-cat-kebijakan">
        <TrendingDown className="h-2.5 w-2.5" aria-hidden />
        {value.toFixed(2).replace(/\.00$/, "")}
        {u}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 font-mono text-[10.5px] font-semibold text-text-muted">
      <Minus className="h-2.5 w-2.5" aria-hidden />
      0,00%
    </span>
  );
}

/**
 * Compact vertical market snapshot for sidebar use. 6 indicators stacked
 * vertically. Designed for narrow column (sticky, ~280-320px wide).
 */
export function MarketSnapshotCompact({
  items = DEFAULT_ITEMS,
  className,
  label = "Markets Snapshot",
  meta = "real-time",
}: MarketSnapshotCompactProps) {
  return (
    <section
      aria-label="Pasar hari ini"
      className={`rounded-lg border border-border-strong bg-bg-secondary/50 ${className ?? ""}`}
    >
      <div className="flex items-center justify-between border-b border-border-strong px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Activity className="h-3 w-3 text-cat-ekonomi-2" aria-hidden />
          <h3 className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-secondary">
            {label}
          </h3>
        </div>
        <span className="font-mono text-[8.5px] uppercase tracking-widest text-text-faint">
          {meta}
        </span>
      </div>
      <ul>
        {items.map((it, i) => (
          <li
            key={it.id}
            className={`flex items-center justify-between px-3 py-2 ${
              i < items.length - 1 ? "border-b border-border/50" : ""
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9.5px] font-semibold uppercase tracking-wider text-text-muted">
                {it.label}
              </p>
              <p className="font-mono text-[14px] font-bold leading-none tracking-tight text-text-primary">
                {it.value}
              </p>
            </div>
            <DirectionText value={it.change} unit={it.changeUnit} />
          </li>
        ))}
      </ul>
    </section>
  );
}

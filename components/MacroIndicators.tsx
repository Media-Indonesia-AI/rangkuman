import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";

export interface MacroIndicator {
  id: string;
  label: string;
  value: string;
  unit?: string;
  change: number;
  /** "bps" for basis points (Fed/BI rate), "%" for percentages. */
  changeUnit?: "bps" | "%";
  /** Optional context line below. */
  context?: string;
  /** Frequency of update. */
  freq?: "Harian" | "Mingguan" | "Bulanan" | "Kuartalan";
}

interface MacroIndicatorsProps {
  indicators: MacroIndicator[];
  className?: string;
}

function DirectionIcon({ value }: { value: number }) {
  if (value > 0) {
    return <TrendingUp className="h-3 w-3" aria-hidden />;
  }
  if (value < 0) {
    return <TrendingDown className="h-3 w-3" aria-hidden />;
  }
  return <Minus className="h-3 w-3" aria-hidden />;
}

function DirectionText({ value, changeUnit }: { value: number; changeUnit?: string }) {
  const unit = changeUnit ?? (Math.abs(value) < 10 ? "%" : "bps");
  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono text-[10.5px] font-semibold text-cat-saham">
        <DirectionIcon value={value} />
        +{value.toFixed(2).replace(/\.00$/, "")}
        {unit}
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono text-[10.5px] font-semibold text-cat-kebijakan">
        <DirectionIcon value={value} />
        {value.toFixed(2).replace(/\.00$/, "")}
        {unit}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 font-mono text-[10.5px] font-semibold text-text-muted">
      <DirectionIcon value={value} />
      0,00%
    </span>
  );
}

/**
 * Ekonomi-specific widget: "Indikator Makro" — key macro indicators in a
 * grid layout, more detailed than the homepage MarketsStrip.
 */
export function MacroIndicators({ indicators, className }: MacroIndicatorsProps) {
  return (
    <section
      aria-label="Indikator makro"
      className={`rounded-lg border border-border-strong bg-bg-secondary/50 ${className ?? ""}`}
    >
      <div className="flex items-center justify-between border-b border-border-strong px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-cat-ekonomi-2" aria-hidden />
          <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
            Indikator Makro
          </h3>
        </div>
        <span className="font-mono text-[9.5px] uppercase tracking-widest text-text-faint">
          data real-time
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-2 sm:p-2 lg:grid-cols-4 lg:gap-0 lg:p-0">
        {indicators.map((ind) => (
          <div
            key={ind.id}
            className="flex flex-col gap-1.5 rounded-md border border-border bg-bg-tertiary/30 px-3 py-2.5 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-4 lg:py-3"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-muted">
                {ind.label}
              </span>
              {ind.freq && (
                <span className="font-mono text-[8.5px] uppercase tracking-wider text-text-faint">
                  {ind.freq}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-[20px] font-bold leading-none tracking-tight text-text-primary sm:text-[22px]">
                {ind.value}
              </span>
              {ind.unit && (
                <span className="font-mono text-[10.5px] text-text-muted">
                  {ind.unit}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <DirectionText value={ind.change} changeUnit={ind.changeUnit} />
              {ind.context && (
                <span className="line-clamp-1 font-mono text-[9.5px] text-text-muted">
                  {ind.context}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

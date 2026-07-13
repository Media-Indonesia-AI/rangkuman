import { BarChart3, Layers, Activity, TrendingUp, Award, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Saham } from "@/lib/mock/stocks";

interface KeyMetricsProps {
  /** The stock to render metrics for. When `null`, the widget still renders
   *  its shell but every metric tile shows `—` and the label flips to
   *  "no data" — keeps the layout stable while signalling there's nothing
   *  to show. */
  stock: Saham | null;
  className?: string;
}

interface MetricProps {
  icon: typeof Activity;
  label: string;
  value: string;
  hint?: string;
  color?: string;
}

function Metric({ icon: Icon, label, value, hint, color = "text-text-primary" }: MetricProps) {
  return (
    <div className="rounded-md border border-border bg-bg-tertiary/50 px-3 py-2.5">
      <div className="mb-1 flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-text-faint" aria-hidden />
        <span className="label">{label}</span>
      </div>
      <p className={cn("font-mono text-[16px] font-bold leading-none num-tabular", color)}>
        {value}
      </p>
      {hint && <p className="mt-1 font-mono text-[10px] text-text-muted">{hint}</p>}
    </div>
  );
}

/** Key metrics tile: Market Cap · P/E · Volume · Dividend Yield · Beta · 30D change. */
export function KeyMetrics({ stock, className }: KeyMetricsProps) {
  const isEmpty = !stock;

  const peColor = isEmpty
    ? "text-text-faint"
    : stock.peRatio > 30 ? "text-bearish"
    : stock.peRatio < 0 ? "text-mixed"
    : stock.peRatio < 15 ? "text-bullish"
    : "text-text-primary";

  return (
    <section
      className={cn("overflow-hidden rounded-lg border border-border bg-bg-secondary", className)}
      aria-label="Key metrics"
    >
      <header className="flex items-center gap-1.5 border-b border-border bg-bg-tertiary px-3.5 py-2">
        <BarChart3 className="h-3.5 w-3.5 text-brand" aria-hidden />
        <h3 className="label">Key Metrics</h3>
        <span className="ml-auto font-mono text-[9.5px] text-text-faint">
          {isEmpty ? "no data" : "mock data"}
        </span>
      </header>

      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
        <Metric
          icon={Layers}
          label="Market Cap"
          value={isEmpty ? "—" : stock.marketCap}
          hint={isEmpty ? undefined : `${stock.kode} listed`}
        />
        <Metric
          icon={Activity}
          label="P/E Ratio"
          value={
            isEmpty
              ? "—"
              : stock.peRatio < 0
                ? "NM"
                : `${stock.peRatio.toFixed(1)}x`
          }
          hint={
            isEmpty
              ? undefined
              : stock.peRatio < 0
                ? "Belum profitable"
                : stock.peRatio < 15
                  ? "Murah"
                  : stock.peRatio < 25
                    ? "Wajar"
                    : "Mahal"
          }
          color={peColor}
        />
        <Metric
          icon={BarChart3}
          label="Volume"
          value={isEmpty ? "—" : stock.volume}
          hint={isEmpty ? undefined : "lembar diperdagangkan"}
        />
        <Metric
          icon={Percent}
          label="Dividend Yield"
          value={isEmpty ? "—" : `${stock.dividendYield.toFixed(1)}%`}
          hint={isEmpty ? undefined : "annualized"}
          color={
            isEmpty
              ? "text-text-faint"
              : stock.dividendYield >= 4
                ? "text-bullish"
                : "text-text-primary"
          }
        />
        <Metric
          icon={Award}
          label="Beta"
          value={isEmpty ? "—" : stock.beta.toFixed(2)}
          hint={
            isEmpty
              ? undefined
              : stock.beta > 1.2
                ? "Lebih volatil dari IHSG"
                : stock.beta < 0.8
                  ? "Lebih stabil"
                  : "Sejalan IHSG"
          }
        />
        <Metric
          icon={TrendingUp}
          label="30D Change"
          value={
            isEmpty
              ? "—"
              : `${stock.change30dPercent >= 0 ? "+" : ""}${stock.change30dPercent.toFixed(2)}%`
          }
          hint={isEmpty ? undefined : "1 bulan terakhir"}
          color={
            isEmpty
              ? "text-text-faint"
              : stock.change30dPercent >= 0
                ? "text-bullish"
                : "text-bearish"
          }
        />
      </div>
    </section>
  );
}
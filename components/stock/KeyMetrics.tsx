import { BarChart3, Layers, Activity, TrendingUp, Award, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Saham } from "@/lib/mock/stocks";

interface KeyMetricsProps {
  /** The stock to render metrics for. When `null`, the component renders
   *  nothing — there's no useful key-metrics row without the underlying stock. */
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
  // No underlying stock → nothing meaningful to show. Render nothing so the
  // caller can keep its layout stable without conditionals.
  if (!stock) return null;

  const peColor =
    stock.peRatio > 30 ? "text-bearish" :
    stock.peRatio < 0 ? "text-mixed" :
    stock.peRatio < 15 ? "text-bullish" :
    "text-text-primary";

  return (
    <section
      className={cn("overflow-hidden rounded-lg border border-border bg-bg-secondary", className)}
      aria-label="Key metrics"
    >
      <header className="flex items-center gap-1.5 border-b border-border bg-bg-tertiary px-3.5 py-2">
        <BarChart3 className="h-3.5 w-3.5 text-brand" aria-hidden />
        <h3 className="label">Key Metrics</h3>
        <span className="ml-auto font-mono text-[9.5px] text-text-faint">mock data</span>
      </header>

      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
        <Metric
          icon={Layers}
          label="Market Cap"
          value={stock.marketCap}
          hint={`${stock.kode} listed`}
        />
        <Metric
          icon={Activity}
          label="P/E Ratio"
          value={stock.peRatio < 0 ? "NM" : `${stock.peRatio.toFixed(1)}x`}
          hint={stock.peRatio < 0 ? "Belum profitable" : stock.peRatio < 15 ? "Murah" : stock.peRatio < 25 ? "Wajar" : "Mahal"}
          color={peColor}
        />
        <Metric
          icon={BarChart3}
          label="Volume"
          value={stock.volume}
          hint="lembar diperdagangkan"
        />
        <Metric
          icon={Percent}
          label="Dividend Yield"
          value={`${stock.dividendYield.toFixed(1)}%`}
          hint="annualized"
          color={stock.dividendYield >= 4 ? "text-bullish" : "text-text-primary"}
        />
        <Metric
          icon={Award}
          label="Beta"
          value={stock.beta.toFixed(2)}
          hint={
            stock.beta > 1.2 ? "Lebih volatil dari IHSG" :
            stock.beta < 0.8 ? "Lebih stabil" :
            "Sejalan IHSG"
          }
        />
        <Metric
          icon={TrendingUp}
          label="30D Change"
          value={`${stock.change30dPercent >= 0 ? "+" : ""}${stock.change30dPercent.toFixed(2)}%`}
          hint="1 bulan terakhir"
          color={stock.change30dPercent >= 0 ? "text-bullish" : "text-bearish"}
        />
      </div>
    </section>
  );
}

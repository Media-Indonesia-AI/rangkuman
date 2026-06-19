import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { CommodityPrices } from "./CommodityPrices";
import { SentimentBadge } from "./SentimentBadge";
import {
  sektorList,
  getSektorCounts,
  getTopStocksInSektor,
  type SektorHue,
} from "@/lib/mock/sectors";
import { cn } from "@/lib/utils";

const hueText: Record<SektorHue, string> = {
  amber: "text-amber-500",
  sky: "text-sky-500",
  rose: "text-rose-500",
  violet: "text-violet-500",
  emerald: "text-emerald-500",
  slate: "text-slate-400",
};

const hueBg: Record<SektorHue, string> = {
  amber: "bg-amber-500/20",
  sky: "bg-sky-500/20",
  rose: "bg-rose-500/20",
  violet: "bg-violet-500/20",
  emerald: "bg-emerald-500/20",
  slate: "bg-slate-500/20",
};

const hueBorder: Record<SektorHue, string> = {
  amber: "border-amber-500/30",
  sky: "border-sky-500/30",
  rose: "border-rose-500/30",
  violet: "border-violet-500/30",
  emerald: "border-emerald-500/30",
  slate: "border-slate-500/30",
};

interface SektorSectionProps {
  /** Whether to show the commodity prices block above the sector grid. */
  showCommodities?: boolean;
  /** Section title shown above the grid. */
  gridTitle?: string;
  className?: string;
}

/**
 * Reusable sektor block:
 *  - CommodityPrices (Energi, Logam, Pertanian) — optional
 *  - 12 sector grid (with sentiment, top 3 stocks, avg change)
 *
 * Used by:
 *  - /sektor/ page (with commodities)
 *  - /saham/ sub-tab "Sektor" (with commodities, in compact mode)
 */
export function SektorSection({
  showCommodities = true,
  gridTitle = "12 sektor pasar modal Indonesia",
  className,
}: SektorSectionProps) {
  const counts = getSektorCounts();

  return (
    <div className={className}>
      {showCommodities && (
        <div className="mb-6">
          <CommodityPrices />
        </div>
      )}

      <section aria-label="12 sektor IHSG" className="mt-2">
        <header className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b border-border-strong pb-2">
          <div>
            <div className="mb-0.5 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-brand" aria-hidden />
              <span className="label text-text-secondary">Sektor IHSG</span>
              <span className="font-mono text-[10.5px] text-text-muted">
                · 12 sektor · {counts.totalStocks} emiten
              </span>
            </div>
            <h2 className="text-[15px] font-bold tracking-tight text-text-primary">
              {gridTitle}
            </h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-text-muted">
              Sentimen, saham unggulan, dan rata-rata perubahan hari ini. Klik
              untuk lihat detail emiten &amp; berita per-sektor.
            </p>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sektorList.map((s) => {
            const top = getTopStocksInSektor(s, 3);
            return (
              <Link
                key={s.slug}
                href={`/sektor/${s.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-bg-secondary transition-all hover:border-border-strong hover:shadow-card-hover"
              >
                <div className="flex items-start justify-between gap-2 border-b border-border bg-bg-tertiary px-3.5 py-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border",
                        hueBorder[s.hue],
                        hueBg[s.hue],
                        hueText[s.hue],
                      )}
                    >
                      <Building2 className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-bold tracking-tight text-text-primary">
                        {s.name}
                      </h3>
                      <p className="font-mono text-[10px] text-text-muted">
                        {s.stocks.length} emiten
                      </p>
                    </div>
                  </div>
                  <SentimentBadge sentiment={s.sentiment} size="sm" showLabel={false} />
                </div>

                <p className="px-3.5 pt-2.5 text-[11.5px] leading-snug text-text-secondary line-clamp-2">
                  {s.description}
                </p>

                <div className="mt-2 flex items-center gap-2 px-3.5">
                  <span className="label">Rata-rata</span>
                  <span
                    className={cn(
                      "font-mono text-[13px] font-bold num-tabular",
                      s.avgChange >= 0 ? "text-bullish" : "text-bearish",
                    )}
                  >
                    {s.avgChange >= 0 ? "+" : ""}
                    {s.avgChange.toFixed(2)}%
                  </span>
                </div>

                <div className="mt-2.5 border-t border-border px-3.5 py-2.5">
                  <p className="label mb-1.5">Top 3 hari ini</p>
                  <ol className="space-y-1">
                    {top.map((stock, idx) => {
                      const positive = stock.changePercent >= 0;
                      return (
                        <li key={stock.kode} className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-semibold text-text-faint num-tabular">
                            #{idx + 1}
                          </span>
                          <span className="font-mono text-[11.5px] font-semibold text-text-primary">
                            {stock.kode}
                          </span>
                          <span className="flex-1 truncate text-[10.5px] text-text-muted">
                            {stock.nama}
                          </span>
                          <span
                            className={cn(
                              "font-mono text-[11px] font-semibold num-tabular",
                              positive ? "text-bullish" : "text-bearish",
                            )}
                          >
                            {positive ? "+" : ""}
                            {stock.changePercent.toFixed(2)}%
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </div>

                <div className="mt-auto flex items-center justify-end gap-1 border-t border-border bg-bg-tertiary/50 px-3.5 py-2 font-mono text-[10.5px] font-semibold text-text-muted transition-colors group-hover:text-brand">
                  Lihat saham &amp; berita
                  <ArrowRight
                    className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </div>
              </Link>
            );
          })}
        </div>

        <p className="mt-3 text-center font-mono text-[10px] text-text-muted">
          Klasifikasi disesuaikan dari IDX-IC · 12 sektor · 34 emiten
        </p>
      </section>
    </div>
  );
}

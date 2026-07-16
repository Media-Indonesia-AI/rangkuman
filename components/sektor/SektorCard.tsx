import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { SentimentBadge } from "@/components/SentimentBadge";
import { cn } from "@/lib/utils";
import { hueBg, hueBorder, hueText } from "./hueStyles";
import {
  topStocksByAbsChange,
  type SektorDisplay,
} from "@/lib/util/sectorMappers";

interface SektorCardProps {
  /** The sector to render. `slug` drives the link, `hue` drives
   *  the badge color, `stocks` is the slice the top-N sample is
   *  sorted from. */
  sektor: SektorDisplay;
  /** How many top stocks to surface in the "Top N hari ini"
   *  list. Defaults to 3 to match the original layout. */
  topN?: number;
}

/**
 * One tile in the 12-sector grid.
 *
 * Self-contained so `<SektorSection />` only has to orchestrate
 * the grid + section header. Renders the icon badge with the
 * sector's `hue`, the sentiment chip, the average day change,
 * and a `topN` sample of stocks sorted by |changePercent| (via
 * `topStocksByAbsChange`).
 *
 * The whole card is a single `<Link>` to `/sektor/{slug}` so the
 * hit area covers the entire tile, not just the bottom CTA.
 *
 * `stock.nama` is rendered when present but is left empty when
 * the wire payload doesn't carry one — the API's `SectorStock`
 * shape currently only includes `stock_code`, `price`, and
 * `price_change`.
 */
export function SektorCard({ sektor, topN = 3 }: SektorCardProps) {
  const top = topStocksByAbsChange(sektor.stocks, topN);
  const positive = sektor.avgChange >= 0;

  return (
    <Link
      href={`/sektor/${sektor.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-bg-secondary transition-all hover:border-border-strong hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between gap-2 border-b border-border bg-bg-tertiary px-3.5 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border",
              hueBorder[sektor.hue],
              hueBg[sektor.hue],
              hueText[sektor.hue],
            )}
          >
            <Building2 className="h-3.5 w-3.5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="text-[14px] font-bold tracking-tight text-text-primary">
              {sektor.name}
            </h3>
            <p className="font-mono text-[10px] text-text-muted">
              {sektor.totalStock} emiten
            </p>
          </div>
        </div>
        <SentimentBadge
          sentiment={sektor.sentiment}
          size="sm"
          showLabel={false}
        />
      </div>

      <p className="px-3.5 pt-2.5 text-[11.5px] leading-snug text-text-secondary line-clamp-2">
        Indeks sektor {sektor.name} IHSG · {sektor.totalStock} emiten konstituen.
      </p>

      <div className="mt-2 flex items-center gap-2 px-3.5">
        <span className="label">Rata-rata</span>
        <span
          className={cn(
            "font-mono text-[13px] font-bold num-tabular",
            positive ? "text-bullish" : "text-bearish",
          )}
        >
          {positive ? "+" : ""}
          {sektor.avgChange.toFixed(2).replace(".", ",")}%
        </span>
      </div>

      <div className="mt-2.5 border-t border-border px-3.5 py-2.5">
        <p className="label mb-1.5">Top {topN} hari ini</p>
        <ol className="space-y-1">
          {top.map((stock, idx) => {
            const stockPositive = stock.changePercent >= 0;
            return (
              <li key={stock.kode} className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-semibold text-text-faint num-tabular">
                  #{idx + 1}
                </span>
                <span className="font-mono text-[11.5px] font-semibold text-text-primary">
                  {stock.kode}
                </span>
                {stock.nama && (
                  <span className="flex-1 truncate text-[10.5px] text-text-muted">
                    {stock.nama}
                  </span>
                )}
                <span
                  className={cn(
                    "font-mono text-[11px] font-semibold num-tabular",
                    stockPositive ? "text-bullish" : "text-bearish",
                  )}
                >
                  {stockPositive ? "+" : ""}
                  {stock.changePercent.toFixed(2).replace(".", ",")}%
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
}

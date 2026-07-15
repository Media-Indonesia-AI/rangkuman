import { Building2 } from "lucide-react";
import { CommodityPrices } from "@/components/CommodityPrices";
import { getSektorCounts, sektorList } from "@/lib/mock/sectors";
import { SektorCard } from "./SektorCard";

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
 *
 * The per-sector tile is split out into `<SektorCard />` so this
 * file stays focused on the section header and the grid
 * orchestration; the per-tile layout / hue styling / top-N sort
 * live in the card module alongside `hueStyles.ts`.
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
          {sektorList.map((s) => (
            <SektorCard key={s.slug} sektor={s} />
          ))}
        </div>

        <p className="mt-3 text-center font-mono text-[10px] text-text-muted">
          Klasifikasi disesuaikan dari IDX-IC · 12 sektor · 34 emiten
        </p>
      </section>
    </div>
  );
}

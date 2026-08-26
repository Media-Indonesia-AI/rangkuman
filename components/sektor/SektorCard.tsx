import Link from "next/link";
import { ArrowRight, Building2, TrendingDown, TrendingUp } from "lucide-react";
import { SentimentBadge } from "@/components/SentimentBadge";
import { cn } from "@/lib/utils";
import { hueBg, hueBorder, hueText } from "./hueStyles";
import {
  type SektorDisplay,
  type SektorDisplayStock,
} from "@/lib/util/sectorMappers";

interface SektorCardProps {
  /** The sector to render. `slug` drives the link, `hue` drives
   *  the badge color, and `leadingStocks` / `laggingStocks`
   *  feed the two-column top-movers block. */
  sektor: SektorDisplay;
}

/**
 * One tile in the 12-sector grid.
 *
 * Self-contained so `<SektorSection />` only has to orchestrate
 * the grid + section header. Renders the icon badge with the
 * sector's `hue`, the sentiment chip, the average day change,
 * and the **full** leading + lagging stock buckets from the
 * wire (no client-side top-N slicing — `limit` on the request
 * already caps the per-bucket count).
 *
 * Layout inside the card:
 *   - header strip (icon + name + sentiment)
 *   - description + "Rata-rata" row
 *   - **two-column stock block** (always 2-col, both mobile
 *     and desktop) — left column = top leading stocks (gainers,
 *     bullish icon), right column = top lagging stocks (losers,
 *     bearish icon). Each stock keeps its own sign-based color
 *     so a positive print in the lagging bucket still reads
 *     bullish and vice versa.
 *   - footer CTA strip
 *
 * The whole card is a single `<Link>` to `/sektor/{slug}` so the
 * hit area covers the entire tile, not just the bottom CTA.
 *
 * `stock.nama` is rendered when present but is left empty when
 * the wire payload doesn't carry one — the API's `SectorStock`
 * shape currently only includes `stock_code`, `price`, and
 * `price_change`.
 */
export function SektorCard({ sektor }: SektorCardProps) {
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

      <div className="mt-2.5 grid grid-cols-2 gap-3 border-t border-border px-3.5 py-2.5">
        <StockColumn
          heading="Top leading"
          icon={
            <TrendingUp
              className="h-3 w-3 text-bullish"
              aria-hidden
            />
          }
          stocks={sektor.leadingStocks}
        />
        <StockColumn
          heading="Top lagging"
          icon={
            <TrendingDown
              className="h-3 w-3 text-bearish"
              aria-hidden
            />
          }
          stocks={sektor.laggingStocks}
        />
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

/**
 * One bucket (leading or lagging) inside the card's stock block.
 * Renders a small heading with a directional icon + the rank-1..N
 * stock rows. An empty bucket falls back to a quiet em-dash so
 * the column doesn't collapse and break the 2-col alignment.
 */
function StockColumn({
  heading,
  icon,
  stocks,
}: {
  heading: string;
  icon: React.ReactNode;
  stocks: SektorDisplayStock[];
}) {
  return (
    <div className="min-w-0">
      <p className="label mb-1.5 flex items-center gap-1">
        {icon}
        {heading}
      </p>
      {stocks.length === 0 ? (
        <p className="font-mono text-[10.5px] text-text-faint">—</p>
      ) : (
        <ol className="space-y-1">
          {stocks.map((stock, idx) => (
            <StockRow key={stock.kode} stock={stock} rank={idx + 1} />
          ))}
        </ol>
      )}
    </div>
  );
}

/**
 * One stock row: rank · ticker · optional name · signed percent.
 * Color follows the actual sign of `changePercent` so a positive
 * print inside the lagging bucket still reads bullish (and vice
 * versa) — the column heading only sets the *expected* mood.
 */
function StockRow({
  stock,
  rank,
}: {
  stock: SektorDisplayStock;
  rank: number;
}) {
  const stockPositive = stock.changePercent >= 0;
  return (
    <li className="flex items-center gap-2">
      <span className="font-mono text-[10px] font-semibold text-text-faint num-tabular">
        #{rank}
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
}
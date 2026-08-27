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
 * One tile in the sector grid (rendered by `<SektorSection />`
 * inside the `/saham/` sub-tab "Sektor").
 * Self-contained — `<SektorSection />` only orchestrates the
 * surrounding grid + section header.
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
  return (
    <Link
      href={`/sektor/${sektor.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-bg-secondary transition-all hover:border-border-strong hover:shadow-card-hover"
    >
      <CardHeader sektor={sektor} />
      <CardBody sektor={sektor} />
      <CardFooter />
    </Link>
  );
}

/** Header strip: sector icon + name + emiten count, with the
 *  sentiment badge right-aligned. */
function CardHeader({ sektor }: { sektor: SektorDisplay }) {
  return (
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
  );
}

/** Middle section: short blurb + average day-change row + the
 *  two-column top leading / top lagging stock block. */
function CardBody({ sektor }: { sektor: SektorDisplay }) {
  return (
    <>
      <p className="px-3.5 pt-2.5 text-[11.5px] leading-snug text-text-secondary line-clamp-2">
        Indeks sektor {sektor.name} IHSG · {sektor.totalStock} emiten
        konstituen.
      </p>

      <div className="mt-2 flex items-center gap-2 px-3.5">
        <span className="label">Rata-rata</span>
        <SignedPercent
          value={sektor.avgChange}
          className="font-mono text-[13px] font-bold num-tabular"
        />
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-3 border-t border-border px-3.5 py-2.5">
        <StockColumn
          heading="Top leading"
          icon={<TrendingUp className="h-3 w-3 text-bullish" aria-hidden />}
          stocks={sektor.leadingStocks}
        />
        <StockColumn
          heading="Top lagging"
          icon={<TrendingDown className="h-3 w-3 text-bearish" aria-hidden />}
          stocks={sektor.laggingStocks}
        />
      </div>
    </>
  );
}

/** Bottom CTA strip — pushed to the card's bottom edge by the
 *  parent `flex flex-col` + `mt-auto` here. The arrow nudges on
 *  group-hover for affordance. */
function CardFooter() {
  return (
    <div className="mt-auto flex items-center justify-end gap-1 border-t border-border bg-bg-tertiary/50 px-3.5 py-2 font-mono text-[10.5px] font-semibold text-text-muted transition-colors group-hover:text-brand">
      Lihat saham &amp; berita
      <ArrowRight
        className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </div>
  );
}

/** One bucket (leading or lagging) inside the card's stock block.
 *  Empty buckets fall back to a quiet em-dash so the column
 *  doesn't collapse and break the two-column alignment. */
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

/** One stock row: rank · ticker · optional name · signed percent. */
function StockRow({
  stock,
  rank,
}: {
  stock: SektorDisplayStock;
  rank: number;
}) {
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
      <SignedPercent
        value={stock.changePercent}
        className="font-mono text-[11px] font-semibold num-tabular"
      />
    </li>
  );
}

/** Signed percent with the project's locale (`,` decimal, leading
 *  `+` for positives) and color that follows the sign. Shared
 *  by the average row and every stock row. */
function SignedPercent({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const positive = value >= 0;
  return (
    <span
      className={cn(
        className,
        positive ? "text-bullish" : "text-bearish",
      )}
    >
      {positive ? "+" : ""}
      {value.toFixed(2).replace(".", ",")}%
    </span>
  );
}
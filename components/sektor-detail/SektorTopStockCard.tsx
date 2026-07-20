"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Minus,
  Newspaper,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { StorySentiment } from "@/lib/api";
import type { SektorDisplayStock } from "@/lib/util/sectorMappers";
import { useSektorDetail } from "@/lib/hooks/useSektorDetail";
import { cn } from "@/lib/utils";

/** Lucide icon + color pair for each headline sentiment, shared
 *  with `<SentimentBadge />` so the sector top-stock card and the
 *  hero badge stay visually consistent. "neutral" still renders a
 *  distinct muted icon rather than disappearing — a card with no
 *  signal is still useful information for the reader. */
const SENTIMENT_ICON: Record<
  StorySentiment,
  { Icon: typeof TrendingUp; className: string; label: string }
> = {
  positive: {
    Icon: TrendingUp,
    className: "text-bullish",
    label: "Sentimen positif",
  },
  negative: {
    Icon: TrendingDown,
    className: "text-bearish",
    label: "Sentimen negatif",
  },
  neutral: {
    Icon: Minus,
    className: "text-mixed",
    label: "Sentimen netral",
  },
};

interface SektorTopStockCardProps {
  /** The stock to render. Drives every field on the card —
   *  `kode` is the link target + primary label, `price` /
   *  `changePercent` fill the price row, `nama` (optional,
   *  since the wire `SectorStock` doesn't always carry one)
   *  is the muted secondary label. */
  stock: SektorDisplayStock;
  /** 1-based rank in the top-N list. Rendered as "#01", "#02"
   *  in the rank strip. Pass the array index + 1 from the
   *  parent map. */
  rank: number;
}

/**
 * One card in the sector detail page's "Top 5" stock grid.
 *
 * Self-contained so `<SektorTopStocks />` only has to map
 * `stocks.map((s, i) => <SektorTopStockCard stock={s} rank={i + 1} />)`.
 * Renders a single `<Link>` to `/stock/{kode}` wrapping:
 *   - top rank strip with the #NN badge,
 *   - the ticker + optional company name row,
 *   - the price + day-change row (bullish/bearish colored),
 *   - the headline row — the latest headline for this ticker
 *     via `useSektorDetail`, falling back to a muted italic
 *     "Belum ada Recap" placeholder when the ticker has no
 *     headline yet (loading, no data, or fetch error),
 *   - the footer row that swaps between a "<n> artikel · <m>
 *     media" coverage line (when `useSektorDetail` has
 *     resolved counts) and a "Live dari API" pill (during
 *     loading), plus the `ArrowUpRight` CTA affordance.
 *
 * The whole card is a single `<Link>` so the click hit area
 * covers the entire tile, not just the bottom CTA — mirrors
 * the `SektorCard` and `CommodityTile` conventions.
 *
 * `nama` is rendered only when present. The wire `SectorStock`
 * payload may omit it; in that case the card collapses to
 * ticker + price + change (no muted secondary label), keeping
 * the layout stable. The headline row always renders (with
 * its italic placeholder when empty), so the card body
 * height stays predictable across the grid.
 */
export function SektorTopStockCard({ stock, rank }: SektorTopStockCardProps) {
  const stockPositive = stock.changePercent >= 0;
  const href = `/stock/${stock.kode}`;
  const { title, articleCount, mediaCount, sentiment } =
    useSektorDetail(stock.kode);
  // Resolve the sentiment glyph up-front so the headline <div>
  // can stay a flat flex row. `null` (loading / no data) renders
  // a placeholder span of the same width so the title text doesn't
  // shift when the icon arrives — the gap follows the icon size,
  // not the content. `Icon` is captured into a capitalized local so
  // JSX can render it (member-expression elements aren't valid).
  const sentimentIcon = sentiment ? SENTIMENT_ICON[sentiment] : null;
  const SentimentIcon = sentimentIcon?.Icon;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-bg-secondary transition-all hover:border-border-strong hover:shadow-card-hover"
    >
      {/* Top rank strip */}
      <div className="flex items-center justify-between border-b border-border bg-bg-tertiary px-3 py-1.5">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-faint num-tabular">
          #{String(rank).padStart(2, "0")}
        </span>
        {/* Headline-scoped sentiment glyph on the right edge of the
            rank strip, flush with the same row as the #NN number.
            The icon (when known) is wrapped in a `role="img"` span so
            `title` + `aria-label` deliver the tooltip + a11y name;
            while the fetch is still in flight an empty span of the
            same width holds the slot so the number doesn't reflow
            once the icon arrives. */}
        {sentimentIcon && SentimentIcon ? (
          <span
            title={sentimentIcon.label}
            aria-label={sentimentIcon.label}
            role="img"
            className={cn("flex-none", sentimentIcon.className)}
          >
            <SentimentIcon className="h-3 w-3" aria-hidden />
          </span>
        ) : (
          <span aria-hidden className="h-3 w-3 flex-none" />
        )}
      </div>

      <div className="p-3.5">
        <div className="flex items-baseline gap-2">
          <h3 className="font-mono text-[20px] font-bold leading-none tracking-tighter text-text-primary group-hover:text-brand">
            {stock.kode}
          </h3>
          {stock.nama && (
            <span className="truncate text-[11px] text-text-muted">
              {stock.nama}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-mono text-[16px] font-bold leading-none text-text-primary num-tabular">
            {stock.price.toLocaleString("id-ID")}
          </span>
          <span
            className={cn(
              "font-mono text-[12px] font-semibold num-tabular",
              stockPositive ? "text-bullish" : "text-bearish",
            )}
          >
            {stockPositive ? "▲ +" : "▼ "}
            {Math.abs(stock.changePercent).toFixed(2)}%
          </span>
        </div>

        <p
          className={cn(
            "mt-2 line-clamp-2 text-[11.5px] leading-snug",
            title ? "text-text-secondary" : "italic text-text-faint",
          )}
        >
          {title || "Belum ada Recap"}
        </p>

        <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2">
          {(articleCount > 0 || mediaCount > 0) ? (
            <div className="flex items-center gap-1 font-mono text-[10px] text-text-faint">
              <Newspaper className="h-3 w-3" aria-hidden />
              <span className="num-tabular">
                {`${articleCount} artikel${mediaCount > 0 ? ` · ${mediaCount} media` : ""}`}
              </span>
            </div>
          ) : (
            <span className="font-mono text-[10px] text-text-faint">
              Belum ada Recap
            </span>
          )}
          <ArrowUpRight
            className="h-3 w-3 text-text-faint transition-colors group-hover:text-brand"
            aria-hidden
          />
        </div>
      </div>
    </Link>
  );
}
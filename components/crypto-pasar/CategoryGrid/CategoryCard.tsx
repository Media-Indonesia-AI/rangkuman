"use client";

import Link from "next/link";
import { ArrowRight, Coins, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CoinCategory, CoinTickerItem } from "@/lib/api";

interface CategoryCardProps {
  /** One category returned by `GET coin-category/`. `name`
   *  drives the icon hue (deterministic hash), and
   *  `top_gainers` / `top_losers` feed the two-column
   *  top-movers block at the bottom of the card. */
  cat: CoinCategory;
}

// ─── Hue palette (mirror of `components/sektor/hueStyles.ts`) ───
//
// The wire shape doesn't carry a per-category hue, so we derive
// one deterministically from the category name (same djb2-ish
// hash `lib/util/sectorMappers.ts` uses for sectors). Keeping the
// palette identical to the sector grid means cards in both
// sections feel like one design system.

type Hue = "amber" | "sky" | "rose" | "violet" | "emerald" | "slate";

const HUES: Hue[] = ["amber", "sky", "rose", "violet", "emerald", "slate"];

function hashName(name: string): number {
  let h = 5381;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) + h + name.charCodeAt(i)) | 0;
  }
  return h;
}

function resolveHue(name: string): Hue {
  return HUES[Math.abs(hashName(name)) % HUES.length];
}

const HUE_TEXT: Record<Hue, string> = {
  amber: "text-amber-500",
  sky: "text-sky-500",
  rose: "text-rose-500",
  violet: "text-violet-500",
  emerald: "text-emerald-500",
  slate: "text-slate-400",
};

const HUE_BG: Record<Hue, string> = {
  amber: "bg-amber-500/20",
  sky: "bg-sky-500/20",
  rose: "bg-rose-500/20",
  violet: "bg-violet-500/20",
  emerald: "bg-emerald-500/20",
  slate: "bg-slate-500/20",
};

const HUE_BORDER: Record<Hue, string> = {
  amber: "border-amber-500/30",
  sky: "border-sky-500/30",
  rose: "border-rose-500/30",
  violet: "border-violet-500/30",
  emerald: "border-emerald-500/30",
  slate: "border-slate-500/30",
};

/**
 * One tile in the category grid (rendered by `<CategoryGrid />`
 * on the Pasar tab).
 *
 * The shape mirrors `<SektorCard />` so the two grids feel like
 * siblings on the same page:
 *
 *   - **Header** — icon badge (hue-derived) + category name +
 *     24h volume, no sentiment badge (the wire shape doesn't
 *     carry one).
 *   - **Body** — short blurb with aggregate market cap, then the
 *     two-column top gainers / top losers block. Each column
 *     renders up to N coins; an empty bucket falls back to a
 *     quiet em-dash so the two columns stay aligned.
 *   - **Footer** — "Lihat kategori" CTA strip pushed to the
 *     bottom edge by the parent `flex flex-col`.
 *
 * The whole card is rendered as a `<article>` rather than a
 * `<Link>` because there's no crypto category detail route yet
 * — once `/crypto/kategori/[slug]` ships, swap the outer element
 * the same way `<SektorCard />` does.
 */
export function CategoryCard({ cat }: CategoryCardProps) {
  const hue = resolveHue(cat.name);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-bg-secondary transition-all hover:border-border-strong hover:shadow-card-hover">
      <CardHeader cat={cat} hue={hue} />
      <CardBody cat={cat} />
      <CardFooter />
    </article>
  );
}

/** Header strip: icon badge + category name + 24h volume. */
function CardHeader({ cat, hue }: { cat: CoinCategory; hue: Hue }) {
  return (
    <div className="flex items-start justify-between gap-2 border-b border-border bg-bg-tertiary px-3.5 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border",
            HUE_BORDER[hue],
            HUE_BG[hue],
            HUE_TEXT[hue],
          )}
        >
          <Coins className="h-3.5 w-3.5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-[14px] font-bold tracking-tight text-text-primary">
            {cat.name}
          </h3>
          <p className="font-mono text-[10px] text-text-muted">
            Vol 24h {formatUsd(cat.volume_24h)}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Body: market-cap blurb + the two-column top gainers / top
 *  losers block. Mirrors `<SektorCard />`'s body layout — the
 *  two columns stay at equal height via `min-w-0` + `grid-cols-2`. */
function CardBody({ cat }: { cat: CoinCategory }) {
  return (
    <>
      <p className="px-3.5 pt-2.5 text-[11.5px] leading-snug text-text-secondary line-clamp-2">
        Market cap {formatUsd(cat.market_cap)} ·{" "}
        {cat.top_gainers.length + cat.top_losers.length} koin top movers
      </p>

      <div className="mt-2.5 grid grid-cols-2 gap-3 border-t border-border px-3.5 py-2.5">
        <CoinColumn
          heading="Top Gainer"
          icon={<TrendingUp className="h-3 w-3 text-bullish" aria-hidden />}
          coins={cat.top_gainers}
        />
        <CoinColumn
          heading="Top Looser"
          icon={<TrendingDown className="h-3 w-3 text-bearish" aria-hidden />}
          coins={cat.top_losers}
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
      Lihat kategori
      <ArrowRight
        className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </div>
  );
}

/** One bucket (gainer or loser) inside the card's two-column
 *  block. Empty buckets fall back to a quiet em-dash so the
 *  column doesn't collapse and break the alignment with the
 *  sibling column. */
function CoinColumn({
  heading,
  icon,
  coins,
}: {
  heading: string;
  icon: React.ReactNode;
  coins: CoinTickerItem[];
}) {
  return (
    <div className="min-w-0">
      <p className="label mb-1.5 flex items-center gap-1">
        {icon}
        {heading}
      </p>
      {coins.length === 0 ? (
        <p className="font-mono text-[10.5px] text-text-faint">—</p>
      ) : (
        <ol className="space-y-1">
          {coins.map((coin, idx) => (
            <CoinRow key={coin.ticker} coin={coin} rank={idx + 1} />
          ))}
        </ol>
      )}
    </div>
  );
}

/** One coin row: rank · ticker (linked to `/crypto/{ticker}`)
 *  · optional full name · signed percent change.
 *
 *  Matches `<SektorCard />`'s `<StockRow />` shape so the two
 *  grids read as one design language — only the color tokens
 *  and percent precision differ (crypto 2 decimals to match
 *  the rest of the Pasar tab). */
function CoinRow({
  coin,
  rank,
}: {
  coin: CoinTickerItem;
  rank: number;
}) {
  const positive = coin.price_change >= 0;
  return (
    <li className="flex items-center gap-2">
      <span className="font-mono text-[10px] font-semibold text-text-faint num-tabular">
        #{rank}
      </span>
      <Link
        href={`/crypto/${coin.ticker}`}
        className="font-mono text-[11.5px] font-semibold text-text-primary hover:text-brand"
      >
        {coin.ticker.toUpperCase()}
      </Link>
      {coin.ticker_name && (
        <span className="flex-1 truncate text-[10.5px] text-text-muted">
          {coin.ticker_name}
        </span>
      )}
      <span
        className={cn(
          "font-mono text-[11px] font-semibold num-tabular",
          positive ? "text-bullish" : "text-bearish",
        )}
      >
        {positive ? "+" : ""}
        {coin.price_change.toFixed(2).replace(".", ",")}%
      </span>
    </li>
  );
}

/** Compact USD formatter — collapses to `$X.XB` / `$X.XT` for
 *  the volume / market-cap blurb so the header strip stays a
 *  single line. Falls back to `$X` below a million. */
function formatUsd(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toFixed(0)}`;
}

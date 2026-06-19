import Link from "next/link";
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COIN_CATEGORIES,
  getCoinsByCategory,
  COINS,
  type Coin,
} from "@/lib/mock/crypto";

const HUE_BG: Record<string, string> = {
  amber: "bg-amber-500/15",
  sky: "bg-sky-500/15",
  rose: "bg-rose-500/15",
  violet: "bg-violet-500/15",
  emerald: "bg-emerald-500/15",
  slate: "bg-slate-500/15",
};

const HUE_BORDER: Record<string, string> = {
  amber: "border-amber-500/30",
  sky: "border-sky-500/30",
  rose: "border-rose-500/30",
  violet: "border-violet-500/30",
  emerald: "border-emerald-500/30",
  slate: "border-slate-500/30",
};

const HUE_TEXT: Record<string, string> = {
  amber: "text-amber-500",
  sky: "text-sky-500",
  rose: "text-rose-500",
  violet: "text-violet-500",
  emerald: "text-emerald-500",
  slate: "text-slate-400",
};

interface CryptoSectionProps {
  className?: string;
}

export function CryptoSection({ className }: CryptoSectionProps) {
  // Compute top 3 gainers / losers across all coins for the hero strip
  const sorted = [...COINS].sort((a, b) => b.changePercent - a.changePercent);
  const topGainers = sorted.slice(0, 3);
  const topLosers = sorted.slice(-3).reverse();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Top movers strip */}
      <section>
        <div className="mb-2 flex items-end justify-between border-b border-border-strong pb-1.5">
          <div>
            <h2 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
              Top Movers 24 jam
            </h2>
            <p className="mt-0.5 text-[11px] text-text-muted">
              Koin dengan perubahan harga terbesar
            </p>
          </div>
          <span className="font-mono text-[10px] text-text-faint">
            {COINS.length} koin diliput
          </span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {topGainers.map((c) => (
            <CoinTickerCard key={c.kode} coin={c} />
          ))}
          {topLosers.map((c) => (
            <CoinTickerCard key={c.kode} coin={c} />
          ))}
        </div>
      </section>

      {/* Categories grid */}
      <section>
        <div className="mb-3 flex items-end justify-between border-b border-border-strong pb-1.5">
          <div>
            <h2 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
              Kategori Koin
            </h2>
            <p className="mt-0.5 text-[11px] text-text-muted">
              {COIN_CATEGORIES.length} kategori pasar crypto
            </p>
          </div>
          <span className="font-mono text-[10px] text-text-faint">
            Sorted by market cap
          </span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {COIN_CATEGORIES.map((cat) => {
            const IconComponent =
              (Icons as unknown as Record<string, Icons.LucideIcon>)[
                cat.icon
                  .split("-")
                  .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                  .join("")
              ] ?? Icons.Coins;
            const coinsInCat = getCoinsByCategory(cat.key);
            const avgChange =
              coinsInCat.length > 0
                ? coinsInCat.reduce((acc, c) => acc + c.changePercent, 0) /
                  coinsInCat.length
                : 0;
            const isUp = avgChange >= 0;

            return (
              <article
                key={cat.key}
                className={cn(
                  "group relative overflow-hidden rounded-lg border bg-bg-secondary transition-colors hover:border-border-strong",
                  HUE_BORDER[cat.hue],
                )}
              >
                <div className="p-3.5">
                  {/* Header */}
                  <div className="mb-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "inline-flex h-6 w-6 items-center justify-center rounded-md",
                          HUE_BG[cat.hue],
                          HUE_TEXT[cat.hue],
                        )}
                      >
                        <IconComponent className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      <h3 className="font-mono text-[12px] font-bold uppercase tracking-wider text-text-primary">
                        {cat.label}
                      </h3>
                    </div>
                    <span
                      className={cn(
                        "font-mono text-[11px] font-semibold tabular-nums",
                        isUp ? "text-cat-saham" : "text-cat-kebijakan",
                      )}
                    >
                      {isUp ? "+" : ""}
                      {avgChange.toFixed(2)}%
                    </span>
                  </div>

                  {/* Description */}
                  <p className="line-clamp-1 text-[10.5px] text-text-muted">
                    {cat.description}
                  </p>

                  {/* Top 3 coins in category */}
                  {coinsInCat.length > 0 ? (
                    <ul className="mt-2.5 space-y-1">
                      {coinsInCat.slice(0, 3).map((c) => {
                        const isCoinUp = c.changePercent >= 0;
                        return (
                          <li
                            key={c.kode}
                            className="flex items-center justify-between text-[11.5px]"
                          >
                            <Link
                              href={`/crypto/${c.kode.toLowerCase()}`}
                              className="font-mono font-semibold text-text-primary hover:text-brand"
                            >
                              {c.kode}
                            </Link>
                            <span
                              className={cn(
                                "font-mono tabular-nums",
                                isCoinUp
                                  ? "text-cat-saham"
                                  : "text-cat-kebijakan",
                              )}
                            >
                              {isCoinUp ? "+" : ""}
                              {c.changePercent.toFixed(1)}%
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-2.5 text-[11px] italic text-text-faint">
                      Belum ada koin di kategori ini
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Disclaimer */}
      <p className="text-center font-mono text-[10px] text-text-muted">
        Mau lihat semua {COINS.length} koin? Buka{" "}
        <Link
          href="/trending"
          className="text-text-secondary hover:text-brand"
        >
          /trending
        </Link>{" "}
        atau tambahkan ke watchlist dari halaman koin individual.
      </p>
    </div>
  );
}

function CoinTickerCard({ coin }: { coin: Coin }) {
  const isUp = coin.changePercent >= 0;
  return (
    <Link
      href={`/crypto/${coin.kode.toLowerCase()}`}
      className="group flex items-center justify-between gap-2 rounded-lg border border-border bg-bg-secondary px-3 py-2.5 transition-colors hover:border-border-strong"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[13px] font-bold tracking-tight text-text-primary group-hover:text-brand">
            {coin.kode}
          </span>
          <span className="truncate text-[10.5px] text-text-muted">
            {coin.nama}
          </span>
        </div>
        <div className="mt-0.5 font-mono text-[12px] font-semibold tabular-nums text-text-primary">
          {formatPrice(coin.price)}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Sparkline data={coin.sparkline} isUp={isUp} />
        <div className="text-right">
          <div
            className={cn(
              "font-mono text-[11.5px] font-semibold tabular-nums",
              isUp ? "text-cat-saham" : "text-cat-kebijakan",
            )}
          >
            {isUp ? "+" : ""}
            {coin.changePercent.toFixed(2)}%
          </div>
          <div className="font-mono text-[9.5px] text-text-faint">
            {isUp ? (
              <TrendingUp className="inline h-2.5 w-2.5" aria-hidden />
            ) : (
              <TrendingDown className="inline h-2.5 w-2.5" aria-hidden />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function Sparkline({ data, isUp }: { data: number[]; isUp: boolean }) {
  const w = 48;
  const h = 16;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = w / (data.length - 1);

  const points = data
    .map((v, i) => {
      const x = i * stepX;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="shrink-0"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? "var(--bullish)" : "var(--bearish)"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatPrice(price: number): string {
  if (price >= 1000) {
    return `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
  if (price >= 1) {
    return `$${price.toFixed(2)}`;
  }
  return `$${price.toFixed(4)}`;
}

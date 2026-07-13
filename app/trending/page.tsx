"use client";

import { useState } from "react";
import Link from "next/link";
import { Flame, ArrowUpRight, ArrowLeft, FileText, Megaphone, Newspaper } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SentimentBadge } from "@/components/SentimentBadge";
import {
  getTrending,
  periodLabel,
  type TrendingPeriod,
} from "@/lib/mock/trending";
import { cn } from "@/lib/utils";

const periodList: TrendingPeriod[] = ["today", "week", "month"];

export default function TrendingPage() {
  const [period, setPeriod] = useState<TrendingPeriod>("today");
  const rows = getTrending(period);

  // Aggregate stats
  const positif = rows.filter((r) => r.sentiment === "positif").length;
  const netral = rows.filter((r) => r.sentiment === "netral").length;
  const negatif = rows.filter((r) => r.sentiment === "negatif").length;
  const totalArticles = rows.reduce((acc, r) => acc + r.articleCount, 0);
  const totalMedia = new Set(rows.flatMap((r) => Array.from({ length: r.mediaCount }, () => r.kode))).size;

  return (
    <>
      <Navbar />

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5">
        {/* Back link */}
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-1.5 text-[12px] text-text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden />
          Kembali ke Beranda
        </Link>

        {/* Header */}
        <header className="mb-5 border-b border-border-strong pb-3">
          <div className="mb-1 flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-brand" aria-hidden />
            <span className="label text-text-secondary">Trending saham</span>
            <span className="font-mono text-[10.5px] text-text-muted">
              · 20 teratas · dikurasi harian
            </span>
          </div>
          <h1 className="text-[24px] font-bold leading-tight tracking-tight text-text-primary sm:text-[30px]">
            Saham paling banyak dibicarakan
          </h1>
          <p className="mt-1 max-w-2xl text-[12.5px] leading-[1.55] text-text-secondary">
            Ranking diurutin berdasarkan jumlah artikel dari CNBC, Bisnis, Kontan, Bloomberg, Reuters, dan 20+ media lainnya. Update setiap sesi perdagangan.
          </p>
        </header>

        {/* Period filter pills */}
        <div
          role="tablist"
          aria-label="Filter periode"
          className="mb-4 inline-flex items-center gap-1 rounded-md border border-border bg-bg-secondary p-1"
        >
          {periodList.map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={period === p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                period === p
                  ? "bg-bg-tertiary text-text-primary"
                  : "text-text-muted hover:text-text-primary",
              )}
            >
              {periodLabel[p]}
            </button>
          ))}
        </div>

        {/* Aggregate stats strip */}
        <section className="mb-4 grid grid-cols-2 divide-x divide-border border-y border-border sm:grid-cols-4">
          <StatBlock
            label="Positif"
            value={positif}
            sublabel={`/ ${rows.length}`}
            color="text-bullish"
          />
          <StatBlock
            label="Netral"
            value={netral}
            sublabel={`/ ${rows.length}`}
            color="text-mixed"
          />
          <StatBlock
            label="Negatif"
            value={negatif}
            sublabel={`/ ${rows.length}`}
            color="text-bearish"
          />
          <StatBlock
            label="Total artikel"
            value={totalArticles}
            sublabel={`${rows.length} saham`}
            color="text-brand"
            mono
          />
        </section>

        {/* Trending list */}
        <section
          className="overflow-hidden rounded-lg border border-border bg-bg-secondary"
          aria-label="Daftar 20 saham trending"
        >
          <header className="hidden border-b border-border bg-bg-tertiary px-3 py-2 sm:grid sm:grid-cols-[40px_1fr_60px_120px_120px] sm:gap-3 sm:px-4">
            <span className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-faint">
              #
            </span>
            <span className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-faint">
              Saham
            </span>
            <span className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-faint">
              Sentimen
            </span>
            <span className="text-right font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-faint">
              Artikel / Media
            </span>
            <span className="text-right font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-faint">
              Perubahan
            </span>
          </header>

          <ol className="divide-y divide-border">
            {rows.map((r) => (
              <li key={r.kode}>
                <Link
                  href={`/stock/${r.kode}`}
                  className="group block px-3 py-3 transition-colors hover:bg-bg-tertiary/60 sm:grid sm:grid-cols-[40px_1fr_60px_120px_120px] sm:items-center sm:gap-3 sm:px-4 sm:py-3"
                >
                  {/* Mobile card layout (stacked vertically) */}
                  <div className="flex flex-col gap-1.5 sm:hidden">
                    {/* Row 1: rank + ticker + sentiment + change */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-baseline gap-2">
                        <span className="font-mono text-[10px] font-semibold leading-none text-text-faint num-tabular">
                          #{String(r.rank).padStart(2, "0")}
                        </span>
                        <span className="font-mono text-[16px] font-bold leading-none tracking-tighter text-text-primary group-hover:text-brand">
                          {r.kode}
                        </span>
                        <span className="truncate text-[10.5px] text-text-muted">{r.nama}</span>
                      </div>
                      <span
                        className={cn(
                          "font-mono text-[12.5px] font-semibold leading-none num-tabular",
                          r.changePercent >= 0 ? "text-bullish" : "text-bearish",
                        )}
                      >
                        {r.changePercent >= 0 ? "▲ +" : "▼ "}
                        {Math.abs(r.changePercent).toFixed(2)}%
                      </span>
                    </div>
                    {/* Row 2: sentiment + articles + media + sector + price */}
                    <div className="flex items-center gap-2">
                      <SentimentBadge sentiment={r.sentiment} size="sm" showLabel={false} />
                      <span className="font-mono text-[10px] text-text-muted">
                        {r.articleCount} art · {r.mediaCount} md
                      </span>
                      <span className="ml-auto truncate font-mono text-[10px] uppercase tracking-wider text-text-faint">
                        {r.sektor} · {r.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* Desktop table layout */}
                  <span className="hidden font-mono text-[13.5px] font-semibold leading-none text-text-faint num-tabular sm:inline">
                    {String(r.rank).padStart(2, "0")}
                  </span>
                  <div className="hidden min-w-0 sm:block">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-[16px] font-bold leading-none tracking-tighter text-text-primary group-hover:text-brand">
                        {r.kode}
                      </span>
                      <span className="truncate text-[11.5px] text-text-muted">
                        {r.nama}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-wider text-text-faint">
                      {r.sektor} · {r.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="hidden sm:flex sm:justify-center">
                    <SentimentBadge sentiment={r.sentiment} size="sm" />
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="font-mono text-[12.5px] font-semibold text-text-primary num-tabular">
                      {r.articleCount}
                    </p>
                    <p className="font-mono text-[9.5px] text-text-muted">
                      {r.mediaCount} media
                    </p>
                  </div>
                  <div className="hidden items-center justify-end gap-2 sm:flex">
                    <p
                      className={cn(
                        "font-mono text-[12.5px] font-semibold leading-none num-tabular",
                        r.changePercent >= 0 ? "text-bullish" : "text-bearish",
                      )}
                    >
                      {r.changePercent >= 0 ? "▲ +" : "▼ "}
                      {Math.abs(r.changePercent).toFixed(2)}%
                    </p>
                    <ArrowUpRight
                      className="h-3 w-3 shrink-0 text-text-faint transition-colors group-hover:text-brand"
                      aria-hidden
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* Footer note */}
        <p className="mt-4 text-center font-mono text-[10.5px] text-text-muted">
          Ranking diupdate tiap sesi perdagangan. Bukan rekomendasi investasi.
        </p>
      </main>
      <Footer />
    </>
  );
}

interface StatBlockProps {
  label: string;
  value: number;
  sublabel?: string;
  color: string;
  mono?: boolean;
}

function StatBlock({ label, value, sublabel, color, mono }: StatBlockProps) {
  return (
    <div className="px-3 py-2.5 sm:px-4 sm:py-3">
      <p className="label">{label}</p>
      <p
        className={cn(
          "mt-0.5 leading-none",
          color,
          mono
            ? "font-mono text-[20px] font-bold num-tabular sm:text-[24px]"
            : "text-[20px] font-bold sm:text-[24px]",
        )}
      >
        {value}
        {sublabel && (
          <span className="ml-1 font-mono text-[11px] text-text-muted">
            {sublabel}
          </span>
        )}
      </p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Newspaper,
  TrendingUp,
  Building2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SentimentBadge } from "@/components/SentimentBadge";
import { Shimmer } from "@/components/Shimmer";
import { useSectors } from "@/lib/hooks/useSectors";
import {
  mapSector,
  topStocksByAbsChange,
  type SektorDisplay,
} from "@/lib/util/sectorMappers";
import { hueBg, hueBorder, hueText } from "@/components/sektor";
import { cn } from "@/lib/utils";

interface PageProps {
  params: { slug: string };
}

/** Empty-state shell shown while `GET stocks/sectors` is in
 *  flight. Mirrors the real page's structure (back link, header,
 *  top-stocks section, news section) so the layout doesn't shift
 *  on resolution. */
function SektorDetailSkeleton() {
  return (
    <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5">
      <div className="mb-3 h-3 w-24">
        <Shimmer className="h-3 w-24" />
      </div>

      {/* Header skeleton */}
      <header className="mb-5 overflow-hidden rounded-lg border border-border bg-bg-secondary">
        <div className="flex flex-wrap items-start gap-4 p-5">
          <Shimmer className="h-12 w-12 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-6 w-64" />
            <Shimmer className="h-3 w-96" />
          </div>
          <div className="grid w-full grid-cols-2 gap-3 sm:w-auto">
            <div className="space-y-1.5">
              <Shimmer className="h-3 w-12" />
              <Shimmer className="h-5 w-20" />
            </div>
            <div className="space-y-1.5">
              <Shimmer className="h-3 w-12" />
              <Shimmer className="h-5 w-16" />
            </div>
          </div>
        </div>
      </header>

      {/* Top stocks skeleton */}
      <section className="mb-5" aria-busy="true">
        <header className="mb-3 flex items-end justify-between border-b border-border-strong pb-2">
          <div className="space-y-2">
            <Shimmer className="h-3 w-32" />
            <Shimmer className="h-4 w-48" />
          </div>
        </header>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg border border-border bg-bg-secondary"
            >
              <div className="flex items-center justify-between border-b border-border bg-bg-tertiary px-3.5 py-1.5">
                <Shimmer className="h-3 w-10" />
              </div>
              <div className="space-y-2 p-3.5">
                <Shimmer className="h-5 w-20" />
                <Shimmer className="h-4 w-24" />
                <Shimmer className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* News skeleton */}
      <section aria-busy="true">
        <header className="mb-3 flex items-end justify-between border-b border-border-strong pb-2">
          <div className="space-y-2">
            <Shimmer className="h-3 w-24" />
            <Shimmer className="h-4 w-56" />
          </div>
        </header>
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Shimmer key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      </section>
    </main>
  );
}

/** Empty-state shell shown when the slug doesn't match any
 *  sector in the live response. Caller should `notFound()`
 *  instead — this is a defensive fallback if `notFound` ever
 *  fails to throw. */
function SektorDetailEmpty() {
  return (
    <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5">
      <h1 className="sr-only">Sektor tidak ditemukan</h1>
      <div className="rounded-lg border border-dashed border-border bg-bg-secondary/50 px-6 py-10 text-center">
        <p className="text-[13px] text-text-muted">
          Sektor ini belum tersedia.
        </p>
      </div>
    </main>
  );
}

/**
 * Sector detail page — `/sektor/[slug]`.
 *
 * Renders one sector's header (hue, sentiment, avg change),
 * top-5 stocks sorted by |changePercent|, and a "Berita sektor"
 * placeholder. Data is fetched live from `GET stocks/sectors`
 * via `useSectors` and the route's `params.slug` resolves to a
 * matching display sector.
 *
 * Three render branches (mirrors `<SektorSection />`):
 *   1. `isLoading`          → shimmer skeleton
 *   2. sector not in data  → `notFound()` (404 boundary)
 *   3. real data           → the populated page
 *
 * News section: the `/stocks/sectors` endpoint doesn't include
 * recap/news data per stock. The news list renders an
 * empty-state placeholder until a per-stock recap endpoint is
 * available — see the comment on that section for the data gap.
 *
 * Note on `generateMetadata` / `generateStaticParams`: those
 * stay in the sibling `page.tsx` and still source from the mock
 * catalog for SEO purposes. Migrating them to live data is a
 * separate concern — they'd need a server-side fetcher that
 * resolves to the slug list at build time.
 */
export default function SektorDetailPage({ params }: PageProps) {
  const { data, isLoading } = useSectors();

  if (isLoading) {
    return (
      <>
        <Navbar />
        <SektorDetailSkeleton />
        <Footer />
      </>
    );
  }

  // Map wire sectors → display shape, then look up the slug.
  // Falls back to an empty array when data is null so the find
  // below produces an "unknown slug" instead of crashing.
  const sectors: SektorDisplay[] = data ? data.map(mapSector) : [];
  const sektor = sectors.find((s) => s.slug === params.slug);

  if (!sektor) {
    notFound();
  }

  const topStocks = topStocksByAbsChange(sektor.stocks, 5);
  const positive = sektor.avgChange >= 0;

  return (
    <>
      <Navbar />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5">
        {/* FIX 4: Sr-only H1 for SEO */}
        <h1 className="sr-only">Rangkuman &mdash; Sektor {sektor.name}</h1>

        <Link
          href="/sektor"
          className="mb-3 inline-flex items-center gap-1.5 text-[12px] text-text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden />
          Semua sektor
        </Link>

        {/* Header */}
        <header className="mb-5 overflow-hidden rounded-lg border border-border bg-bg-secondary">
          <div className="flex flex-wrap items-start gap-4 p-5">
            <span
              className={cn(
                "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border",
                hueBorder[sektor.hue],
                hueBg[sektor.hue],
                hueText[sektor.hue],
              )}
            >
              <Building2 className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="label">Sektor</span>
                <SentimentBadge sentiment={sektor.sentiment} size="sm" />
                <span className="font-mono text-[10.5px] text-text-muted">
                  · {sektor.totalStock} emiten
                </span>
              </div>
              <h2 className="text-[24px] font-bold leading-tight tracking-tight text-text-primary sm:text-[30px]">
                {sektor.name}
              </h2>
              <p className="mt-1 max-w-2xl text-[12.5px] leading-[1.55] text-text-secondary">
                Sentimen, saham unggulan, dan rata-rata perubahan hari ini untuk
                sektor {sektor.name.toLowerCase()}.
              </p>
            </div>

            {/* Mini stats */}
            <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:grid-cols-2">
              <div>
                <p className="label">Rata-rata</p>
                <p
                  className={cn(
                    "mt-0.5 font-mono text-[18px] font-bold leading-none num-tabular",
                    positive ? "text-bullish" : "text-bearish",
                  )}
                >
                  {positive ? "+" : ""}
                  {sektor.avgChange.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="label">Sentimen</p>
                <p
                  className={cn(
                    "mt-0.5 text-[16px] font-bold leading-none",
                    sentimentTextClass[sektor.sentiment],
                  )}
                >
                  {sentimentLabel[sektor.sentiment]}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Trending stocks in this sector */}
        <section className="mb-5" aria-label="Saham trending di sektor ini">
          <header className="mb-3 flex items-end justify-between border-b border-border-strong pb-2">
            <div>
              <div className="mb-0.5 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-brand" aria-hidden />
                <span className="label text-text-secondary">
                  Saham trending di sektor ini
                </span>
              </div>
              <h2 className="text-[15px] font-bold tracking-tight text-text-primary">
                Top 5 saham {sektor.name}
              </h2>
            </div>
            <span className="font-mono text-[10.5px] text-text-muted">
              diurutin berdasarkan perubahan hari ini
            </span>
          </header>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topStocks.map((stock, idx) => {
              const stockPositive = stock.changePercent >= 0;
              const href = `/stock/${stock.kode}`;
              return (
                <Link
                  key={stock.kode}
                  href={href}
                  className="group flex flex-col overflow-hidden rounded-lg border border-border bg-bg-secondary transition-all hover:border-border-strong hover:shadow-card-hover"
                >
                  {/* Top rank strip */}
                  <div className="flex items-center justify-between border-b border-border bg-bg-tertiary px-3 py-1.5">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-faint num-tabular">
                      #{String(idx + 1).padStart(2, "0")}
                    </span>
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

                    <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2">
                      <span className="font-mono text-[10px] text-text-faint">
                        Live dari API
                      </span>
                      <ArrowUpRight
                        className="h-3 w-3 text-text-faint transition-colors group-hover:text-brand"
                        aria-hidden
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* News in this sector — empty state until per-stock recap
         *  endpoint is available. The `/stocks/sectors` response
         *  doesn't include recap data per stock; keeping the
         *  section visible as a placeholder so the layout stays
         *  stable while the data gap is closed. */}
        <section aria-label="Berita sektor">
          <header className="mb-3 flex items-end justify-between border-b border-border-strong pb-2">
            <div>
              <div className="mb-0.5 flex items-center gap-1.5">
                <Newspaper className="h-3.5 w-3.5 text-brand" aria-hidden />
                <span className="label text-text-secondary">Berita sektor</span>
              </div>
              <h2 className="text-[15px] font-bold tracking-tight text-text-primary">
                Recap terbaru dari emiten {sektor.name}
              </h2>
            </div>
            <span className="font-mono text-[10.5px] text-text-muted">
              agregat dari 6+ media
            </span>
          </header>

          <div className="rounded-lg border border-dashed border-border bg-bg-secondary/50 px-6 py-10 text-center">
            <p className="text-[13px] text-text-muted">
              Recap berita per-emiten belum tersedia untuk sektor ini.
            </p>
            <p className="mt-1 font-mono text-[10.5px] text-text-faint">
              Endpoint recap per saham belum di-integrasikan di sini.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

/** Three-bucket sentiment label + text color matching the
 *  SentimentBadge convention used elsewhere. Inlined here
 *  rather than imported because SektorDetailPage is the only
 *  consumer of the "label-only" mode. */
const sentimentLabel: Record<"positif" | "netral" | "negatif", string> = {
  positif: "Positif",
  netral: "Netral",
  negatif: "Negatif",
};
const sentimentTextClass: Record<"positif" | "netral" | "negatif", string> = {
  positif: "text-bullish",
  netral: "text-mixed",
  negatif: "text-bearish",
};

// `notFound()` throws — we need a runtime fallback to satisfy the
// type checker (after `notFound()` the `sektor` variable should be
// narrowed to non-null, but TS doesn't know that). The defensive
// `SektorDetailEmpty` is reachable only if Next.js's not-found
// boundary ever fails to catch the throw.
void SektorDetailEmpty;
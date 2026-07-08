import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SentimentBadge } from "@/components/SentimentBadge";
import { EmptyState } from "@/components/EmptyState";
import { HeadlineSentimentBadge } from "@/components/stock/HeadlineSentimentBadge";
import { AggregateSummary } from "@/components/stock/AggregateSummary";
import { ArticlesByMediaWidget } from "@/components/stock/ArticlesByMediaWidget";
import { SentimentSparkline7d } from "@/components/stock/SentimentSparkline7d";
import { PriceChart30d } from "@/components/stock/PriceChart30d";
import { KeyMetrics } from "@/components/stock/KeyMetrics";
import { NewsTimeline } from "@/components/stock/NewsTimeline";
import { SimilarStocks } from "@/components/stock/SimilarStocks";
import { HeadlineDetailProvider } from "@/components/stock/HeadlineDetailProvider";
import { getStockByKode, HUE_GRADIENT, stocks } from "@/lib/mock/stocks";
import { getRecapsForStock, TODAY_ISO } from "@/lib/mock/recaps";
import { getSentiment7d } from "@/lib/mock/sentiment-7d";
import { formatTanggalSingkat } from "@/lib/util/formatDate";

interface PageProps {
  params: { kode: string };
}

export function generateStaticParams(): { kode: string }[] {
  return stocks.map((s) => ({ kode: s.kode }));
}

export function generateMetadata({ params }: PageProps) {
  const stock = getStockByKode(params.kode);
  if (!stock) return { title: "Saham tidak ditemukan · Rangkuman" };
  const recaps = getRecapsForStock(stock.kode);
  const today = recaps[0];
  const articleCount = today?.jumlahBerita ?? 0;
  const mediaCount = today?.sumber.length ?? 0;
  const title = `${stock.kode} — ${stock.nama} · Rangkuman`;
  const desc = `${stock.kode} dividen interim Rp 215/saham, yield ${stock.dividendYield.toFixed(1)}%. ${articleCount} artikel dari ${mediaCount} media.`;
  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `https://rangkuman.news/stock/${stock.kode}`,
      type: "article",
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: stock.kode }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: ["/og-default.png"],
    },
  };
}

export default function StockDetailPage({ params }: PageProps) {
  const kode = params.kode.toUpperCase();
  const stock = getStockByKode(kode);
  if (!stock) notFound();

  const allRecaps = getRecapsForStock(kode);
  const recap = allRecaps[0];
  const positive = stock.changePercent >= 0;
  const heroGradient = HUE_GRADIENT[stock.hue];

  return (
    <>
      <Navbar />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6">
        {/* Owns the single deep-linked headline fetch: reads ?id= and
            calls loadHeadlineById once, sharing the result (e.g. the
            hero sentiment badge) via context. Wraps the server-rendered
            body so consumers nested inside still receive it. */}
        <HeadlineDetailProvider>
        {/* FIX 4: Sr-only H1 for SEO */}
        <h1 className="sr-only">
          Rangkuman &mdash; Saham {stock.nama} ({stock.kode})
        </h1>

        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-[12px] text-text-muted transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden />
          Kembali ke Beranda
        </Link>

        {/* Hero / price block */}
        <section
          className={`relative mb-6 overflow-hidden rounded-lg border border-border bg-gradient-to-br ${heroGradient}`}
        >
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
            aria-hidden
          />

          <div className="relative p-5 sm:p-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded border border-border bg-bg-primary/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-primary backdrop-blur-sm">
                {stock.sektor}
              </span>
              {recap && <HeadlineSentimentBadge fallback={recap.sentimen} />}
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-mono text-[56px] font-bold leading-none tracking-tighter text-text-primary sm:text-[72px]">
                  {stock.kode}
                </h2>
                <p className="mt-1 text-[14px] text-text-secondary">{stock.nama}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[40px] font-bold leading-none tracking-tight text-text-primary num-tabular sm:text-[48px]">
                  {stock.price.toLocaleString("id-ID")}
                </p>
                <p
                  className={
                    positive
                      ? "mt-1 font-mono text-[16px] font-semibold text-bullish num-tabular"
                      : "mt-1 font-mono text-[16px] font-semibold text-bearish num-tabular"
                  }
                >
                  {positive ? "▲ +" : "▼ "}
                  {Math.abs(stock.changePercent).toFixed(2)}% hari ini
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Deep-linked headline detail is fetched once by
            <HeadlineDetailProvider> above and consumed via
            useHeadlineDetail() (currently by the hero sentiment badge).
            A dedicated "Headline" detail section can be added here later
            as another consumer — no extra fetch needed. */}

        {!recap ? (
          <EmptyState
            title={`Belum ada recap untuk ${stock.kode}`}
            description="Saham ini belum diberitakan pada tanggal terkini."
            suggestion="Coba cek tab '7 Hari Terakhir' di beranda."
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            {/* Main column */}
            <div className="min-w-0 space-y-6">
              {/* Aggregate summary */}
              <AggregateSummary recap={recap} />

              {/* Price chart 30 days */}
              <PriceChart30d
                kode={kode}
                currentPrice={stock.price}
                change30dPercent={stock.change30dPercent}
                ath={stock.ath}
              />

              {/* Key metrics: Market Cap, P/E, Volume, etc. */}
              <KeyMetrics stock={stock} />

              {/* News timeline */}
              <NewsTimeline todayIso={TODAY_ISO} />

              {/* Sentiment 7-day mini bar chart */}
              <SentimentSparkline7d
                data={getSentiment7d(kode)}
                todayIso={TODAY_ISO}
              />

              {/* Articles grouped by media — data-driven via
                  useListStory + the deep-linked headline's ID. */}
              <ArticlesByMediaWidget />
            </div>

            {/* Right rail */}
            <aside className="space-y-5">
              {/* Recap sebelumnya */}
              {allRecaps.length > 1 && (
                <section
                  className="overflow-hidden rounded-lg border border-border bg-bg-secondary"
                  aria-label="Recap sebelumnya"
                >
                  <header className="border-b border-border bg-bg-tertiary px-3 py-2">
                    <h3 className="label">Arsip singkat</h3>
                  </header>
                  <ul className="divide-y divide-border">
                    {allRecaps.slice(1).map((r) => (
                      <li key={r.id} className="px-3 py-2.5">
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className="font-mono text-[10.5px] font-semibold uppercase tracking-widest text-text-muted num-tabular">
                            {formatTanggalSingkat(r.tanggal)}
                          </span>
                          <SentimentBadge sentiment={r.sentimen} size="sm" />
                        </div>
                        <p className="line-clamp-2 text-[12px] leading-snug text-text-secondary">
                          {r.ringkasan}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Quick links */}
              <section className="overflow-hidden rounded-lg border border-border bg-bg-secondary">
                <header className="border-b border-border bg-bg-tertiary px-3 py-2">
                  <h3 className="label">Tentang {stock.kode}</h3>
                </header>
                <dl className="divide-y divide-border text-[12.5px]">
                  <div className="flex justify-between gap-2 px-3 py-2">
                    <dt className="text-text-muted">Sektor</dt>
                    <dd className="text-right text-text-primary">{stock.sektor}</dd>
                  </div>
                  <div className="flex justify-between gap-2 px-3 py-2">
                    <dt className="text-text-muted">Harga</dt>
                    <dd className="font-mono text-text-primary num-tabular">
                      {stock.price.toLocaleString("id-ID")}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2 px-3 py-2">
                    <dt className="text-text-muted">Perubahan</dt>
                    <dd
                      className={
                        positive
                          ? "font-mono font-semibold text-bullish num-tabular"
                          : "font-mono font-semibold text-bearish num-tabular"
                      }
                    >
                      {positive ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2 px-3 py-2">
                    <dt className="text-text-muted">Coverage</dt>
                    <dd className="text-text-primary">
                      {recap.sumber.length} media, {recap.jumlahBerita} artikel
                    </dd>
                  </div>
                </dl>
              </section>

              {/* Saham Serupa — stocks in the same sector */}
              <SimilarStocks
                excludeKode={stock.kode}
                sektor={stock.sektor}
                limit={3}
              />
            </aside>
          </div>
        )}
        </HeadlineDetailProvider>
      </main>
      <Footer />
    </>
  );
}

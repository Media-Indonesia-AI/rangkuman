import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SentimentBadge } from "@/components/SentimentBadge";
import { HeadlineSentimentBadge } from "@/components/HeadlineSentimentBadge";
import { SourceBar } from "@/components/SourceBar";
import { EmptyState } from "@/components/EmptyState";
import { getStockByKode, HUE_GRADIENT, stocks } from "@/lib/mock/stocks";
import { getRecapsForStock, TODAY_ISO } from "@/lib/mock/recaps";
import { getSentiment7d } from "@/lib/mock/sentiment-7d";
import { SentimentSparkline7d } from "@/components/SentimentSparkline7d";
import { PriceChart30d } from "@/components/PriceChart30d";
import { KeyMetrics } from "@/components/KeyMetrics";
import { NewsTimeline7d } from "@/components/NewsTimeline7d";
import { SimilarStocks } from "@/components/SimilarStocks";
import { groupArticlesByMedia } from "@/lib/mock/articles";
import { formatTanggalIndonesia, formatTanggalSingkat } from "@/lib/util/formatDate";
import { initialsOf } from "@/lib/util/formatMedia";
import { HeadlineDetailProvider } from "@/components/HeadlineDetailProvider";

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

const SentimenIcon = {
  positif: TrendingUp,
  netral: Minus,
  negatif: TrendingDown,
} as const;

export default function StockDetailPage({ params }: PageProps) {
  const kode = params.kode.toUpperCase();
  const stock = getStockByKode(kode);
  if (!stock) notFound();

  const allRecaps = getRecapsForStock(kode);
  const recap = allRecaps[0];
  const groups = recap ? groupArticlesByMedia(recap.id) : [];
  const positive = stock.changePercent >= 0;
  const heroGradient = HUE_GRADIENT[stock.hue];
  const Icon = recap ? SentimenIcon[recap.sentimen] : Minus;

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
              <section
                className="overflow-hidden rounded-lg border border-border bg-bg-secondary"
                aria-label="Ringkasan agregat"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-bg-tertiary px-4 py-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Icon className={`h-3.5 w-3.5 ${
                      recap.sentimen === "positif" ? "text-bullish" :
                      recap.sentimen === "negatif" ? "text-bearish" : "text-mixed"
                    }`} aria-hidden />
                    <span className="font-mono text-[10.5px] font-semibold uppercase tracking-widest text-text-primary">
                      Ringkasan AI
                    </span>
                    <span className="font-mono text-[10.5px] text-text-muted num-tabular">
                      · {formatTanggalIndonesia(recap.tanggal)}
                    </span>
                  </div>
                  <span className="font-mono text-[10.5px] font-semibold text-text-muted num-tabular">
                    {recap.jumlahBerita} artikel · {recap.sumber.length} media
                  </span>
                </div>

                <div className="p-4 sm:p-5">
                  <p className="text-[15px] leading-[1.65] text-text-primary">
                    {recap.ringkasan}
                  </p>

                  <div className="mt-5 border-t border-border pt-4">
                    <p className="label mb-2.5">Disebut dalam</p>
                    <SourceBar sumber={recap.sumber} />
                  </div>
                </div>
              </section>

              {/* Price chart 30 days */}
              <PriceChart30d
                kode={kode}
                currentPrice={stock.price}
                change30dPercent={stock.change30dPercent}
                ath={stock.ath}
              />

              {/* Key metrics: Market Cap, P/E, Volume, etc. */}
              <KeyMetrics stock={stock} />

              {/* News timeline 7 days */}
              <NewsTimeline7d kode={kode} todayIso={TODAY_ISO} />

              {/* Sentiment 7-day mini bar chart */}
              <SentimentSparkline7d
                data={getSentiment7d(kode)}
                todayIso={TODAY_ISO}
              />

              {/* Articles grouped by media */}
              <section aria-label="Berita per media">
                <header className="mb-4 flex items-end justify-between border-b border-border-strong pb-2">
                  <h2 className="text-[18px] font-bold tracking-tight text-text-primary">
                    Diliput media
                  </h2>
                  <span className="font-mono text-[10.5px] font-semibold text-text-muted num-tabular">
                    {groups.length} media
                  </span>
                </header>

                <div className="space-y-5">
                  {groups.map(({ media, items }) => (
                    <div
                      key={media}
                      className="overflow-hidden rounded-lg border border-border bg-bg-secondary"
                    >
                      <header className="flex items-center gap-3 border-b border-border bg-bg-tertiary px-3 py-2">
                        <span
                          aria-hidden
                          className="inline-flex h-6 w-6 items-center justify-center rounded border border-border bg-bg-card font-mono text-[9.5px] font-semibold uppercase text-text-secondary"
                        >
                          {initialsOf(media)}
                        </span>
                        <h3 className="text-[13px] font-semibold text-text-primary">
                          {media}
                        </h3>
                        <span className="font-mono text-[10.5px] font-semibold text-brand num-tabular">
                          ×{items.length}
                        </span>
                      </header>
                      <ul className="divide-y divide-border">
                        {items.map((a) => (
                          <li key={a.id}>
                            <a
                              href={a.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block px-4 py-3 transition-colors hover:bg-bg-tertiary"
                            >
                              <h4 className="text-[14px] font-semibold leading-snug text-text-primary group-hover:text-brand">
                                {a.judulAsli}
                                <ArrowUpRight
                                  className="ml-1 inline-block h-3 w-3 text-text-muted opacity-0 transition-opacity group-hover:opacity-100"
                                  aria-hidden
                                />
                              </h4>
                              <p className="mt-1 text-[12.5px] leading-relaxed text-text-secondary">
                                {a.inti}
                              </p>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
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

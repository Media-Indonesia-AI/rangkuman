import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArsipSingkat } from "@/components/stock/ArsipSingkat";
import { HeadlineSentimentBadge } from "@/components/stock/HeadlineSentimentBadge";
import { AggregateSummary } from "@/components/stock/AggregateSummary";
import { ArticlesByMediaWidget } from "@/components/stock/ArticlesByMediaWidget";
import { SentimentSparkline } from "@/components/stock/SentimentSparkline";
import { PriceChart30d } from "@/components/stock/PriceChart30d";
import { KeyMetrics } from "@/components/stock/KeyMetrics";
import { NewsTimeline } from "@/components/stock/NewsTimeline";
import { SimilarStocks } from "@/components/stock/SimilarStocks";
import { HeadlineDetailProvider } from "@/components/stock/HeadlineDetailProvider";
import { HeadlineStoriesProvider } from "@/components/stock/HeadlineStoriesProvider";

interface PageProps {
  params: { kode: string };
}

export default function StockDetailPage({ params }: PageProps) {
  const kode = params.kode.toUpperCase();

  return (
    <>
      <Navbar />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6">
        {/* Owns the single deep-linked headline fetch: reads ?id= and
            calls loadHeadlineById once, sharing the result (e.g. the
            hero sentiment badge) via context. Wraps the server-rendered
            body so consumers nested inside still receive it. */}
        <HeadlineDetailProvider>
        {/* Single headline-scoped /stories fetch shared by
            SentimentSparkline, NewsTimeline, ArticlesByMediaWidget,
            and AggregateSummary. Without this, each widget would
            drive its own useListStory and the page would mount
            four hooks with byte-identical arguments. */}
        <HeadlineStoriesProvider>
        {/* FIX 4: Sr-only H1 for SEO */}
        <h1 className="sr-only">
          Rangkuman &mdash; Saham {'N/A'} ({params.kode})
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
          className={`relative mb-6 overflow-hidden rounded-lg border border-border bg-gradient-to-br from-bg-secondary`}
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
                {'N/A'}
              </span>
              <HeadlineSentimentBadge />
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-mono text-[56px] font-bold leading-none tracking-tighter text-text-primary sm:text-[72px]">
                  {params.kode}
                </h2>
                <p className="mt-1 text-[14px] text-text-secondary">{'N/A'}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[40px] font-bold leading-none tracking-tight text-text-primary num-tabular sm:text-[48px]">
                  {'N/A'}
                </p>
                <p
                  className={
                    "mt-1 font-mono text-[16px] font-semibold text-text-primary num-tabular"
                  }
                >
                  {'—'}
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

          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            {/* Main column */}
            <div className="min-w-0 space-y-6">
              {/* Aggregate summary */}
              <AggregateSummary />

              {/* Price chart 30 days */}
              <PriceChart30d
                kode={kode}
                currentPrice={0}
                change30dPercent={0}
                ath={0}
              />

              {/* Key metrics: Market Cap, P/E, Volume, etc. */}
              <KeyMetrics stock={null} />

              {/* News timeline */}
              <NewsTimeline todayIso={''} />

              {/* Sentiment trail — reads from the shared
                  <HeadlineStoriesProvider> (mounted above). */}
              <SentimentSparkline todayIso={''} />

              {/* Articles grouped by media — data-driven via the
                  shared headline-scoped stories fetched once by
                  <HeadlineStoriesProvider>. */}
              <ArticlesByMediaWidget />
            </div>

            {/* Right rail */}
            <aside className="space-y-5">
              {/* Live headlines for this ticker, falling back to the
                  older mock recaps when the fetch returns empty. Self-
                  contained in <ArsipSingkat> so it shares the same data
                  conventions as LatestHeadlines. */}
              <ArsipSingkat kode={kode} />

              {/* Quick links */}
              <section className="overflow-hidden rounded-lg border border-border bg-bg-secondary">
                <header className="border-b border-border bg-bg-tertiary px-3 py-2">
                  <h3 className="label">Tentang {params.kode}</h3>
                </header>
                <dl className="divide-y divide-border text-[12.5px]">
                  <div className="flex justify-between gap-2 px-3 py-2">
                    <dt className="text-text-muted">Sektor</dt>
                    <dd className="text-right text-text-primary">{'N/A'}</dd>
                  </div>
                  <div className="flex justify-between gap-2 px-3 py-2">
                    <dt className="text-text-muted">Harga</dt>
                    <dd className="font-mono text-text-primary num-tabular">
                      {'N/A'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2 px-3 py-2">
                    <dt className="text-text-muted">Perubahan</dt>
                    <dd className="font-mono font-semibold text-text-primary num-tabular">
                      {'N/A'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2 px-3 py-2">
                    <dt className="text-text-muted">Coverage</dt>
                    <dd className="text-text-primary">
                      {0} media, {0} artikel
                    </dd>
                  </div>
                </dl>
              </section>

              {/* Saham Serupa — stocks in the same sector */}
              <SimilarStocks
                excludeKode={params.kode}
                sektor={''}
                limit={3}
              />
            </aside>
          </div>
        </HeadlineStoriesProvider>
        </HeadlineDetailProvider>
      </main>
      <Footer />
    </>
  );
}
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StockHero } from "@/components/stock/StockHero";
import { StockAboutPanel } from "@/components/stock/StockAboutPanel";
import { SimilarStocks } from "@/components/stock/SimilarStocks";
import { AggregateSummary } from "@/components/stock/AggregateSummary";
import { ArticlesByMediaWidget } from "@/components/stock/ArticlesByMediaWidget";
import { SentimentSparkline } from "@/components/stock/SentimentSparkline";
import { PriceChart30d } from "@/components/stock/PriceChart30d";
import { KeyMetrics } from "@/components/stock/KeyMetrics";
import { NewsTimeline } from "@/components/stock/NewsTimeline";
import { Last7DaysHeadlinesProvider } from "@/components/stock/Last7DaysHeadlinesProvider";
import { HeadlineStoriesProvider } from "@/components/stock/HeadlineStoriesProvider";
import { EmitenStories } from "@/components/saham";
import { useTickerInformation } from "@/lib/hooks/useTickerInformation";

interface PageProps {
  params: { kode: string, recapDate?: string };
}

export default function StockDetailPage({ params }: PageProps) {
  const kode = params.kode.toUpperCase();
  // Normalize recapDate — the URL segment may carry a full ISO
  // timestamp (e.g. "2026-08-13T09:15:33.426Z") when visitors
  // reach the page through a ShareButton URL or any other
  // caller that pipes `todayIsoDate()` through. Downstream
  // consumers (DatePicker, the `loadTickerInformation` cache
  // key, share URLs) expect the calendar-day form `YYYY-MM-DD`,
  // so trim any time portion here. The regex drops a fully-
  // malformed value (empty string, garbled segment) back to
  // `undefined`, and `useTickerInformation` /
  // `<AggregateSummary recapDate={undefined}>` fall through to
  // today via their existing `?? todayIsoDate()` guards.
  const recapDate = params.recapDate?.match(/^\d{4}-\d{2}-\d{2}/)?.[0];

  // Live ticker info — drives the hero chip / price / change and the
  // StockAboutPanel info rows. Hook resets state on `kode` change so
  // navigating from /stock/ANTM to /stock/BBCA never flashes the old
  // ticker's data. `isLoading` is passed through to <SimilarStocks>
  // so it shows a shimmer skeleton instead of flashing mock data
  // while the API response is in flight.
  const { data: tickerInfo, isLoading: tickerLoading } =
    useTickerInformation(kode, recapDate);

  const priceText = tickerInfo
    ? tickerInfo.price.toLocaleString("id-ID")
    : null;

  // Sync the browser tab title with the current ticker so the
  // address bar / tab strip reflects the page the visitor is on.
  // Mirrors the same pattern in `/sorotan/detail/[id]` — the
  // page is a "use client" component, so there's no server-side
  // `generateMetadata` to set the title; without this effect the
  // tab would stay on the global layout default ("Rangkuman")
  // while the body shows `ANTM` / `BBCA` / etc. The format
  // `Rangkuman - ${ticker}` matches the user's request. Cleanup
  // resets the tab to "Rangkuman" on unmount so navigating back
  // to the layout default doesn't leave a stale ticker code in
  // the tab.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title = `Rangkuman - ${kode}`;
    return () => {
      if (typeof document === "undefined") return;
      document.title = "Rangkuman";
    };
  }, [kode]);

  return (
    <>
      <Navbar />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6">
        {/* Single headline-scoped /stories fetch shared by
            SentimentSparkline, NewsTimeline, ArticlesByMediaWidget,
            and AggregateSummary. */}
        <HeadlineStoriesProvider>
        {/* FIX 4: Sr-only H1 for SEO */}
        <h1 className="sr-only">
          Rangkuman &mdash; Saham {'N/A'} ({kode})
        </h1>

        <Link
          href="/saham"
          className="mb-4 inline-flex items-center gap-1.5 text-[12px] text-text-muted transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden />
          Kembali ke Saham
        </Link>

        {/* Hero / price block — chip / price / change wired to live
            ticker info; company name isn't on the endpoint so it
            stays as the widget's default "N/A" placeholder. */}
        <StockHero
          kode={kode}
          chip={tickerInfo?.sector_name ?? "N/A"}
          price={priceText}
          pctChange={tickerInfo?.pct_change ?? null}
          companyName={tickerInfo?.company_name ?? null}
          isLoading={tickerLoading}
        />

          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            {/* Main column */}
            <div className="min-w-0 space-y-6">
              {/* Aggregate summary */}
              <AggregateSummary
                kode={kode}
                description={tickerInfo?.description ?? null}
                articles={tickerInfo?.articles ?? []}
                recapDate={recapDate}
                isLoading={tickerLoading}
              />

              {/* Story — multi-date stories for this ticker */}
              <EmitenStories ticker={kode} variant="highlight" />

              {/* Price chart 30 days */}
              <PriceChart30d kode={kode} />

              {/* Key metrics: Market Cap, P/E, Volume, etc. */}
              <KeyMetrics kode={kode} />

              {/* News timeline + sentiment trail — both read from the
                  shared <Last7DaysHeadlinesProvider>, so the underlying
                  `headlines/last-7-days` request fires exactly once
                  even though two widgets render it. The provider owns
                  the ticker and the "today" marker — children are
                  prop-less. */}
              <Last7DaysHeadlinesProvider kode={kode}>
                <NewsTimeline />
                <SentimentSparkline />
              </Last7DaysHeadlinesProvider>

              {/* Articles grouped by media — data-driven via the
                  shared headline-scoped stories fetched once by
                  <HeadlineStoriesProvider>. */}
              <ArticlesByMediaWidget articles={tickerInfo?.articles ?? []} />
            </div>

            {/* Right rail */}
            <aside className="space-y-5">
              {/* Live headlines for this ticker, falling back to the
                  older mock recaps when the fetch returns empty. Self-
                  contained in <ArsipSingkat> so it shares the same data
                  conventions as LatestHeadlines. */}
              {/* <ArsipSingkat kode={kode} /> */}

              {/* "Tentang {kode}" info card. Sektor / Harga / Perubahan are
                  wired to the live ticker info; Coverage stays as
                  the widget's default "0 media, 0 artikel"
                  placeholder until the headline-scoped fetch exposes
                  article counts. */}
              <StockAboutPanel
                kode={kode}
                sektor={tickerInfo?.sector_name ?? null}
                price={priceText}
                pctChange={tickerInfo?.pct_change ?? null}
                articles={tickerInfo?.articles ?? null}
              />

              {/* "Saham Serupa" peer list as its own card — when
                  `relatedStocks` is provided, the API list is used
                  directly (in backend order); otherwise the mock-
                  based sector filter is the fallback. `loading`
                  gates the shimmer skeleton so the widget doesn't
                  briefly fall back to mock data while the upstream
                  fetch is in flight. */}
              <SimilarStocks
                sektor={tickerInfo?.sector_name ?? ""}
                relatedStocks={tickerInfo?.related_stocks ?? undefined}
                loading={tickerLoading}
              />
            </aside>
          </div>
        </HeadlineStoriesProvider>
      </main>
      <Footer />
    </>
  );
}
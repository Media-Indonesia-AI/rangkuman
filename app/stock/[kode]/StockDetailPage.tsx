"use client";

import { useRouter } from "next/navigation";
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
import { HeadlineStoriesProvider } from "@/components/stock/HeadlineStoriesProvider";
import { StockLoginDialog } from "@/components/stock/StockLoginDialog";
import { EmitenStories } from "@/components/saham";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { useTickerInformation } from "@/lib/hooks/useTickerInformation";

interface PageProps {
  params: { kode: string };
}

export default function StockDetailPage({ params }: PageProps) {
  const router = useRouter();
  const kode = params.kode.toUpperCase();

  // Auth gate — show the login prompt dialog on first paint when the
  // visitor is anonymous. `useCurrentUser()` is `undefined` during
  // localStorage hydration, `null` when logged out, and a `MockUser`
  // when authenticated. During the `undefined` window we don't render
  // the dialog (avoids a flash for already-logged-in users). Closing
  // the dialog (X / Escape / backdrop / "Lanjut tanpa login") sends
  // the user to /saham — there is no "stay on this page anonymously"
  // path because the page's data fetches are auth-gated and would
  // just keep returning empty.
  const user = useCurrentUser();
  const showLoginDialog = user === null;
  const handleDialogClose = () => router.push("/saham");

  // Live ticker info — drives the hero chip / price / change and the
  // StockAboutPanel info rows. Hook resets state on `kode` change so
  // navigating from /stock/ANTM to /stock/BBCA never flashes the old
  // ticker's data. `isLoading` is passed through to <SimilarStocks>
  // so it shows a shimmer skeleton instead of flashing mock data
  // while the API response is in flight.
  const { data: tickerInfo, isLoading: tickerLoading } =
    useTickerInformation(kode);

  const priceText = tickerInfo
    ? tickerInfo.price.toLocaleString("id-ID")
    : null;

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
        />

          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            {/* Main column */}
            <div className="min-w-0 space-y-6">
              {/* Aggregate summary */}
              <AggregateSummary
                kode={kode}
                description={tickerInfo?.description ?? null}
                articles={tickerInfo?.articles ?? []}
              />

              {/* Story — multi-date stories for this ticker */}
              <EmitenStories ticker={kode} variant="highlight" />

              {/* Price chart 30 days */}
              <PriceChart30d kode={kode} />

              {/* Key metrics: Market Cap, P/E, Volume, etc. */}
              <KeyMetrics kode={kode} />

              {/* News timeline */}
              <NewsTimeline kode={kode} todayIso={''} />

              {/* Sentiment trail — last-7-days headlines for this ticker. */}
              <SentimentSparkline kode={kode} todayIso={''} />

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

      {showLoginDialog && <StockLoginDialog onClose={handleDialogClose} />}
    </>
  );
}
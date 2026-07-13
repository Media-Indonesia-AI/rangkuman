import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Newspaper, TrendingUp, FileText, Building2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SentimentBadge } from "@/components/SentimentBadge";
import { getSektorBySlug, sektorList, getTopStocksInSektor, type SektorHue } from "@/lib/mock/sectors";
import { getRecapsForStock, TODAY_ISO } from "@/lib/mock/recaps";
import { cn } from "@/lib/utils";
import type { Sentimen } from "@/lib/mock/recaps";

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return sektorList.map((s) => ({ slug: s.slug }));
}

const hueText: Record<SektorHue, string> = {
  amber: "text-amber-500",
  sky: "text-sky-500",
  rose: "text-rose-500",
  violet: "text-violet-500",
  emerald: "text-emerald-500",
  slate: "text-slate-400",
};

const hueBg: Record<SektorHue, string> = {
  amber: "bg-amber-500/20",
  sky: "bg-sky-500/20",
  rose: "bg-rose-500/20",
  violet: "bg-violet-500/20",
  emerald: "bg-emerald-500/20",
  slate: "bg-slate-500/20",
};

const hueBorder: Record<SektorHue, string> = {
  amber: "border-amber-500/30",
  sky: "border-sky-500/30",
  rose: "border-rose-500/30",
  violet: "border-violet-500/30",
  emerald: "border-emerald-500/30",
  slate: "border-slate-500/30",
};

const sentimentConfig: Record<Sentimen, { label: string; text: string }> = {
  positif: { label: "Positif", text: "text-bullish" },
  netral: { label: "Netral", text: "text-mixed" },
  negatif: { label: "Negatif", text: "text-bearish" },
};

export function generateMetadata({ params }: PageProps) {
  const sektor = getSektorBySlug(params.slug);
  if (!sektor) return { title: "Sektor tidak ditemukan · Rangkuman" };
  const changeStr = `${sektor.avgChange >= 0 ? "+" : ""}${sektor.avgChange.toFixed(2)}%`;
  const topStocks = [...sektor.stocks]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 4)
    .map((s) => s.kode);
  const title = `Sektor ${sektor.name} ${changeStr} · Rangkuman`;
  const desc = `${topStocks.join(", ")} — ${sektor.stocks.length} emiten ${sektor.name.toLowerCase()}.`;
  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `https://rangkuman.news/sektor/${sektor.slug}`,
      siteName: "Rangkuman",
      locale: "id_ID",
      type: "website",
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: `Sektor ${sektor.name}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: ["/og-default.png"],
    },
  };
}

export default function SektorDetailPage({ params }: PageProps) {
  const sektor = getSektorBySlug(params.slug);
  if (!sektor) notFound();

  const topStocks = getTopStocksInSektor(sektor, 5);

  // Aggregate news for stocks in this sector
  const news = sektor.stocks
    .flatMap((s) => {
      const recaps = getRecapsForStock(s.kode);
      return recaps.map((r) => ({ ...r, stock: s }));
    })
    .sort((a, b) => b.jumlahBerita - a.jumlahBerita)
    .slice(0, 8);

  return (
    <>
      <Navbar />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5">
        {/* FIX 4: Sr-only H1 for SEO */}
        <h1 className="sr-only">
          Rangkuman &mdash; Sektor {sektor.name}
        </h1>

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
                  · {sektor.stocks.length} emiten
                </span>
              </div>
              <h2 className="text-[24px] font-bold leading-tight tracking-tight text-text-primary sm:text-[30px]">
                {sektor.name}
              </h2>
              <p className="mt-1 max-w-2xl text-[12.5px] leading-[1.55] text-text-secondary">
                {sektor.description}
              </p>
            </div>

            {/* Mini stats */}
            <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:grid-cols-2">
              <div>
                <p className="label">Rata-rata</p>
                <p
                  className={cn(
                    "mt-0.5 font-mono text-[18px] font-bold leading-none num-tabular",
                    sektor.avgChange >= 0 ? "text-bullish" : "text-bearish",
                  )}
                >
                  {sektor.avgChange >= 0 ? "+" : ""}
                  {sektor.avgChange.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="label">Sentimen</p>
                <p
                  className={cn(
                    "mt-0.5 text-[16px] font-bold leading-none",
                    sentimentConfig[sektor.sentiment].text,
                  )}
                >
                  {sentimentConfig[sektor.sentiment].label}
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
              const recap = getRecapsForStock(stock.kode).find(
                (r) => r.tanggal === TODAY_ISO,
              );
              const positive = stock.changePercent >= 0;
              return (
                <Link
                  key={stock.kode}
                  href={`/stock/${stock.kode}`}
                  className="group flex flex-col overflow-hidden rounded-lg border border-border bg-bg-secondary transition-all hover:border-border-strong hover:shadow-card-hover"
                >
                  {/* Top rank strip */}
                  <div className="flex items-center justify-between border-b border-border bg-bg-tertiary px-3 py-1.5">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-faint num-tabular">
                      #{String(idx + 1).padStart(2, "0")}
                    </span>
                    {recap && (
                      <SentimentBadge
                        sentiment={recap.sentimen}
                        size="sm"
                        showLabel={false}
                      />
                    )}
                  </div>

                  <div className="p-3.5">
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-mono text-[20px] font-bold leading-none tracking-tighter text-text-primary group-hover:text-brand">
                        {stock.kode}
                      </h3>
                      <span className="truncate text-[11px] text-text-muted">
                        {stock.nama}
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-mono text-[16px] font-bold leading-none text-text-primary num-tabular">
                        {stock.price.toLocaleString("id-ID")}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-[12px] font-semibold num-tabular",
                          positive ? "text-bullish" : "text-bearish",
                        )}
                      >
                        {positive ? "▲ +" : "▼ "}
                        {Math.abs(stock.changePercent).toFixed(2)}%
                      </span>
                    </div>

                    {recap && (
                      <p className="mt-2 line-clamp-2 text-[11.5px] leading-snug text-text-secondary">
                        {recap.ringkasan}
                      </p>
                    )}

                    <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2">
                      {recap ? (
                        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-text-muted">
                          <FileText className="h-2.5 w-2.5" aria-hidden />
                          {recap.jumlahBerita} artikel · {recap.sumber.length} media
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] text-text-faint">
                          Belum ada recap
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
            })}
          </div>
        </section>

        {/* News in this sector */}
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
              {news.length} cerita · agregat dari 6+ media
            </span>
          </header>

          {news.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-bg-secondary/50 px-6 py-10 text-center">
              <p className="text-[13px] text-text-muted">
                Belum ada berita untuk emiten di sektor ini.
              </p>
            </div>
          ) : (
            <ol className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-bg-secondary">
              {news.map((r, idx) => {
                const positive = r.stock.changePercent >= 0;
                return (
                  <li key={r.id}>
                    <Link
                      href={`/stock/${r.sahamKode}`}
                      className="group grid grid-cols-[36px_1fr_auto] items-center gap-2 px-3 py-2.5 transition-colors hover:bg-bg-tertiary/60 sm:grid-cols-[40px_1fr_140px_120px] sm:gap-3 sm:px-4"
                    >
                      <span className="font-mono text-[11px] font-semibold text-text-faint num-tabular">
                        #{String(idx + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-mono text-[12.5px] font-semibold text-text-primary group-hover:text-brand">
                            {r.sahamKode}
                          </span>
                          <span className="truncate text-[10.5px] text-text-muted">
                            {r.stock.nama}
                          </span>
                        </div>
                        <p className="line-clamp-1 text-[11.5px] leading-snug text-text-secondary sm:hidden">
                          {r.ringkasan}
                        </p>
                        <p className="hidden line-clamp-1 text-[12px] leading-snug text-text-primary sm:block">
                          {r.ringkasan}
                        </p>
                      </div>
                      <div className="hidden items-center gap-1.5 sm:flex">
                        <SentimentBadge
                          sentiment={r.sentimen}
                          size="sm"
                          showLabel={false}
                        />
                        <span className="font-mono text-[10.5px] text-text-muted">
                          {r.sumber.length} media
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-1.5">
                        <span
                          className={cn(
                            "font-mono text-[12px] font-semibold num-tabular",
                            positive ? "text-bullish" : "text-bearish",
                          )}
                        >
                          {positive ? "+" : ""}
                          {r.stock.changePercent.toFixed(2)}%
                        </span>
                        <span className="font-mono text-[10px] text-text-muted sm:hidden">
                          {r.jumlahBerita}art
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

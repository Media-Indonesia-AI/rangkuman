import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ArrowRight, Filter } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TopTicker } from "@/components/TopTicker";
import { StockStoryCard } from "@/components/StockStoryCard";
import {
  STOCK_STORIES,
  getStockStoryStatusMeta,
  type StoryStatus,
} from "@/lib/mock/stock-stories";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Stock Story · Rangkuman",
  description:
    "Cerita perkembangan emiten pilihan dalam jangka panjang: akuisisi, transformasi digital, ekspansi, dan lain-lain.",
  openGraph: {
    title: "Stock Story · Rangkuman",
    description: "Cerita perkembangan emiten dalam jangka panjang.",
    url: "https://rangkuman.news/saham/story/",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
  },
};

const STATUS_FILTERS: { value: StoryStatus | "all"; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "ongoing", label: "Sedang berlangsung" },
  { value: "developing", label: "Berkembang" },
  { value: "paused", label: "Tertunda" },
  { value: "resolved", label: "Selesai" },
];

export default function AllStoriesPage() {
  const stories = [...STOCK_STORIES];
  const featured = stories[0]; // First story = featured (largest)
  const rest = stories.slice(1);

  // Count by status
  const countByStatus: Record<string, number> = { all: stories.length };
  for (const s of stories) {
    countByStatus[s.status] = (countByStatus[s.status] || 0) + 1;
  }

  return (
    <>
      <TopTicker />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-4xl px-4 pb-16 pt-3 sm:px-6 sm:pt-5 lg:max-w-6xl lg:px-8">
        {/* Sr-only H1 for SEO */}
        <h1 className="sr-only">Stock Story — Cerita Panjang Emiten</h1>

        {/* Back link */}
        <div className="mb-3">
          <Link
            href="/saham"
            className="inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-widest text-text-muted transition-colors hover:text-text-primary"
          >
            <ChevronLeft className="h-3 w-3" aria-hidden />
            Kembali ke /saham/
          </Link>
        </div>

        {/* Page header */}
        <section className="mb-6">
          <div className="mb-2 flex items-end justify-between border-b-2 border-text-primary pb-1.5">
            <div>
              <h2 className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
                <span aria-hidden>📈</span>
                <span>Stock Story</span>
                <span className="ml-1 inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/15 px-1.5 py-0.5 font-mono text-[9px] tracking-widest text-brand">
                  {stories.length} CERITA
                </span>
              </h2>
              <p className="mt-1 text-[14px] leading-snug text-text-secondary sm:text-[15px]">
                Narasi perkembangan emiten dalam jangka panjang — bukan berita harian, tapi konteks yang bikin saham bergerak.
              </p>
            </div>
            <span className="hidden font-mono text-[10px] text-text-faint sm:inline">
              Update tiap minggu
            </span>
          </div>

          {/* Filter chips by status — visual only (no client filtering for static export) */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <Filter className="h-3 w-3 text-text-faint" aria-hidden />
            <span className="font-mono text-[9.5px] uppercase tracking-widest text-text-faint">
              Filter
            </span>
            {STATUS_FILTERS.map((filter) => {
              const isActive = filter.value === "all";
              return (
                <span
                  key={filter.value}
                  className={cn(
                    "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider",
                    isActive
                      ? "border-brand-line bg-brand-soft text-brand"
                      : "border-border bg-bg-tertiary/40 text-text-muted",
                  )}
                >
                  {filter.label}
                  <span className="ml-0.5 text-text-faint">
                    {countByStatus[filter.value] || 0}
                  </span>
                </span>
              );
            })}
          </div>
        </section>

        {/* Featured story (large) */}
        <section aria-label="Story utama" className="mb-2">
          <StockStoryCard story={featured} variant="featured" />
        </section>

        {/* Rest of stories (compact) */}
        <section aria-label="Story lainnya">
          <div className="mb-2 mt-6 flex items-end justify-between border-b border-border-strong pb-1">
            <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
              Story Lainnya
            </h3>
            <span className="font-mono text-[10px] text-text-faint">
              {rest.length} cerita
            </span>
          </div>
          <div className="rounded-b-lg border-x border-b border-border-strong bg-bg-secondary/20 px-3">
            {rest.map((story) => {
              const meta = getStockStoryStatusMeta(story.status);
              const isPos = story.priceImpact >= 0;
              return (
                <Link
                  key={story.id}
                  href={`/saham/story/${story.id}`}
                  className="group flex items-start gap-3 border-b border-border/60 py-3.5 last:border-b-0"
                >
                  <div className="flex shrink-0 flex-col items-center gap-1 pt-0.5">
                    <span className="rounded border border-brand/30 bg-brand/10 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-tight text-brand">
                      {story.ticker}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 font-mono text-[9px] font-bold tabular-nums",
                        isPos ? "text-bullish" : "text-bearish",
                      )}
                    >
                      {isPos ? "▲" : "▼"}
                      {Math.abs(story.priceImpact).toFixed(1)}%
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5 font-mono text-[9.5px] text-text-muted">
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 rounded border px-1 py-0.5 font-semibold uppercase tracking-wider",
                          meta.color,
                        )}
                      >
                        <span className={cn("h-1 w-1 rounded-full", meta.dot)} aria-hidden />
                        {meta.label}
                      </span>
                      <span>·</span>
                      <span>{story.storyCount} liputan</span>
                      <span>·</span>
                      <span>{story.lastUpdate}</span>
                      <span>·</span>
                      <span className="rounded border border-border bg-bg-tertiary/50 px-1 py-0.5">
                        {story.sector}
                      </span>
                    </div>
                    <h4 className="text-[14px] font-semibold leading-snug text-text-primary transition-colors group-hover:text-brand sm:text-[14.5px]">
                      {story.title}
                    </h4>
                    <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-text-secondary">
                      {story.brief}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Back to /saham/ */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/saham"
            className="group inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-secondary px-3.5 py-2 text-[12.5px] font-semibold text-text-secondary transition-all hover:border-brand hover:text-brand"
          >
            Kembali ke Recap /saham/
            <ArrowRight
              className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}

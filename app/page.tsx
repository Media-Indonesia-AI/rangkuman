import Link from "next/link";
import { ArrowRight, Flame, ClipboardList, BookOpen } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TopTicker } from "@/components/TopTicker";
import { BrandSlogan } from "@/components/BrandSlogan";
import { StoryHero } from "@/components/StoryHero";
import { StoryEditorial } from "@/components/StoryEditorial";
import { MarketsStrip } from "@/components/MarketsStrip";
import { GradientDivider } from "@/components/GradientDivider";
import { getTopHighlights } from "@/lib/mock/highlights";

export default function HomePage() {
  const highlights = getTopHighlights(11);
  const leadStory = highlights[0];
  const sedangTerjadi = highlights.slice(1, 5); // 4 cards in 2-col
  const ceritaLain = highlights.slice(5, 11); // 6 cards in 3-col

  return (
    <>
      <TopTicker />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-16 pt-3 sm:px-6 sm:pt-5 md:max-w-4xl lg:max-w-6xl lg:px-8">
        {/* FIX 4: Sr-only H1 for SEO — visible heading is in section labels below */}
        <h1 className="sr-only">
          Rangkuman &mdash; Baca lebih sedikit, tahu lebih banyak
        </h1>

        {/* Brand slogan — above-the-fold memo lock */}
        <BrandSlogan />

        {/* Date label — minimal context, just the date */}
        <div className="mb-2 flex items-center justify-end">
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-faint">
            Edisi 7 Juni 2026
          </span>
        </div>

        {/* 🔥 LAYER 1: SOROTAN — 1 berita paling penting, card besar full-width */}
        {leadStory && (
          <section
            aria-label="Sorotan"
            className="mt-4"
          >
            <div className="mb-3 flex items-end justify-between border-b-2 border-text-primary pb-1.5">
              <div>
                <h2 className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
                  <Flame className="h-3 w-3" aria-hidden />
                  Sorotan
                </h2>
                <p className="mt-0.5 text-[11px] text-text-muted">
                  Cerita paling penting hari ini
                </p>
              </div>
              <span className="font-mono text-[10px] text-text-faint">
                1 cerita
              </span>
            </div>
            <StoryHero highlight={leadStory} />
          </section>
        )}

        {/* 📋 LAYER 2: SEDANG TERJADI — 4 berita, 2-col grid (desktop) / 1-col (mobile), with summary */}
        {sedangTerjadi.length > 0 && (
          <section
            aria-label="Sedang terjadi"
            className="mt-8"
          >
            <div className="mb-3 flex items-end justify-between border-b border-border-strong pb-1.5">
              <div>
                <h2 className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
                  <ClipboardList className="h-3 w-3" aria-hidden />
                  Sedang Terjadi
                </h2>
                <p className="mt-0.5 text-[11px] text-text-muted">
                  Cerita penting lainnya
                </p>
              </div>
              <span className="font-mono text-[10px] text-text-faint">
                Top {sedangTerjadi.length} · 1 jam terakhir
              </span>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {sedangTerjadi.map((h) => (
                <StoryEditorial
                  key={h.id}
                  highlight={h}
                  showSummary
                />
              ))}
            </div>
          </section>
        )}

        <GradientDivider spacing="my-8" />

        {/* 📚 LAYER 3: CERITA LAIN — sisanya, 3-col grid (desktop), compact (no summary) */}
        {ceritaLain.length > 0 && (
          <section
            aria-label="Cerita lain"
            className="mt-2"
          >
            <div className="mb-3 flex items-end justify-between border-b border-border-strong pb-1.5">
              <div>
                <h2 className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
                  <BookOpen className="h-3 w-3" aria-hidden />
                  Cerita Lain
                </h2>
                <p className="mt-0.5 text-[11px] text-text-muted">
                  Berita tambahan hari ini
                </p>
              </div>
              <span className="font-mono text-[10px] text-text-faint">
                {ceritaLain.length} cerita
              </span>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {ceritaLain.map((h) => (
                <StoryEditorial
                  key={h.id}
                  highlight={h}
                  showSummary={false}
                />
              ))}
            </div>
          </section>
        )}

        {/* TICKER — markets snapshot at the bottom */}
        <div className="mt-6">
          <MarketsStrip />
        </div>

        <GradientDivider spacing="my-8" />

        {/* About link footer */}
        <div className="mt-8 flex flex-col items-center gap-2 border-t border-border pt-5 sm:flex-row sm:justify-between">
          <p className="font-mono text-[10.5px] text-text-muted">
            © 2026 Rangkuman · Jakarta ·{" "}
            <span className="text-text-secondary">Baca lebih sedikit, tahu lebih banyak.</span>
          </p>
          <Link
            href="/tentang"
            className="group inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold uppercase tracking-widest text-text-muted transition-colors hover:text-brand"
          >
            About Rangkuman
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

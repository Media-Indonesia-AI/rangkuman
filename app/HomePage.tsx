import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BrandSlogan } from "@/components/BrandSlogan";
import { MarketsStrip } from "@/components/MarketsStrip";
import { GradientDivider } from "@/components/GradientDivider";
import { HomeHeadlines } from "./HomeHeadlines";

export default function HomePage() {
  return (
    <>
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

        {/* Live headlines rail: 1 lead + 4 sedang terjadi + 10 cerita lain. */}
        <HomeHeadlines />

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
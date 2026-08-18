import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BrandSlogan } from "@/components/BrandSlogan";
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

        {/* Live headlines rail: 1 lead + 14 berita terkini. */}
        <HomeHeadlines />
      </main>
      <Footer />
    </>
  );
}
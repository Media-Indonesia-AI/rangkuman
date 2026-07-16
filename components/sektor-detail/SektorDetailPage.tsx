"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSectors } from "@/lib/hooks/useSectors";
import { mapSector, type SektorDisplay } from "@/lib/util/sectorMappers";
import { SektorDetailHeader } from "./SektorDetailHeader";
import { SektorDetailNews } from "./SektorDetailNews";
import { SektorDetailEmpty } from "./SektorDetailEmpty";
import { SektorDetailSkeleton } from "./SektorDetailSkeleton";
import { SektorTopStocks } from "./SektorTopStocks";

interface PageProps {
  params: { slug: string };
}

/**
 * Sector detail page — `/sektor/[slug]`.
 *
 * Thin orchestrator: pulls the live `GET stocks/sectors` data
 * via `useSectors`, maps wire rows to display shape, looks up
 * the slug, and routes between three branches:
 *
 *   1. `isLoading`            → `<SektorDetailSkeleton />` (shimmer)
 *   2. sector not found      → `notFound()` (404 boundary)
 *   3. real data             → header + top-5 + news, composed
 *                              from focused sub-components
 *
 * The per-section markup lives in:
 *   - `./SektorDetailHeader`    (hue badge + sentiment + stats)
 *   - `./SektorTopStocks`       (top-5 grid, uses SektorTopStockCard)
 *   - `./SektorDetailNews`      (placeholder empty-state)
 *
 * State variants live in:
 *   - `./SektorDetailSkeleton`  (loading)
 *   - `./SektorDetailEmpty`     (defensive 404 fallback)
 *
 * Note on `generateMetadata` / `generateStaticParams`: those
 * stay in the sibling `app/sektor/[slug]/page.tsx` and still
 * source from the mock catalog for SEO purposes. Migrating
 * them to live data is a separate concern — they'd need a
 * server-side fetcher that resolves to the slug list at
 * build time.
 */
export default function SektorDetailPage({ params }: PageProps) {
  const { data, isLoading } = useSectors();

  if (isLoading) {
    return (
      <>
        <Navbar />
        <SektorDetailSkeleton />
        <Footer />
      </>
    );
  }

  // Map wire sectors → display shape, then look up the slug.
  // Falls back to an empty array when data is null so the find
  // below produces an "unknown slug" instead of crashing.
  const sectors: SektorDisplay[] = data ? data.map(mapSector) : [];
  const sektor = sectors.find((s) => s.slug === params.slug);

  if (!sektor) {
    notFound();
  }

  return (
    <>
      <Navbar />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5">
        {/* FIX 4: Sr-only H1 for SEO */}
        <h1 className="sr-only">Rangkuman &mdash; Sektor {sektor.name}</h1>

        <Link
          href="/sektor"
          className="mb-3 inline-flex items-center gap-1.5 text-[12px] text-text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden />
          Semua sektor
        </Link>

        <SektorDetailHeader sektor={sektor} />
        <SektorTopStocks sektor={sektor} />
        <SektorDetailNews sektor={sektor} />
      </main>
      <Footer />
    </>
  );
}

// `notFound()` throws — we need a runtime fallback to satisfy the
// type checker (after `notFound()` the `sektor` variable should be
// narrowed to non-null, but TS doesn't know that). The defensive
// `SektorDetailEmpty` is reachable only if Next.js's not-found
// boundary ever fails to catch the throw.
void SektorDetailEmpty;
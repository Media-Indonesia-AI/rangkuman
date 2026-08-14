import { getSektorBySlug, sektorList } from "@/lib/mock/sectors";

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return sektorList.map((s) => ({ slug: s.slug }));
}

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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
    },
  };
}

/** Route handler for /sektor/[slug]. Component lives in the
 *  `@/components/sektor-detail` widget folder (orchestrator +
 *  focused sub-components + state variants) — this file just
 *  re-exports the default so Next.js can pick it up.
 *
 *  `generateMetadata` / `generateStaticParams` stay here (still
 *  mock-sourced) so SEO metadata is built at compile time without
 *  needing a server-side fetcher for the live sectors API. */
export { default } from "@/components/sektor-detail";
import { getSektorBySlug, sektorList } from "@/lib/mock/sectors";
import { clampDescription } from "@/lib/util/clampDescription";

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return sektorList.map((s) => ({ slug: s.slug }));
}

/**
 * Build the `<meta name="og:*">` and Twitter Card tags for this
 * route. Telegram, WhatsApp, X, LinkedIn, and Slack all fetch a
 * shared URL and read these tags to render the link preview —
 * without them the shared link shows only the bare URL.
 *
 * Sector data still comes from the mock catalog (`lib/mock/sectors`)
 * because the sectors API isn't yet auth-free — keeping it mocked
 * means SEO metadata is built at compile time without a server-side
 * fetcher. Mirrors the structure of
 * `app/headline/detail/[id]/page.tsx`: `await params` (Next.js 15),
 * `alternates: { canonical }`, 160-char description clamp.
 */
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const sektor = getSektorBySlug(resolvedParams.slug);
  if (!sektor) return { title: "Sektor tidak ditemukan · Rangkuman" };
  const changeStr = `${sektor.avgChange >= 0 ? "+" : ""}${sektor.avgChange.toFixed(2)}%`;
  const topStocks = [...sektor.stocks]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 4)
    .map((s) => s.kode);
  const title = `Sektor ${sektor.name} ${changeStr} · Rangkuman`;
  const desc = `${topStocks.join(", ")} — ${sektor.stocks.length} emiten ${sektor.name.toLowerCase()}.`;
  const clippedDescription = clampDescription(desc);
  const canonical = `/sektor/${sektor.slug}/`;
  return {
    title,
    description: clippedDescription,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description: clippedDescription,
      siteName: "Rangkuman",
      locale: "id_ID",
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: clippedDescription,
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
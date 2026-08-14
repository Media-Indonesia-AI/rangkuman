import type { Metadata } from "next";
import { headers } from "next/headers";
import { SorotanDetailPage } from "@/components/sorotan-detail";
import { loadHeadlineById } from "@/lib/api/cache";

interface PageProps {
  params: { id: string };
}

interface BackLink {
  label: string;
  href: string;
}

/**
 * Build the `<meta name="og:*">` and Twitter Card tags for this
 * route. Telegram, WhatsApp, X, LinkedIn, and Slack all fetch a
 * shared URL and read these tags to render the link preview —
 * without them the shared link shows only the bare URL.
 *
 * `loadHeadlineById` is called in a try/catch because if the API
 * is unreachable we return an empty `Metadata` object — better to
 * emit nothing than to ship generic/incorrect tags for a story
 * we couldn't load. Next.js falls back to the parent layout's
 * metadata in that case.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const detail = await loadHeadlineById(params.id);
    const headline = detail.title ?? "Cerita · Rangkuman";
    const description = detail.summary ?? "Rangkuman cerita harian dari 64 sumber media.";
    const topics = (detail.topics ?? [])
      .map((t) => t.name)
      .filter((name): name is string => Boolean(name));
    // Relative paths resolve against metadataBase. `trailingSlash: true`
    // in next.config.js means the canonical URL is served at `/sorotan/detail/[id]/`.
    const canonical = `/sorotan/detail/${params.id}/`;
    return {
      title: `${headline} · Rangkuman`,
      description,
      keywords: topics,
      alternates: { canonical },
      openGraph: {
        type: "article",
        title: headline,
        description,
        siteName: "Rangkuman",
        locale: "id_ID",
        url: canonical,
      },
      twitter: {
        card: "summary_large_image",
        title: headline,
        description,
      },
    };
  } catch {
    return {};
  }
}

/**
 * Map the inbound `Referer` header to a (label, href) pair for the
 * detail page's breadcrumb. Mirrors the entry-point list from
 * `app/story/[id]/page.tsx`. Known entry points today:
 *
 *   - `/crypto`               — recap tab on `/components/crypto-page/CryptoRecapTab.tsx`
 *   - `/saham`                — recap tab on `/app/saham/page.tsx`
 *   - `/stock/[kode]`         — `<NewsTimeline />` on the stock page
 *                               (`app/stock/[kode]/StockDetailPage.tsx`)
 *   - `/sorotan`, `/sorotan/detail/[id]` — inter-detail hops and
 *                               a future `/sorotan` listing (none
 *                               exists yet, but the path is used
 *                               by `StoryHero` / `RelatedStoriesList`
 *                               sidebar links between detail pages)
 *   - `/`                     — homepage (`/app/HomePage.tsx`) headlines
 *
 * Anything else (direct visit, external link, share URL) falls back
 * to "Kembali ke Beranda" so the breadcrumb never lands on a link
 * that doesn't exist. The referer is sent by the browser on hard
 * loads AND by Next.js on RSC payload requests for soft
 * navigations, so this works for both.
 */
function backLinkFromReferer(referer: string | null): BackLink {
  const FALLBACK: BackLink = { label: "Kembali ke Beranda", href: "/" };
  if (!referer) return FALLBACK;
  try {
    const path = new URL(referer).pathname;
    if (path === "/crypto" || path.startsWith("/crypto/")) {
      return { label: "Kembali ke Crypto", href: "/crypto" };
    }
    if (path === "/saham" || path.startsWith("/saham/")) {
      return { label: "Kembali ke Saham", href: "/saham" };
    }
    if (path.startsWith("/stock/")) {
      // `/stock/BBCA` → back to BBCA. Guard against a trailing
      // slash or a nested segment producing an empty/odd label.
      const kode = path.split("/")[2]?.trim();
      if (kode) {
        return {
          label: `Kembali ke ${decodeURIComponent(kode).toUpperCase()}`,
          href: `/stock/${kode}`,
        };
      }
      return FALLBACK;
    }
    if (path === "/sorotan" || path.startsWith("/sorotan/")) {
      return { label: "Kembali ke Sorotan", href: "/" };
    }
    if (path === "/" || path === "") {
      return { label: "Kembali ke Beranda", href: "/" };
    }
    return FALLBACK;
  } catch {
    return FALLBACK;
  }
}

/**
 * Thin route entry — defers ALL data fetching to the client-side
 * `<SorotanDetailPage storyId={...} />` orchestrator. The orchestrator
 * owns `useHeadlineId()` (parent headline) + `useListStory(headline_id)`
 * (related stories) and composes them into a `Highlight` shape that
 * the page widgets consume.
 *
 * Returning `notFound()` from the body would require a synchronous
 * check that doesn't exist on the client — instead, the orchestrator
 * handles the empty-state via the `useHeadlineId` hook's
 * `{ detail: null, isLoading }` shape, and the widgets naturally
 * render nothing for empty arrays. The page renders an empty body
 * for invalid IDs rather than 404-ing — Next.js's `notFound()` is
 * reserved for the rare case where the API itself fails (the
 * orchestrator surfaces that as "no content" and the global
 * `<ErrorBoundary />` can catch it).
 *
 * Also reads the inbound `Referer` header (server-side, via
 * `headers()`) to compute the breadcrumb's back-link label + href
 * so it follows where the visitor came from instead of being
 * hardcoded.
 */
export default function SorotanDetailRoutePage({ params }: PageProps) {
  const referer = headers().get("referer");
  const backLink = backLinkFromReferer(referer);
  return (
    <SorotanDetailPage
      storyId={params.id}
      backLabel={backLink.label}
    />
  );
}

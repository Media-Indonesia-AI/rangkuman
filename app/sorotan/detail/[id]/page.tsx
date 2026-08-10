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

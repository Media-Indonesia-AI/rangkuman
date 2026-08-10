import { headers } from "next/headers";
import StoryDetailPage from "./StoryDetailPage";

interface BackLink {
  label: string;
  href: string;
}

/**
 * Map the inbound `Referer` header to a (label, href) pair for the
 * story detail page's back link. Mirrors
 * `app/sorotan/detail/[id]/page.tsx`. Known entry points today:
 *
 *   - `/story`, `/story/[id]` — the listing (`app/story/StoryPage.tsx`)
 *     and the sidebar's "Story Lainnya" rail, which hops between
 *     detail pages
 *   - `/stock/[kode]`         — `<EmitenStories variant="highlight" />`
 *     on the stock page; goes back to that emiten, not the index
 *   - `/saham`                — `<EmitenStories />` on `app/saham/page.tsx`
 *   - `/crypto`               — `components/crypto-page/CryptoRecapTab.tsx`
 *   - `/`                     — homepage feed (`app/HomeHeadlines.tsx`)
 *
 * Anything else (direct visit, external link, share URL) falls back
 * to "Kembali ke Saham" — the link this page hardcoded before the
 * referer lookup existed. The referer is sent by the browser on hard
 * loads AND by Next.js on RSC payload requests for soft navigations,
 * so this works for both.
 */
function backLinkFromReferer(referer: string | null): BackLink {
  const FALLBACK: BackLink = { label: "Kembali ke Saham", href: "/saham" };
  if (!referer) return FALLBACK;
  try {
    const path = new URL(referer).pathname;
    if (path === "/story" || path.startsWith("/story/")) {
      return { label: "Kembali ke Story", href: "/story" };
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
    if (path === "/saham" || path.startsWith("/saham/")) {
      return { label: "Kembali ke Saham", href: "/saham" };
    }
    if (path === "/crypto" || path.startsWith("/crypto/")) {
      return { label: "Kembali ke Crypto", href: "/crypto" };
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
 * Route entry — reads the inbound `Referer` header (server-side, via
 * `headers()`) so the back link follows where the visitor came from,
 * then hands the copy + href to the client orchestrator in
 * `./StoryDetailPage`, which owns all the data fetching.
 *
 * Reading a header opts this route out of static rendering; the page
 * body was already client-rendered (`useHeadlineId()` resolves the
 * `[id]` param on the client), so nothing is lost.
 */
export default function StoryDetailRoutePage() {
  const { label, href } = backLinkFromReferer(headers().get("referer"));
  return <StoryDetailPage backLabel={label} backHref={href} />;
}

import { headers } from "next/headers";
import StoryDetailPage from "./StoryDetailPage";

interface BackLink {
  label: string;
  href: string;
}

/** Hints passed from the route entry to the client orchestrator
 *  so it can scope the sidebar's Story feed to the topic the
 *  visitor was reading on the previous page. Resolved into a
 *  real `topic_id` on the client via `useTopicsContext()` + the
 *  `find*TopicId` helpers in `lib/util/topicId.ts` — the server
 *  can't resolve topic ids because the topics catalog is auth-
 *  gated and only fetched on the client. */
export type StoryTopicHint = "saham" | "crypto";

interface RefererData {
  back: BackLink;
  /** `undefined` when the previous page doesn't map to a known
   *  topic — the client then leaves the sidebar on the cross-
   *  topic default (`topicId=""`). */
  topicHint?: StoryTopicHint;
}

/**
 * Map the inbound `Referer` header to a back link AND a topic
 * hint. Mirrors the entry-point list from
 * `app/sorotan/detail/[id]/page.tsx`. Known entry points today:
 *
 *   - `/story`, `/story/[id]` — the listing (`app/story/StoryPage.tsx`)
 *     and the sidebar's "Story Lainnya" rail, which hops between
 *     detail pages
 *   - `/stock/[kode]`         — `<EmitenStories variant="highlight" />`
 *     on the stock page; goes back to that emiten, not the index
 *   - `/saham`                — `<EmitenStories />` on `app/saham/page.tsx`
 *     (also scopes the sidebar to the "saham" topic)
 *   - `/crypto`               — `components/crypto-page/CryptoRecapTab.tsx`
 *     (also scopes the sidebar to the "crypto" topic)
 *   - `/`                     — homepage feed (`app/HomeHeadlines.tsx`).
 *     Beranda carries no topic scope, so the sidebar stays on the
 *     cross-topic default.
 *
 * Anything else (direct visit, external link, share URL) falls back
 * to "Kembali ke Saham" with no topic hint — the link this page
 * hardcoded before the referer lookup existed. The referer is sent
 * by the browser on hard loads AND by Next.js on RSC payload
 * requests for soft navigations, so this works for both.
 */
function dataFromReferer(referer: string | null): RefererData {
  const FALLBACK: RefererData = {
    back: { label: "Kembali ke Saham", href: "/saham" },
  };
  if (!referer) return FALLBACK;
  try {
    const path = new URL(referer).pathname;
    if (path === "/story" || path.startsWith("/story/")) {
      return {
        back: { label: "Kembali ke Story", href: "/story" },
      };
    }
    if (path.startsWith("/stock/")) {
      // `/stock/BBCA` → back to BBCA. Guard against a trailing
      // slash or a nested segment producing an empty/odd label.
      const kode = path.split("/")[2]?.trim();
      if (kode) {
        return {
          back: {
            label: `Kembali ke ${decodeURIComponent(kode).toUpperCase()}`,
            href: `/stock/${kode}`,
          },
        };
      }
      return FALLBACK;
    }
    if (path === "/saham" || path.startsWith("/saham/")) {
      return {
        back: { label: "Kembali ke Saham", href: "/saham" },
        topicHint: "saham",
      };
    }
    if (path === "/crypto" || path.startsWith("/crypto/")) {
      return {
        back: { label: "Kembali ke Crypto", href: "/crypto" },
        topicHint: "crypto",
      };
    }
    if (path === "/" || path === "") {
      return {
        back: { label: "Kembali ke Beranda", href: "/" },
      };
    }
    return FALLBACK;
  } catch {
    return FALLBACK;
  }
}

/**
 * Route entry — reads the inbound `Referer` header (server-side, via
 * `headers()`) so the back link follows where the visitor came from,
 * then hands the copy + href + topic hint to the client orchestrator
 * in `./StoryDetailPage`, which owns all the data fetching.
 *
 * Reading a header opts this route out of static rendering; the page
 * body was already client-rendered (`useHeadlineId()` resolves the
 * `[id]` param on the client), so nothing is lost.
 */
export default function StoryDetailRoutePage() {
  const { back, topicHint } = dataFromReferer(headers().get("referer"));
  return (
    <StoryDetailPage
      backLabel={back.label}
      backHref={back.href}
      topicHint={topicHint}
    />
  );
}

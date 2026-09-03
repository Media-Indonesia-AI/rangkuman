import type { Metadata } from "next";
import { headers } from "next/headers";
import StoryDetailPage from "./StoryDetailPage";
import { loadHeadlineById } from "@/lib/api/cache";
import { clampDescription } from "@/lib/util/clampDescription";

interface PageProps {
  params: { id: string };
  /** Next.js 15 hands `searchParams` as a Promise. The route
   *  entry only reads `?topic=` — the explicit hint forwarded
   *  by `<FeaturedCard />` / `<StoryListRow />` from the
   *  listing page so the detail page's sidebar-scoped feed
   *  doesn't have to depend on the `Referer` lookup alone. */
  searchParams: Promise<{ topic?: string }>;
}

/**
 * Build the `<meta name="og:*">` and Twitter Card tags for this
 * route. Telegram, WhatsApp, X, LinkedIn, and Slack all fetch a
 * shared URL and read these tags to render the link preview —
 * without them the shared link shows only the bare URL.
 *
 * `loadHeadlineById` is called in a try/catch because if the API
 * is unreachable we still want to emit valid `<meta>` tags
 * (Telegram in particular drops the whole preview when one tag
 * is broken). On error we emit route-specific fallback copy —
 * "Story" / "Story pasar modal Indonesia yang sedang tren,
 * dikurasi dari 11 sumber media." — which is more accurate than
 * letting Next.js fall back to the root layout's generic brand
 * metadata.
 *
 * Note: the `Rangkuman` brand prefix is intentionally NOT applied
 * here — story detail pages stand on their own (the headline
 * carries the topic), so the tab / share preview shows just the
 * headline. Mirrors `app/headline/detail/[id]/page.tsx`.
 *
 * Mirrors the structure of `app/headline/detail/[id]/page.tsx`,
 * including the `await params` (Next.js 15) and the 160-char
 * description clamp.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  let headline = "Story";
  let description = "Story pasar modal Indonesia yang sedang tren, dikurasi dari 11 sumber media.";
  let topics: string[] = [];

  const resolvedParams = await params;
  const id = resolvedParams.id;

  try {
    const detail = await loadHeadlineById(id);
    if (detail.title) headline = detail.title;
    if (detail.summary) description = detail.summary;
    topics = (detail.topics ?? [])
      .map((t) => t.name)
      .filter((name): name is string => Boolean(name));
  } catch {
    // API unreachable — emit route-specific fallback so the share
    // preview still reflects this is a story page, not the generic
    // brand default from the root layout.
  }
  // Telegram / WhatsApp / X / LinkedIn / Slack each clip the preview
  // description to ~160 chars. Clamping here keeps the rendered
  // preview on a clean sentence boundary instead of mid-word.
  const clippedDescription = clampDescription(description);
  // Relative paths resolve against metadataBase. `trailingSlash: true`
  // in next.config.js means the canonical URL is served at `/story/[id]/`.
  const canonical = `/story/${id}/`;
  return {
    title: `${headline}`,
    description: clippedDescription,
    keywords: topics,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: headline,
      description: clippedDescription,
      siteName: "Rangkuman",
      locale: "id_ID",
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: headline,
      description: clippedDescription,
    },
  };
}

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
 * `app/headline/detail/[id]/page.tsx`. Known entry points today:
 *
 *   - `/story`, `/story/[id]` — the listing
 *     (`app/story/StoryPage.tsx`) and the sidebar's
 *     "Story Lainnya" rail, which hops between detail pages.
 *     The back label and href follow the referer's
 *     `?topic=` so the visitor returns to the *same* scoped
 *     feed: "Kembali ke Story Saham" / `/story?topic=saham`,
 *     "Kembali ke Story Crypto" / `/story?topic=crypto`, or
 *     "Kembali ke Story Beranda" / `/story` (cross-topic
 *     case, marked "Beranda" to distinguish from the scoped
 *     variants).
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
    const url = new URL(referer);
    const path = url.pathname;
    // The referer's `?topic=` drives the `/story` branch's
    // back label and href — see the branch below. We pull it
    // out once at the top of the try-block so the same parsed
    // value is shared across the path checks instead of
    // re-parsing the URL inside each branch.
    const topic = url.searchParams.get("topic");
    if (path === "/story" || path.startsWith("/story/")) {
      // The story listing and the sidebar's "Story Lainnya"
      // rail both hop to detail pages. The back link's label
      // and href follow the referer's `?topic=` so the
      // visitor returns to the *same* scoped feed instead of
      // silently dropping the topic on the way back. Label
      // splits per-topic: "Kembali ke Story Saham" /
      // "Kembali ke Story Crypto" for the scoped variants;
      // "Kembali ke Story Beranda" for the cross-topic
      // case (the `Beranda` suffix marks the unfiltered
      // listing, distinct from the two scoped ones so the
      // user knows they're returning to the cross-topic
      // feed). Href mirrors the topic back onto the
      // listing so the reload keeps the same filter.
      if (topic === "saham" || topic === "crypto") {
        return {
          back: {
            label: `Kembali ke Story ${topic.charAt(0).toUpperCase()}${topic.slice(1)}`,
            href: `/story?topic=${topic}`,
          },
          topicHint: topic,
        };
      }
      return {
        back: { label: "Kembali ke Story Beranda", href: "/story" },
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
 * Route entry — resolves the back link + topic hint from two
 * sources, in priority order:
 *
 *   1. **`?topic=` query param** — the explicit hint forwarded
 *      by `<FeaturedCard />` / `<StoryListRow />` on the
 *      listing page (`StoryPage.tsx`). This is the canonical
 *      signal: the listing has already resolved the hint and
 *      knows it should apply, so trusting it over `Referer`
 *      means the sidebar stays scoped even when the browser
 *      drops the referer (hard-render, cross-origin trace,
 *      stripped by an intermediate proxy, etc.).
 *   2. **Inbound `Referer` header** — the fallback for direct
 *      visits, share URLs, and the sidebar's own
 *      "Story Lainnya" rail, which already reads `topicHint`
 *      from this same route's prop. `dataFromReferer()` maps
 *      known entry points (`/story`, `/story/[id]`, `/stock/[kode]`,
 *      `/saham`, `/crypto`, `/`) to the back link copy + href
 *      and a topic hint, where applicable.
 *
 * Both sources are validated against the `StoryTopicHint` union
 * — anything outside `"saham" | "crypto"` is silently dropped
 * so the consumer's `useMultiStories(..., topicId)` cache slot
 * stays on the cross-topic default (`topicId=""`) instead of
 * an unresolvable id.
 *
 * Reading `headers()` opts this route out of static rendering;
 * the page body was already client-rendered (`useHeadlineId()`
 * resolves the `[id]` param on the client), so nothing is lost.
 */
export default async function StoryDetailRoutePage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const queryTopicHint: StoryTopicHint | undefined =
    resolvedSearchParams.topic === "saham" ||
    resolvedSearchParams.topic === "crypto"
      ? resolvedSearchParams.topic
      : undefined;
  const { back, topicHint: refererTopicHint } = dataFromReferer(
    headers().get("referer"),
  );
  // Query param wins over Referer — the explicit `?topic=` link
  // from `<StoryPage />` is the canonical signal, Referer is the
  // fallback for direct visits / share URLs.
  const topicHint = queryTopicHint ?? refererTopicHint;
  return (
    <StoryDetailPage
      backLabel={back.label}
      backHref={back.href}
      topicHint={topicHint}
    />
  );
}

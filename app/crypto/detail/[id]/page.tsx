import type { Metadata } from "next";
import { CryptoDetailPage } from "@/components/crypto-detail";
import { loadHeadlineById } from "@/lib/api/cache";

interface PageProps {
  params: { id: string };
}

/**
 * Metadata for /crypto/detail/[id]. Fetches just the parent headline
 * to read `title` / `summary` for the OpenGraph tags. Body rendering
 * is handled by the client-side `<CryptoDetailPage />` orchestrator
 * (which fetches the same `loadHeadlineById` from the request-level
 * cache — one network round-trip total).
 *
 * The fallback is intentionally **generic** rather than
 * `"Cerita tidak ditemukan"` — the server-side fetch can fail
 * for reasons that don't reflect the page itself (the server may
 * not have outbound access to the API host, or the SSR fetch
 * may be rate-limited), while the client-side `useHeadlineId`
 * hook still resolves the story correctly. A "tidak ditemukan"
 * title then reads as "the page is broken" when the body renders
 * fine. A neutral "Detail Cerita — Rangkuman" + the orchestrator's
 * client-side `document.title` write (see `<CryptoDetailPage />`)
 * keep the tab honest in both branches: the server sets a
 * neutral baseline, the client upgrades it to the real title
 * once the data lands.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const live = await loadHeadlineById(params.id);
    return {
      title: `${live.title} — Rangkuman`,
      description: live.summary,
      openGraph: {
        title: live.title,
        description: live.summary,
        type: "article",
        publishedTime: live.created_at,
      },
    };
  } catch {
    return {
      title: "Detail Cerita — Rangkuman",
      description: "Rangkuman cerita crypto, saham, dan bisnis dari berbagai sumber.",
    };
  }
}

/**
 * Thin route entry — defers ALL data fetching to the client-side
 * `<CryptoDetailPage storyId={...} />` orchestrator. The orchestrator
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
 */
export default function CryptoDetailRoutePage({ params }: PageProps) {
  return <CryptoDetailPage storyId={params.id} />;
}
import type { Metadata } from "next";
import { CryptoDetailPage } from "@/components/crypto-detail";
import { loadHeadlineById } from "@/lib/api/cache";

interface PageProps {
  params: { id: string };
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
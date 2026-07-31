/**
 * Barrel for the `/crypto/detail/[id]` detail page widgets. Lets the route
 * entry (`app/crypto/detail/[id]/page.tsx`) import the orchestrator with a
 * single path:
 *
 *   import { CryptoDetailPage } from "@/components/crypto-detail";
 *
 * Each individual widget is also exported so consumers can compose
 * the same pieces elsewhere (e.g. a teaser card that only needs the
 * header + summary).
 */
export { CryptoDetailPage, type CryptoDetailPageProps } from "./CryptoDetailPage";
export { CryptoDetailBreadcrumb } from "./CryptoDetailBreadcrumb";
export { CryptoDetailHeader } from "./CryptoDetailHeader";
export { CryptoDetailSummary } from "./CryptoDetailSummary";
export { CryptoDetailTags } from "./CryptoDetailTags";
export { CryptoDetailKeyData } from "./CryptoDetailKeyData";
export { CryptoDetailTimeline } from "./CryptoDetailTimeline";
export { CryptoDetailSources } from "./CryptoDetailSources";
export { CryptoDetailSidebar } from "./CryptoDetailSidebar";
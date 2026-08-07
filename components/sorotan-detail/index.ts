/**
 * Barrel for the `/sorotan/detail/[id]` detail page widgets. Lets the route
 * entry (`app/sorotan/detail/[id]/page.tsx`) import the orchestrator with a
 * single path:
 *
 *   import { SorotanDetailPage } from "@/components/sorotan-detail";
 *
 * Each individual widget is also exported so consumers can compose
 * the same pieces elsewhere (e.g. a teaser card that only needs the
 * header + summary).
 */
export { SorotanDetailPage, type SorotanDetailPageProps } from "./SorotanDetailPage";
export { SorotanDetailBreadcrumb } from "./SorotanDetailBreadcrumb";
export { SorotanDetailHeader } from "./SorotanDetailHeader";
export { SorotanDetailSummary } from "./SorotanDetailSummary";
export { SorotanDetailTags } from "./SorotanDetailTags";
export { SorotanDetailKeyData } from "./SorotanDetailKeyData";
export { SorotanDetailTimeline } from "./SorotanDetailTimeline";
export { SorotanDetailSources } from "./SorotanDetailSources";
export { SorotanDetailSidebar } from "./SorotanDetailSidebar";

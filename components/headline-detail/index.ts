/**
 * Barrel for the `/headline/detail/[id]` detail page widgets. Lets the route
 * entry (`app/headline/detail/[id]/page.tsx`) import the orchestrator with a
 * single path:
 *
 *   import { HeadlineDetailPage } from "@/components/headline-detail";
 *
 * Each individual widget is also exported so consumers can compose
 * the same pieces elsewhere (e.g. a teaser card that only needs the
 * header + summary).
 */
export { HeadlineDetailPage, type HeadlineDetailPageProps } from "./HeadlineDetailPage";
export { HeadlineDetailBreadcrumb } from "./HeadlineDetailBreadcrumb";
export {
  HeadlineDetailHeader,
  type PrimaryCategoryConfig,
} from "./HeadlineDetailHeader";
export { HeadlineDetailSummary } from "./HeadlineDetailSummary";
export { HeadlineDetailTags } from "./HeadlineDetailTags";
export { HeadlineDetailKeyData } from "./HeadlineDetailKeyData";
export { HeadlineDetailTimeline } from "./HeadlineDetailTimeline";
export { HeadlineDetailSources } from "./HeadlineDetailSources";
export { HeadlineDetailSidebar } from "./HeadlineDetailSidebar";

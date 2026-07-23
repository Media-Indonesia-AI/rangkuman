/**
 * Barrel for `/story/[id]` route-specific widgets. These components
 * are used only by the Story Detail page, so they're grouped here
 * rather than in the shared `@/components` root. Import from
 * `@/components/story-detail`:
 *
 *   import { Hero, StoriesList, Articles, Sidebar } from "@/components/story-detail";
 */
export { Hero } from "./Hero";
export { StoriesList } from "./StoriesTimeline";
export { Articles } from "./Articles";
export { Sidebar } from "./StorySidebar";
export {
  STATUS_ICON,
  sentimentMeta,
  articleHref,
  NotAvailable,
  SectionHeader,
} from "./shared";

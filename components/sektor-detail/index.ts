/**
 * Barrel for the sector-detail page widget module.
 *
 * Lets call sites import from `@/components/sektor-detail`
 * instead of reaching into the per-file paths:
 *
 *   import SektorDetailPage from "@/components/sektor-detail";
 *
 * The default export re-exports the page orchestrator so
 * Next.js route handlers can `export { default }` from this
 * barrel without reaching into per-file paths.
 *
 * The internal pieces (`SektorDetailHeader`, `SektorTopStocks`,
 * `SektorTopStockCard`, `SektorDetailNews`) are kept available
 * here too so future compositions (e.g. a "preview" sector
 * card inside a story or onboarding screen) don't have to
 * re-derive the import paths. The state variants
 * (`SektorDetailSkeleton`, `SektorDetailEmpty`) are exported
 * for the same reason.
 */

export { default } from "./SektorDetailPage";
export { default as SektorDetailPage } from "./SektorDetailPage";
export { SektorDetailHeader } from "./SektorDetailHeader";
export { SektorTopStocks } from "./SektorTopStocks";
export { SektorTopStockCard } from "./SektorTopStockCard";
export { SektorDetailNews } from "./SektorDetailNews";
export { SektorDetailSkeleton } from "./SektorDetailSkeleton";
export { SektorDetailEmpty } from "./SektorDetailEmpty";
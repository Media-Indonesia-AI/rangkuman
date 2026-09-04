/**
 * Barrel for the sektor widget module.
 *
 * Lets call sites import from `@/components/sektor` instead of
 * reaching into the per-file paths:
 *
 *   import { SektorSection } from "@/components/sektor";
 *
 * Sub-components (`SektorCard`) and styling helpers (`hueText`,
 * `hueBg`, `hueBorder`) are kept available here too so future
 * compositions (e.g. an inline sector tile on a detail page)
 * don't have to re-derive the import paths.
 */

export { SektorSection } from "./SektorSection";
export { SektorGrid } from "./SektorGrid";
export { SektorCard } from "./SektorCard";
export { hueText, hueBg, hueBorder } from "./hueStyles";

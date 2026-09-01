/**
 * Barrel for the Pasar tab's widgets.
 *
 * Internal sub-components (TopMoverCard, CategoryCard, etc.) are
 * NOT re-exported — they're implementation details. Callers
 * (notably `<CryptoSection />`) import them by file path when
 * they need to compose a custom layout, but the public API
 * surface stays narrow.
 *
 * Public widgets:
 *   - `<TopMovers />`    — Top Gainer + Top Looser section
 *   - `<CategoryGrid />` — categories card grid with load more
 */

export { TopMovers } from "./TopMovers/TopMovers";
export { CategoryGrid } from "./CategoryGrid/CategoryGrid";

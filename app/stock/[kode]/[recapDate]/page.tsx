/**
 * Route handler for `/stock/{kode}/{recapDate}` (e.g. a search-result
 * card linking to a specific recap day for a ticker). The component
 * at `../StockDetailPage` already accepts an optional `recapDate` in
 * its `PageProps`, so this is a thin re-export — same forwarding
 * shape as `/search/[ticker]`.
 *
 * We never re-export the *static* path segment version of the file:
 * `app/stock/[kode]/page.tsx` owns `/stock/{kode}` (no recap date),
 * this file owns `/stock/{kode}/{recapDate}`. Both call the same
 * component, but Next.js needs a separate `page.tsx` per segment.
 */
export { default } from "../StockDetailPage";

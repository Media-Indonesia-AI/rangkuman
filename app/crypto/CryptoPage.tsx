/**
 * Thin re-export of the `/crypto` page implementation.
 *
 * The page itself lives at `components/crypto-page/` so the
 * focused sub-widgets (`CryptoFeaturedCard`, `CryptoStoryCard`,
 * `CoinTickerCard`, `CryptoSectionHeader`, plus the
 * `cryptoFormatters` / `cryptoStories` helpers) sit alongside the
 * orchestrator. This file exists only so imports like
 * `@/app/crypto/CryptoPage` (if any) and Next's page-route
 * resolution keep working unchanged.
 */
export { default } from "@/components/crypto-page";

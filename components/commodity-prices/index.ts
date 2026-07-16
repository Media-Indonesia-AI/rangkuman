/**
 * Barrel for the commodity-prices widget module.
 *
 * Lets call sites import from `@/components/commodity-prices`
 * instead of reaching into the per-file paths:
 *
 *   import { CommodityPrices } from "@/components/commodity-prices";
 *
 * The internal pieces (`CommodityPricesShimmer`,
 * `CommodityPricesEmpty`) are kept available here too so future
 * compositions (e.g. a placeholder used directly inside a story
 * or test) don't have to re-derive the import paths. Styling
 * helpers (`styleForBucket`, `iconFor`, `categoryConfig`,
 * `perCommodityIcon`) are also re-exported so other widgets that
 * want to match the same color/icon conventions can import from
 * a single place rather than duplicating the tables.
 */

export { CommodityPrices } from "./CommodityPrices";
export { CommodityPricesShimmer } from "./CommodityPricesShimmer";
export { CommodityPricesEmpty } from "./CommodityPricesEmpty";
export {
  categoryConfig,
  genericCategoryStyle,
  styleForBucket,
} from "./categoryStyles";
export {
  perCommodityIcon,
  categoryIcon,
  fallbackIcon,
  iconFor,
  slugify,
} from "./commodityIcons";
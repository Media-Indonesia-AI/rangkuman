/**
 * Barrel for the API client. Existing call sites import from
 * `@/lib/api` and get the `api` runtime object plus all types.
 *
 * Types live in `lib/api/types/<category>/` — auth, stocks, market,
 * error — and are re-exported here so consumer imports stay flat:
 *
 *   import { api, type InterestRate, type TopStockItem } from "@/lib/api";
 */
export { api, API_BASE_URL } from "./client";

// Error
export type { ApiError } from "./types/error";

// Auth
export type {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  RegisterResponseUser,
} from "./types/auth";

// Stocks
export type {
  ForeignStockFlow,
  ForeignStocksResponse,
  TickerItem,
  TickersResponse,
  TopStockGroup,
  TopStockGroupType,
  TopStockItem,
  TopStocksResponse,
} from "./types/stocks";

// Market
export type {
  ExchangeRate,
  ExchangeRateResponse,
  InterestRate,
} from "./types/market";
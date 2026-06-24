/**
 * Barrel for the API client. Existing call sites import from
 * `@/lib/api` and get the `api` runtime object plus all types.
 */
export { api, API_BASE_URL } from "./client";
export type {
  ApiError,
  InterestRate,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  RegisterResponseUser,
  TickerItem,
  TickersResponse,
  TopStockGroup,
  TopStockGroupType,
  TopStockItem,
  TopStocksResponse,
} from "./types";

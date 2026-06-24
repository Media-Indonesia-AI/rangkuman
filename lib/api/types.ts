// ─── ERRORS ──────────────────────────────────────────────────────

export interface ApiError {
  status: number;
  message: string;
  /** Raw response body if available, for debugging. */
  body?: unknown;
}

// ─── AUTH ────────────────────────────────────────────────────────

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  /** Either the user's email or username. The server resolves which one it is. */
  identifier: string;
  password: string;
}

export interface RegisterResponseUser {
  id: string;
  email: string;
  username: string;
  name: string;
  googleId: string | null;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterResponse {
  user: RegisterResponseUser;
  setupToken: string;
  message: string;
}

// ─── TOP STOCKS ──────────────────────────────────────────────────

export interface TopStockItem {
  ticker: string;
  company_name: string;
  price: number;
  percent_change: number;
}

export type TopStockGroupType = "top-gainer" | "top-looser";

export interface TopStockGroup {
  type: TopStockGroupType;
  stocks: TopStockItem[];
}

/** Wire format the backend actually returns: `{ data: [...] }`. */
export interface TopStocksResponse {
  data: TopStockGroup[];
}

// ─── TICKERS ─────────────────────────────────────────────────────

/** Single entry from GET stocks/ticker — latest price and day change. */
export interface TickerItem {
  ticker: string;
  company_name: string;
  price: number;
  percent_change: number;
}

/** Wire format the backend actually returns: `{ data: [...] }`. */
export interface TickersResponse {
  data: TickerItem[];
}

// ─── INTEREST RATE ──────────────────────────────────────────────

/** Latest BI Rate snapshot returned by `GET interest-rate`. */
export interface InterestRate {
  /** ISO timestamp of the previous rate decision (the one being compared against). */
  last_rate_date: string;
  /** ISO timestamp of when this snapshot was generated. */
  date: string;
  /** Current BI Rate in percent (e.g. `5.75` = 5,75%). */
  rate: number;
  /** Change vs. the previous decision, in basis points (signed). */
  bps: number;
}

// ─── EXCHANGE RATE ──────────────────────────────────────────────

/**
 * One snapshot of cross-rates — each key is an ISO 4217 currency code,
 * each value is the rate in IDR per 1 unit of that currency
 * (e.g. `USD: 17950.1` means 1 USD = 17,950.1 IDR).
 *
 * Keys are not enumerated — the backend may add or remove currencies
 * at any time, so the type is intentionally open. Consumers that read
 * a specific currency should still handle the absent case
 * (e.g. `rates.USD ?? 0`).
 */
export type ExchangeRate = Record<string, number>;

/** Wire format the backend actually returns: `{ data: [snapshot] }`. */
export interface ExchangeRateResponse {
  data: ExchangeRate[];
}

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

/** GET stocks/ticker returns the list directly (not wrapped in `{ data }`). */
export type TickersResponse = TickerItem[];

/**
 * Types for `/wallet/*` endpoints — top-up bundles.
 *
 * Consumed by `../wallet.ts` (request functions) and downstream
 * components (`TopUpPage`, the onramp sheet, etc).
 *
 * Mirrors the comment-driven grouping used by `types/stocks.ts`,
 * `types/headline.ts`, and friends: each section gets a header,
 * one or more entity interfaces, and a `*Response` envelope for
 * the wire shape the backend actually returns.
 */

// ─── TOP-UP BUNDLES ─────────────────────────────────────────────

/**
 * One top-up bundle returned by `GET wallet/topup/bundle`.
 *
 * Bundles are the curated "Paket A / B / C" options the wallet
 * API surfaces — each one is a fixed (price, coin_amount) pair
 * the user can buy in a single transaction. The wallet backend
 * owns the catalogue (sort order, availability, pricing); the
 * front-end just renders them.
 *
 *   - `id`            — opaque bundle id from the backend
 *                       (mongo-style hash, e.g. `"6a75a1…"`);
 *                       forwarded on checkout to bind the
 *                       transaction to a specific bundle.
 *   - `code`          — short stable identifier (e.g. `"BUNDLE_A"`)
 *                       useful for analytics / dedup.
 *   - `name`          — display label (e.g. `"Paket A"`); already
 *                       localised in Indonesian by the backend.
 *   - `coin_amount`   — integer count of koin the buyer receives.
 *                       Always whole numbers — fractional coin
 *                       sales aren't supported.
 *   - `price`         — Rp price (integer IDR, no decimal subunits).
 *                       Inclusive of PPN at the API level, so the
 *                       `price` here matches the grand-total the
 *                       user pays; no separate tax line is needed
 *                       on the buy screen.
 *   - `sort`          — 1-based display order. Render ascending
 *                       so the API's "front" bundle lands first.
 */
export interface TopupBundle {
  id: string;
  code: string;
  name: string;
  base_coin_amount: number;
  add_up_coin_amount: number;
  coin_amount: number;
  price: number;
  sort: number;
}

/** Wire format for `GET wallet/topup/bundle` — same envelope as
 *  `TopStocksResponse` / `TickersResponse`: a `data` array of
 *  typed rows. */
export interface TopupBundlesResponse {
  data: TopupBundle[];
}

// ─── WALLET BALANCE ─────────────────────────────────────────────

/**
 * One unspent lot credited to the user's wallet. A wallet holds a
 * stack of lots — every top-up appends a new lot, every
 * consumption decrements `remaining_balance` from the oldest lot
 * first (FIFO). Consumers typically aggregate the lot list into a
 * single `balance` for display and walk the lot array only when
 * they need per-lot expiry semantics (e.g. "X koin hangus bulan
 * depan").
 *
 *   - `id`                  — opaque lot id from the backend.
 *   - `original_balance`    — koin credited when this lot was
 *                             purchased (whole-number count, same
 *                             unit as `Wallet.balance`).
 *   - `remaining_balance`   — koin still unspent on this lot.
 *                             `remaining_balance <= original_balance`
 *                             always; `0` means fully consumed.
 *   - `expire_at`           — ISO timestamp when this lot expires
 *                             and any `remaining_balance` is
 *                             forfeited. The backend enforces this
 *                             server-side; the front-end renders it
 *                             as a "hangus" countdown.
 */
export interface WalletLot {
  id: string;
  original_balance: number;
  remaining_balance: number;
  expire_at: string;
}

/**
 * The active user's wallet — current aggregate balance plus the
 * FIFO lot stack. Returned by `GET wallet` (no path segment — the
 * wallet endpoint resolves the active user from the auth header).
 *
 *   - `id`        — wallet id; stable across the user's lifetime
 *                   and forwarded when binding a top-up purchase
 *                   to this wallet.
 *   - `balance`   — current koin balance (sum of every lot's
 *                   `remaining_balance`). Already aggregated by
 *                   the backend — front-end never sums the lot
 *                   array itself.
 *   - `lots`      — FIFO lot stack, oldest first. May be empty
 *                   for a freshly-registered user who hasn't
 *                   topped up yet.
 */
export interface Wallet {
  id: string;
  balance: number;
  lots: WalletLot[];
}

/** Wire format for `GET wallet` — the wallet endpoint wraps the
 *  payload in a single-object `data` envelope (not an array) since
 *  the response is one wallet per active user. */
export interface WalletResponse {
  data: Wallet;
}

// ─── TRANSACTION HISTORY ────────────────────────────────────────

/**
 * Sub-object on a `WalletTransaction.metadata.qr_code.metadata`
 * field — the per-QR breakdown the backend stores when the user
 * pays the top-up invoice. Includes the VAT line (11% of the base
 * amount, same rate as the front-end's `PPN_RATE`) and the
 * pre-VAT "basic_fee" so consumers can show the tax split without
 * recomputing it.
 */
export interface WalletTransactionQrCodeMetadata {
  vat: number;
  user_id: string;
  basic_fee: number;
}

/**
 * `qr_code` block on a `WalletTransaction.metadata` — the QR
 * payload the payment gateway issued for this top-up. The
 * `external_id` matches the parent transaction's `payment_ref`,
 * so consumers can cross-reference if needed.
 */
export interface WalletTransactionQrCode {
  id: string;
  type: string;
  external_id: string;
  qr_string: string;
  metadata: WalletTransactionQrCodeMetadata;
}

/**
 * `payment_details` block — present on `COMPLETED` transactions
 * once the gateway has acknowledged the payment. `source` is the
 * payment method the user actually paid with (e.g. `"DANA"`),
 * `receipt_id` is the gateway-issued receipt id for support /
 * dispute flows. May be missing for still-pending or expired
 * transactions.
 */
export interface WalletTransactionPaymentDetails {
  source: string;
  receipt_id: string;
}

/**
 * `metadata` block on a `WalletTransaction` — passthrough from
 * the payment gateway. Includes the QR the user scanned, the
 * gateway event name (`"qr.payment"`), the gateway's authoritative
 * amount / status / created timestamp, and (on completion) the
 * `payment_details`. Treat as opaque on the front-end — fields
 * outside `qr_code` / `payment_details` are surfaced for
 * debugging only and may change without notice.
 *
 * Nullable on `WalletTransaction` (see below) — the gateway
 * may not have populated the block yet for pending / failed
 * invoices, so consumers must guard before reading.
 */
export interface WalletTransactionMetadata {
  id: string;
  event: string;
  amount: number;
  status: string;
  created: string;
  qr_code: WalletTransactionQrCode;
  payment_details?: WalletTransactionPaymentDetails;
}

/**
 * One top-up transaction returned by `GET wallet/transaction`
 * and `POST wallet/topup`. Captures the invoice the wallet API
 * created (`topup_amount` is IDR the user paid, `coin_amount` is
 * the koin credited before rounding — a `111000` IDR top-up lands
 * `33.333…` koin at the 3.000 Rp / koin rate), the payment-gateway
 * handoff (`payment_ref` / `payment_url` — the latter is a base64
 * PNG QR the front-end can show inline), and the lifecycle
 * timestamps (`expire_at` / `paid_at` / `created_at`).
 *
 * `status` is the wallet API's own status, not the gateway's —
 * it's `"success"` when the koin was credited, `"pending"` while
 * the gateway invoice is open, other values for expired / failed
 * invoices. `payment_url` is included so a re-open of an unpaid
 * invoice can re-display the same QR without a separate API call.
 *
 * Optional fields:
 *   - `paid_at`     — only set on completed (`status === "success"`)
 *                     transactions; pending / failed invoices have
 *                     no payment timestamp yet.
 *   - `metadata`    — `null`-able (not just optional) — the backend
 *                     doesn't populate the gateway passthrough for
 *                     freshly-created invoices (`POST wallet/topup`
 *                     returns a leaner row without it), so consumers
 *                     must guard before reading.
 */
export interface WalletTransaction {
  id: string;
  wallet_id: string;
  topup_amount: number;
  coin_amount: number;
  status: string;
  payment_ref: string;
  payment_url: string;
  metadata?: WalletTransactionMetadata | null;
  expire_at: string;
  paid_at?: string;
  created_at: string;
}

/** Wire format for `GET wallet/transaction` — paginated list of
 *  the active user's top-up invoices. */
export interface WalletTransactionHistoryResponse {
  data: WalletTransaction[];
}

/** Wire format for `POST wallet/topup` — a single freshly-created
 *  invoice. Same `WalletTransaction` shape as the history list,
 *  wrapped in a single-object `data` envelope (the endpoint
 *  creates one invoice per request, not a batch). */
export interface WalletTransactionResponse {
  data: WalletTransaction;
}

/**
 * Request body for `POST wallet/topup`. XOR union — exactly one
 * of `amount` or `bundle_code` must be supplied:
 *
 *   - `amount`      — when the user is topping up a custom koin
 *                     count outside the catalogue. Value is IDR
 *                     (e.g. `150000` for a 50-koin custom top-up
 *                     at the 3.000 Rp / koin rate), integer IDR
 *                     with no decimal subunits.
 *   - `bundle_code` — when the user picked a curated bundle
 *                     chip. Value is the bundle's `code`
 *                     (e.g. `"BUNDLE_A"`), resolved from
 *                     `GET wallet/topup/bundle`. The backend
 *                     applies the bundle's own price / coin
 *                     math — don't send `amount` alongside.
 *
 * `never` on the absent side makes the XOR compiler-enforced:
 * you can't accidentally send both, and TypeScript narrows the
 * shape correctly inside each branch of the dispatch.
 */
export type TopupRequest =
  | { amount: number; bundle_code?: never }
  | { bundle_code: string; amount?: never };
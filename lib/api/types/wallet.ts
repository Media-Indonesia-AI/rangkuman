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
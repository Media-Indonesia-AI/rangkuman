/**
 * Single source of truth for browser storage key names.
 *
 * Every localStorage / sessionStorage key the app touches lives
 * here. Consumers MUST import from this module rather than
 * hard-coding a string literal — otherwise renames, audits, and
 * the "clear all rangkuman-news:* data" devtool snippet in the
 * README all drift apart from the actual code.
 *
 * ─── Namespace ────────────────────────────────────────────────
 *
 * Keys live under the `rangkuman-news:*` prefix. The previous
 * `beritainvestor:*` namespace was retired in a hard cutover —
 * by deliberate decision, no migration shim was added: existing
 * user data (theme, watchlist, bookmarks, newsletter sub-
 * scription, auth session, `/saham` prefs) was left behind
 * under the old keys, and the app silently re-onboarded those
 * users as fresh visitors on first paint. The older
 * `berita-investor-saved` bookmarks key + its dedicated
 * `berita-investor:saved-changed` event were folded into the
 * new prefix at the same time.
 *
 * ─── Related change-notification events ───────────────────────
 *
 * Same-tab writes do not fire the browser's `storage` event in
 * the writer's tab. The hooks in `lib/hooks/*` therefore listen
 * to a custom `CustomEvent` for synchronous same-tab refresh.
 * The event names are colocated here because they're the
 * write-side counterpart to the keys themselves.
 */

/** Every localStorage key the app uses, grouped by concern. */
export const STORAGE_KEYS = {
  // ── Auth & session ────────────────────────────────────────────
  /** Active user session (`User`). Read on every API call to
   *  attach HTTP Basic auth; written by `loginWithIdentifier()`,
   *  `loginWithGoogle()`, `registerUser()`, and cleared by
   *  `logout()`. */
  user: "rangkuman-news:user",
  /** One-time setup token returned by `POST /auth/register`.
   *  Used to seed the verified email flow. */
  setupToken: "rangkuman-news:setupToken",
  /** Timestamp (ms since epoch) when the user explicitly dismissed
   *  the Google One Tap prompt on `/login`. The login page reads
   *  this via `isGoogleOneTapDismissed()` in `lib/auth.ts` and
   *  gates the prompt on it: a non-empty value within the last 30
   *  days suppresses the prompt. Stored as a string so it survives
   *  the `safeGetItem` / `safeSetItem` JSON-string serialization
   *  path without a separate numeric-encode layer. */
  googleOneTapDismissed: "rangkuman-news:google-one-tap-dismissed",

  // ── Watchlist ─────────────────────────────────────────────────
  /** Watchlist snapshot — `{ codes: string[], updatedAt: string }`.
   *  Read by `lib/hooks/useWatchlist.ts`; written by the watchlist
   *  mutators in `lib/auth.ts`. */
  watchlist: "rangkuman-news:watchlist",

  // ── Theme ─────────────────────────────────────────────────────
  /** `"light" | "dark"`. Read by the pre-hydration `<script>` in
   *  `app/layout.tsx` to prevent the wrong-theme flash, written by
   *  `components/ThemeToggle.tsx`. */
  theme: "rangkuman-news:theme",

  // ── Bookmarks ─────────────────────────────────────────────────
  /** Saved/bookmark list (`SavedItem[]`). Was `berita-investor-saved`
   *  under the previous namespace; renamed alongside the rest of
   *  the cutover. */
  saved: "rangkuman-news:saved",

  // ── Newsletter ────────────────────────────────────────────────
  /** Subscribed emails (`SubscriberEntry[]`). */
  newsletter: "rangkuman-news:newsletter",
  /** Pill-dismissal payload (`{ until: ISO string }`). */
  newsletterDismissed: "rangkuman-news:newsletter_dismissed",

  // ── /saham page state ─────────────────────────────────────────
  /** Active sub-tab on `/saham` (`"recap" | "sektor"`). */
  sahamTab: "rangkuman-news:saham-tab",
} as const;

/** Every sessionStorage key the app uses. Kept on its own object
 *  (rather than merged with `STORAGE_KEYS`) so callers can tell
 *  at a glance which storage surface they're touching — the two
 *  have very different semantics (localStorage persists across
 *  tabs and restarts; sessionStorage is scoped to one tab).
 *
 *  `authPrevPath` lives under a separate `rangkuman:*` prefix on
 *  purpose — sessionStorage is cleared on tab close, so the
 *  capture-prev-path use case is naturally isolated from the
 *  persistent localStorage namespace and doesn't share a prefix
 *  with it. */
export const SESSION_STORAGE_KEYS = {
  /** Last non-auth pathname, captured by `<PathnameTracker />`
   *  in the root layout and read by `getAuthRedirectTarget()`
   *  after a successful login or registration so the user lands
   *  back on the page they came from. */
  authPrevPath: "rangkuman:auth-prev-path",
} as const;

/** In-process `CustomEvent` name dispatched after every write
 *  that goes through `writeJson()` in `lib/auth.ts` /
 *  `lib/newsletter.ts`. Hooks subscribe to this in the same tab
 *  (the browser's `storage` event does NOT fire in the writer's
 *  tab) so they can re-read state synchronously after a mutation.
 *
 *  The `detail` payload is `{ key: string }` so subscribers can
 *  filter for the specific key they care about without re-reading
 *  the entire storage layer. */
export const STORAGE_EVENT = "rangkuman-news:storage";

/** Dedicated change-event for the bookmarks key. Same purpose as
 *  `STORAGE_EVENT` but kept on its own channel because the saved-
 *  list write path predates the shared helper and runs outside
 *  the auth/newsletter writeJson wrapper. Was
 *  `berita-investor:saved-changed` under the previous namespace;
 *  renamed alongside the rest of the cutover. */
export const SAVED_EVENT = "rangkuman-news:saved-changed";

/** Every key name as a string-literal union. Use this when a
 *  helper needs to accept "any key we own" as a parameter type. */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/** Session-storage counterpart to `StorageKey`. */
export type SessionStorageKey =
  (typeof SESSION_STORAGE_KEYS)[keyof typeof SESSION_STORAGE_KEYS];

/**
 * Ambient declarations for the Google Identity Services (GSI) client.
 *
 * The `accounts.google.com/gsi/client` script (loaded by
 * `<GoogleOAuthProvider />` from `@react-oauth/google`) attaches
 * `google.accounts.id` to the global `window`. The
 * `@react-oauth/google` library's own types describe the call-site
 * shapes (`IdConfiguration`, `PromptMomentNotification`, etc.) but
 * don't declare the `window.google` global, so any direct usage of
 * `window.google.accounts.id` from outside the library needs the
 * ambient declaration here.
 *
 * We only expose the surface we actually use (`prompt` / `cancel` /
 * `disableAutoSelect`) — the rest of the GSI client is intentionally
 * left untyped so it doesn't drift from the library's own decorators
 * or accidentally invite call sites that should go through the
 * library's React adapters instead.
 *
 * Hand-write the methods the project relies on rather than rely on
 * `any` — a `window.google.accounts.id.cancel()` in a login page
 * is a security-relevant affordance (forces the One Tap prompt
 * closed) and the type assertion should be honest about what it
 * does.
 */
interface GsiAccountsId {
  /** Re-trigger the One Tap prompt. Called after `resetOneTap()`
   *  to surface the prompt again for users who previously
   *  dismissed it. */
  prompt: () => void;
  /** Cancel a currently-displayed One Tap prompt. The cancellation
   *  produces a `PromptMomentNotification` with
   *  `getDismissedReason() === "cancel_called"`, which the login
   *  page uses to distinguish "user-initiated dimiss" from
   *  "self-initiated cancel" in its persistence filter. */
  cancel: () => void;
  /** Suppress One Tap auto-selection for the current session.
   *  Called when the user signs out so the next page load
   *  doesn't surface the prompt for a logged-out user. */
  disableAutoSelect: () => void;
}

interface Window {
  google?: {
    accounts: {
      id: GsiAccountsId;
    };
  };
}

/**
 * Safe wrappers around `window.localStorage` and
 * `window.sessionStorage` that swallow the security / availability
 * errors browsers can throw (private mode, blocked by policy,
 * quota exceeded, etc.).
 *
 * Helpers return `null` / `void` on failure rather than throwing —
 * callers can treat a missing write as a noop and a missing read
 * as "key not present" without a try/catch at each call site. This
 * kills the duplicated try/catch boilerplate that used to live at
 * every read/write in the consuming components.
 *
 * Both surfaces share the same contract on purpose: identical SSR
 * guard, identical error-swallowing policy. The naming distinguishes
 * them at a glance (`safeGetItem` = localStorage,
 * `safeSessionGetItem` = sessionStorage) so callers can't
 * accidentally write a persistent key into session storage or
 * vice-versa.
 *
 * Centralised here so the failure mode is documented once and
 * any future concern (quota telemetry, encryption, namespacing)
 * has a single place to land.
 */

export function safeGetItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    // localStorage may be disabled (private mode, blocked by
    // browser policy, etc.) — treat as "key not present".
    return null;
  }
}

export function safeSetItem(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* noop — storage may be full or disabled */
  }
}

export function safeRemoveItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* noop — storage may be disabled */
  }
}

/** `sessionStorage` counterpart to `safeGetItem`. sessionStorage is
 *  scoped to one tab and cleared on close, so it's the natural
 *  surface for transient data (e.g. the auth-prev-path capture) —
 *  but it shares the same failure modes as localStorage and the
 *  same SSR noop when called outside the browser. */
export function safeSessionGetItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    // sessionStorage may be disabled (private mode, blocked by
    // browser policy, etc.) — treat as "key not present".
    return null;
  }
}

export function safeSessionSetItem(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    /* noop — storage may be full or disabled */
  }
}

export function safeSessionRemoveItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    /* noop — storage may be disabled */
  }
}